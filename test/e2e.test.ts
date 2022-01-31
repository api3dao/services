import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import { chmodSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';
import { createTmpDir } from './utils';
import { getAvailableTemplates } from '../src/cli/cli';

const CLI_EXECUTABLE = `${__dirname}/../dist/cli/index.js`;
// Turning this flag to 'true' will print each command before executing it
// It might be useful to turn on, while debugging particular test.
const DEBUG_COMMANDS = false;

it('has disabled DEBUG_COMMANDS flag', () => {
  expect(DEBUG_COMMANDS).toBe(false);
});

type CommandArg = [string, string | string[] | number | boolean];
const execCommand = (command: string, ...args: CommandArg[]) => {
  const quote = (val: string) => `"${val}"`;
  const formattedArgs = args
    .map(([c, a]) => {
      // if args is array then quote each elem and separate them with space
      if (Array.isArray(a)) return `${c} ${a.map(quote).join(' ')}`;
      // otherwise just quote each elem and separate them with space
      else return `${c} ${quote(String(a))}`;
    })
    .join(' ');
  const formattedCommand = `${command} ${formattedArgs}`;
  if (DEBUG_COMMANDS) console.log(`Executing command: ${formattedCommand}`);
  try {
    return execSync(`${CLI_EXECUTABLE} ${formattedCommand}`).toString().trim();
  } catch (e: any) {
    // rethrow the output of the CLI
    throw new Error(e.stdout.toString().trim());
  }
};

describe('Beacon reader CLI', () => {
  beforeAll(() => {
    // By default the built CLI script is not executable and we would need to invoke it using node directly which has a
    // disadvantage that we are not testing that the shebang works properly.
    chmodSync(CLI_EXECUTABLE, '755');
  });

  it('shows help', () => {
    const output = execCommand('--help');
    expect(output).toMatchSnapshot();
  });

  it('shows available commands', () => {
    const output = execCommand('show-available-templates');
    expect(output).toEqual(['javascript-ethers'].join('\n'));
  });

  describe('interactive command', () => {
    const waitOnOutput = (childProcess: ChildProcessWithoutNullStreams) =>
      new Promise<string>((resolve) =>
        childProcess.stdout.once('readable', () => {
          const data = childProcess.stdout.read().toString();
          resolve(data);
        })
      );

    it('works', async () => {
      // Run the command in a child process so we can pipe stdin to it
      const childProcess = spawn(CLI_EXECUTABLE);

      // Write the path to the script
      const tmpDir = createTmpDir();
      childProcess.stdin.write(tmpDir + '\n');
      await waitOnOutput(childProcess);

      // Wait a few milliseconds so that the prompt asks for template
      await new Promise((res) => setTimeout(res, 500));

      // Choose the template to create (accept the default one)
      childProcess.stdin.write('\n');
      // Wait a few seconds until the script initializes the project
      await new Promise((res) => setTimeout(res, 5000));
      const output = await waitOnOutput(childProcess);

      expect(childProcess.kill()).toBe(true);
      expect(output).toContain(`Creating a new beacon reader app in ${chalk.green(tmpDir)}`);
      expect(output).toContain(`Successfully created and initialized a new project.`);
    }, 10_000);
  });

  it('parses command arguments', () => {
    const tmpDir = createTmpDir();
    const template = 'javascript-ethers';

    const output = execCommand('', ['--path', tmpDir], ['--template', template]);

    const lines = output.split('\n');
    expect(lines[0]).toContain(`Creating a new beacon reader app in ${chalk.green(tmpDir)}`);
    expect(lines[1]).toContain(`Successfully created and initialized a new project.`);
  });

  describe('templates are valid and working', () => {
    getAvailableTemplates().forEach((templateName) => {
      it(`tests ${templateName}`, () => {
        const tmpDir = createTmpDir();

        // 1. Create a repository based on the current template name
        execCommand('', ['--path', tmpDir], ['--template', templateName]);

        // 2. Change the current working directory to the newly created project folder
        process.chdir(tmpDir);

        // 3. Use "file:" dependency option for the services
        const packageJsonPath = join(tmpDir, 'package.json');
        const packageJson = readFileSync(packageJsonPath).toString();
        writeFileSync(
          packageJsonPath,
          packageJson.replace('api3dao/services#4cb79ffc406c4451c84accf42f99e6a1251a5799', join(__dirname, '../'))
        );

        // 4. Install the dependencies for the created project
        // Redirect the stderr of yarn install to /dev/null to avoid the output appearing in jest output
        const installOutput = execSync(`FORCE_COLOR=0 yarn install 2>/dev/null`).toString();
        expect(installOutput).toContain('success Saved lockfile.');

        // 5. Run the sample beacon reader tests
        const testOutput = execSync(`FORCE_COLOR=0 yarn test`).toString();
        expect(testOutput).toContain('1 passing');

        // 6. Deploy the beacon reader (and mocked beacon server)
        const deployOutput = execSync(`FORCE_COLOR=0 yarn deploy`).toString();
        expect(deployOutput).toContain('BeaconReaderExample deployed to:');

        // 7. Read a value from the mocked beacon server
        const readBeaconOutput = execSync(`yarn read-beacon`).toString();
        expect(readBeaconOutput).toContain('Beacon value:');

        // 8. TODO: Read a value from a beacon that is already deployed. (use services repo for this)
      });
    });
  });
});
