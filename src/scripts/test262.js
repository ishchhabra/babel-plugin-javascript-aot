import boxen from "boxen";
import chalk from "chalk";
import { program } from "commander";
import figures from "figures";
import { readFileSync } from "fs";
import logUpdate from "log-update";
import vm from "node:vm";
import ora from "ora";
import { join } from "path";
import TestStream from "test262-stream";
import { compile } from "../compile";

program
  .option(
    "-d, --dir <directory>",
    "Test262 directory",
    join(process.cwd(), "test262"),
  )
  .option("-t, --timeout <ms>", "Test timeout in milliseconds", 2000)
  .option("-f, --filter <pattern>", "Filter tests by pattern")
  .option("-v, --verbose", "Show verbose output")
  .parse(process.argv);

const options = program.opts();

const test262Dir = options.dir;
const testTimeout = parseInt(options.timeout, 10);
const testFilter = options.filter ? new RegExp(options.filter) : null;

const harnessAssertCode = readFileSync(
  join(test262Dir, "harness", "assert.js"),
  "utf-8",
);
const harnessStaCode = readFileSync(
  join(test262Dir, "harness", "sta.js"),
  "utf-8",
);

let passed = 0;
let failed = 0;
let skipped = 0;
let currentTest = "";
let failedTests = [];
const startTime = Date.now();

const spinner = ora({
  text: "Initializing test runner...",
  color: "blue",
}).start();

const stream = new TestStream(test262Dir, { includesDir: testFilter });

const updateStatus = () => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const total = passed + failed;

  const stats = [
    `${chalk.green(`${figures.tick} Passed:`)} ${passed}`,
    `${chalk.red(`${figures.cross} Failed:`)} ${failed}`,
    testFilter
      ? `${chalk.yellow(`${figures.arrowRight} Skipped:`)} ${skipped}`
      : "",
    `${chalk.blue(`${figures.clock} Time:`)} ${elapsed}s`,
  ]
    .filter(Boolean)
    .join("\n");

  spinner.text = currentTest
    ? `Running: ${currentTest}`
    : "Processing tests...";

  logUpdate(`
${boxen(stats, {
  padding: 1,
  margin: 1,
  borderStyle: "round",
  borderColor: "blue",
  title: `Test262 Runner${total ? ` (${total} tests)` : ""}`,
  titleAlignment: "center",
})}
  `);
};

stream.on("data", ({ file, contents }) => {
  if (testFilter && !testFilter.test(file)) {
    skipped++;
    return;
  }

  currentTest = file;
  updateStatus();

  try {
    const transformedTest = compile(join(test262Dir, file));
    const code = harnessAssertCode + harnessStaCode + transformedTest;
    const script = new vm.Script(code);

    const context = vm.createContext();
    script.runInContext(context, { timeout: testTimeout });

    passed++;
    if (options.verbose) {
      currentTest = `${chalk.green(figures.tick)} ${file}`;
      updateStatus();
    }
  } catch (error) {
    failed++;
    failedTests.push({ file, error: error.message });

    if (options.verbose) {
      currentTest = `${chalk.red(figures.cross)} ${file} - ${error.message}`;
      updateStatus();
    }
  }

  if (!options.verbose) {
    updateStatus();
  }
});

stream.on("end", () => {
  spinner.stop();
  currentTest = "";
  updateStatus();
  logUpdate.done();

  console.log(chalk.bold("\n📊 Test Summary:"));
  console.log(chalk.green(`${figures.tick} ${passed} passed`));

  if (failed > 0) {
    console.log(chalk.red(`${figures.cross} ${failed} failed`));
    console.log(chalk.bold("\n❌ Failed Tests:"));

    failedTests.slice(0, 10).forEach(({ file, error }, index) => {
      console.log(`${index + 1}. ${chalk.red(file)}\n   ${chalk.gray(error)}`);
    });

    if (failedTests.length > 10) {
      console.log(chalk.gray(`...and ${failedTests.length - 10} more`));
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(chalk.blue(`\n⏱️  Total time: ${duration} seconds`));

  process.exit(failed > 0 ? 1 : 0);
});

stream.on("error", (error) => {
  spinner.fail(`Error running tests: ${error.message}`);
  process.exit(1);
});

process.on("SIGINT", () => {
  spinner.stop();
  console.log(chalk.yellow("\n\nTest run interrupted."));
  process.exit(2);
});
