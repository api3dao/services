import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
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
    execSync(`chmod +x ${CLI_EXECUTABLE}`);
  });

  it('shows help', () => {
    const output = execCommand('--help');
    expect(output).toMatchSnapshot();
  });

  it('shows available commands', () => {
    const output = execCommand('show-available-templates');
    expect(output).toEqual(['javascript-ethers-hardhat'].join('\n'));
  });

  it('parses command arguments', () => {
    const tmpDir = createTmpDir();
    const template = 'javascript-ethers-hardhat';

    const output = execCommand('', ['--path', tmpDir], ['--template', template]);

    const lines = output.split('\n');
    expect(lines[0]).toContain(`Creating a new beacon reader app in ${chalk.green(tmpDir)}`);
    expect(lines[1]).toContain(`Successfully created and initialized a new project.`);
  });

  it('accepts shorthands for parameters', () => {
    const tmpDir = createTmpDir();
    const template = 'javascript-ethers-hardhat';

    const output = execCommand('', ['-p', tmpDir], ['-t', template]);

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
          packageJson.replace('"@api3/services": "^0.1.1"', `"@api3/services": "file:${join(__dirname, '../')}"`)
        );

        // 4. Install the dependencies for the created project
        // Redirect the stderr of yarn install to /dev/null to avoid the output appearing in jest output
        const installOutput = execSync(`FORCE_COLOR=0 yarn install 2>/dev/null`).toString();
        expect(installOutput).toContain('success Saved lockfile.');

        // 5. Run the sample beacon reader tests
        const testOutput = execSync(`FORCE_COLOR=0 yarn test`).toString();
        expect(testOutput).toContain('1 passing');

        // 6. Deploy the beacon reader (and mocked beacon server)
        const deployOutput = execSync(`FORCE_COLOR=0 yarn deploy --network localhost`).toString();
        expect(deployOutput).toContain('BeaconReaderExample deployed to:');

        // 7. Read a value from the mocked beacon server
        const readBeaconOutput = execSync(`yarn read-beacon --network localhost`).toString();
        expect(readBeaconOutput).toContain('Beacon value:');
      });
    });
    // TODO: Read a value from a beacon that is already deployed.
  });
});
