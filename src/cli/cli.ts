import { mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import prompts, { PromptObject } from 'prompts';
import { copySync } from 'fs-extra';
import chalk from 'chalk';
import { go, isGoSuccess } from '../utils';

const promptQuestions = (questions: PromptObject[]) =>
  prompts(questions, {
    // https://github.com/terkelg/prompts/issues/27#issuecomment-527693302
    onCancel: () => {
      throw new Error('Aborted by the user');
    },
  });

const createCliOption = (name: string) => ({
  title: name,
  value: name,
});

const TEMPLATE_DIR = join(__dirname, '../../templates');
export const getAvailableTemplates = () => readdirSync(TEMPLATE_DIR);
export const getTemplatePath = (template: string) => join(TEMPLATE_DIR, template);

// TODO: test
export const createProjectUsingTemplate = (path: string, template: string) => {
  console.info(`Creating a new beacon reader app in ${chalk.green(path)}`);

  mkdirSync(path, { recursive: true });
  copySync(getTemplatePath(template), path);

  // TODO: install dependencies

  console.info(`Successfully created and initialized a new project.`);
};

export const createCli = () =>
  yargs(hideBin(process.argv))
    .command(
      // The name of the cli binary is "create-beacon-reader-app" and it should generate the without the need to specify a
      // command. See: https://github.com/yargs/yargs/blob/main/docs/advanced.md#default-commands
      '$0',
      'Create a project skeleton for an application that reads a value from beacon',
      {
        path: {
          description:
            "Path to a directory in which to create a project. The directory will be created if it doesn't exist yet.",
          demandOption: false,
          type: 'string',
        },
        template: {
          description:
            'The name of the template to be used. Use the "show-available-templates" command to list the available options.',
          demandOption: false,
          type: 'string',
        },
      },
      // TODO: Test interactivity
      async (args) => {
        // We validate the template first, because we want to show the output of "--help" command before we prompt the
        // user for questions. We do this because the mixed output of "--help" and prompts doesn't look good.
        const templates = getAvailableTemplates();
        if (args.template && !templates.includes(args.template)) throw new Error(`Unknown template: ${args.template}`);

        const goResult = await go(
          promptQuestions([
            {
              type: args.path ? null : 'text',
              name: 'path',
              message: [
                'Please, specify a path to the directory in which to create the project.',
                "(The directory will be created if it doesn't exist)",
              ].join('\n'),
            },
            {
              type: args.template ? null : 'select',
              name: 'template',
              message: 'Please, pick one of the available templates from the list',
              choices: templates.map(createCliOption),
            },
          ])
        );

        // An error here means the user cancelled the prompt question (e.g. ctrl+c).
        if (!isGoSuccess(goResult)) return;
        // We need to spread the parameters from "yargs" since if a user defined "path" as argument it will not be part
        // of the result from question prompt.
        const { path, template } = { ...args, ...goResult.data } as Record<string, string>;

        createProjectUsingTemplate(path, template);
      }
    )
    .command('show-available-templates', 'Show the list of available template options', {}, () => {
      console.info(getAvailableTemplates().join('\n'));
    })
    .example([
      ['$0', 'Run the interactive version of the CLI'],
      ['$0 --path="."', 'Create the project in the current directory'],
      [
        `$0 --path="my-app" --template="${getAvailableTemplates()[0]}"`,
        'Create the project inside the "my-app" directory',
      ],
    ])
    .help()
    .recommendCommands()
    .strict()
    .wrap(120).argv;
