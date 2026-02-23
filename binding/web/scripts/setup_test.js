const { execSync } = require('child_process');
const fs = require('fs');
const { join } = require('path');

console.log('Copying the zebra model...');

const testDirectory = join(__dirname, '..', 'test');
const fixturesDirectory = join(__dirname, '..', 'cypress', 'fixtures', 'resources');

const paramsSourceDirectory = join(
  __dirname,
  '..',
  '..',
  '..',
  'lib',
  'common'
);

const sourceDirectory = join(
  __dirname,
  '..',
  '..',
  '..',
  'resources',
  '.test',
);

try {
  fs.mkdirSync(join(testDirectory, 'params'), { recursive: true });

  fs.readdirSync(paramsSourceDirectory).forEach(file => {
    fs.copyFileSync(
      join(paramsSourceDirectory, file),
      join(testDirectory, 'params', file)
    );

    const outName = file.replace(".pv", ".js")
    execSync(`npx pvbase64 -i ./test/params/${file} -o ./test/params/${outName}`)
  });

  fs.mkdirSync(join(fixturesDirectory, '.test'), { recursive: true });
  fs.copyFileSync(join(sourceDirectory, 'test_data.json'), join(fixturesDirectory, '.test', 'test_data.json'));
} catch (error) {
  console.error(error);
}

console.log('... Done!');
