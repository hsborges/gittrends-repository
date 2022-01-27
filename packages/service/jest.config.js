/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  transform: tsjPreset.transform,
  // preset: 'ts-jest',
  preset: '@shelf/jest-mongodb',
  // testEnvironment: 'node',
  testPathIgnorePatterns: ['/dist', '/node_modules'],
  testTimeout: 60000
};
