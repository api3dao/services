import klawSync from 'klaw-sync';
import chalk from 'chalk';
import { createProjectUsingTemplate, getAvailableTemplates, getTemplatePath } from './cli';
import { createTmpDir } from '../../test/utils';

const listFilesRecursively = (path: string) =>
  klawSync(path)
    .map((file) => file.path)
    .map((p) => p.split(path)[1]); // We only care about the filename

it('tests createProjectUsingTemplate', () => {
  const tmpDir = createTmpDir();
  const template = 'javascript-ethers';
  jest.spyOn(global.console, 'info');

  createProjectUsingTemplate(tmpDir, template);

  expect(console.info).toHaveBeenCalledTimes(2);
  expect(console.info).toHaveBeenNthCalledWith(1, `Creating a new beacon reader app in ${chalk.green(tmpDir)}`);
  expect(console.info).toHaveBeenNthCalledWith(2, 'Successfully created and initialized a new project.');
  // Testing that the "template" is functional is performed in e2e tests in "../../test". Here we only check that all
  // files were copied
  expect(listFilesRecursively(tmpDir)).toEqual(listFilesRecursively(getTemplatePath(template)));
});

it('tests getAvailableTemplates', () => {
  expect(getAvailableTemplates()).toEqual(['javascript-ethers']);
});

it('tests getTemplatePath', () => {
  expect(getTemplatePath('my-template').endsWith('/templates/my-template')).toBe(true);
});
