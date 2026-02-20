const { execSync } = require('child_process');
const fs = require('fs');
const { join } = require('path');

console.log('Copying the zebra model...');

const testDirectory = join(__dirname, '..', 'test');

const paramsSourceDirectory = join(
  __dirname,
  '..',
  '..',
  '..',
  'lib',
  'common'
);

const testDataSource = join(
  __dirname,
  '..',
  '..',
  '..',
  'resources',
  '.test',
  'test_data.json'
);

try {
  fs.mkdirSync(testDirectory, { recursive: true });

  fs.readdirSync(paramsSourceDirectory).forEach(file => {
    fs.copyFileSync(
      join(paramsSourceDirectory, file),
      join(testDirectory, 'params', file)
    );

    const outName = file.replace(".pv", ".js")
    execSync(`npx pvbase64 -i ./test/params/${file} -o ./test/params/${outName}`)
  });

  fs.copyFileSync(testDataSource, join(testDirectory, 'test_data.json'));
} catch (error) {
  console.error(error);
}

console.log('... Done!');
