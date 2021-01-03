import glob from 'glob';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import * as TJS from 'typescript-json-schema';

const settings: TJS.PartialArgs = { required: true };
const compilerOptions: TJS.CompilerOptions = { strictNullChecks: true, removeComments: true };

const files = glob.sync('interfaces/*.ts', { ignore: '**/index.ts' });

const program = TJS.getProgramFromFiles(
  files.map((file) => resolve(file)),
  compilerOptions,
  __dirname
);

const schema = TJS.generateSchema(program, '*', settings);
writeFileSync(resolve('schemas.json'), JSON.stringify(schema, null, '  '));
