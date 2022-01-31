import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import klawSync from 'klaw-sync';
import chalk from 'chalk';
import { createProjectUsingTemplate, getAvailableTemplates, getTemplatePath } from './cli';

const listFilesRecursively = (path: string) =>
  klawSync(path)
    .map((file) => file.path)
    .map((p) => p.split(path)[1]);

it('tests createProjectUsingTemplate', () => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'beacon-reader-test'));
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
