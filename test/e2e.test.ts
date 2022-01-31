import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import { chmodSync } from 'fs';
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

  describe('templates are functional', () => {
    getAvailableTemplates().forEach((templateName) => {
      it(`tests ${templateName}`, () => {
        const tmpDir = createTmpDir();

        // 1. Create a repository based on the current template name
        execCommand('', ['--path', tmpDir], ['--template', templateName]);

        // 2. Install the dependencies for the created project
        process.chdir(tmpDir);
        // TODO: Is it OK to be opinionated about yarn or shall we also have npm templates?
        // Redirect the stderr of yarn install to /dev/null to avoid the output appearing in jest output
        const installOutput = execSync(`FORCE_COLOR=0 yarn install 2>/dev/null`).toString();
        expect(installOutput).toContain('success Saved lockfile.');

        // 3. Run the sample beacon reader tests
        // TODO: This should be a nicer script inside the package.json of the template
        const testOutput = execSync(`FORCE_COLOR=0 npx hardhat test test/BeaconReaderExample.test.js`).toString();
        expect(testOutput).toContain('1 passing');

        // 4. Deploy the beacon reader (and mocked beacon server) and read a value from it
        // TODO: This should be a nicer script inside the package.json of the template
        const scriptOutput = execSync(
          `FORCE_COLOR=0 npx hardhat run scripts/deploy.js && npx hardhat run scripts/read-beacon.js`
        ).toString();
        expect(scriptOutput).toContain('BeaconReaderExample deployed to:');
        expect(scriptOutput).toContain('Beacon value:');

        // 5. TODO: Read a value from a beacon that is already deployed. (use services repo for this)
      });
    });
  });
});
