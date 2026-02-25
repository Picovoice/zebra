const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const testData = require("../../../resources/.test/test_data.json");

const languagePairs = {};
for (const t of testData.tests.translation_tests) {
  languagePairs[t.source] = Object.keys(t.translations);
}

function prettifyLanguagePairs() {
  let res = "";
  res += " Source | Targets\n";
  res += " ----------------\n";
  for (const [k, v] of Object.entries(languagePairs)) {
    res += ` ${k}     | [${v.join(",")}]\n`
  }
  return res;
}

const source = process.argv.slice(2)[0];
const target = process.argv.slice(2)[1];

if (!source || !target || !(source in languagePairs) || !languagePairs[source].includes(target)) {
  console.error(
    `Choose the source/target language you would like to run the demo in with "yarn start [source] [target]".
Available pairs are:\n\n${prettifyLanguagePairs()}`,
  );
  process.exit(1);
}

const rootDir = path.join(__dirname, "..", "..", "..");

let outputDirectory = path.join(__dirname, "..", "models");
if (fs.existsSync(outputDirectory)) {
  fs.readdirSync(outputDirectory).forEach((f) => {
    fs.unlinkSync(path.join(outputDirectory, f));
  });
} else {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

const modelDir = path.join(rootDir, "lib", "common");
const modelName = `zebra_params_${source}_${target}.pv`;
fs.copyFileSync(
  path.join(modelDir, modelName),
  path.join(outputDirectory, modelName),
);

fs.writeFileSync(
  path.join(outputDirectory, "zebraModel.js"),
  `const zebraModel = {
  publicPath: "models/${modelName}",
  forceWrite: true,
};

(function () {
  if (typeof module !== "undefined" && typeof module.exports !== "undefined")
    module.exports = zebraModel;
})();`,
);

child_process.execSync(`node server.js -a localhost -p 5000`, {
  shell: true,
  stdio: "inherit",
});
