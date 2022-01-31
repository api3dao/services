import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export const createTmpDir = (dirName = 'beacon-reader-test') => mkdtempSync(join(tmpdir(), dirName));
