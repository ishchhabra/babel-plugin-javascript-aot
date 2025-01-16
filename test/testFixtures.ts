// testFixtures.ts

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { merge } from "lodash-es";
import { dirname, join, relative } from "path";
import * as prettier from "prettier";
import {
  compile,
  CompilerOptions,
  CompilerOptionsSchema,
} from "../src/compile";

/**
 * Represents a single fixture file pair:
 * - input (path to code.js)
 * - output (path to output.js)
 */
interface Fixture {
  input: string;
  output: string;
}

/**
 * Each directory node can have:
 * - An array of fixtures (`__fixtures`), plus
 * - Zero or more subdirectories keyed by name.
 */
interface TreeNode {
  __fixtures?: Fixture[];
  [key: string]: TreeNode | Fixture[] | undefined;
}

/**
 * Safely reads and parses JSON from a file, returning undefined if the file
 * doesn't exist or if parsing fails.
 */
function safeReadJson(filePath: string): CompilerOptions | undefined {
  if (!existsSync(filePath)) return undefined;
  try {
    return CompilerOptionsSchema.parse(
      JSON.parse(readFileSync(filePath, "utf-8")),
    );
  } catch {
    return undefined;
  }
}

/**
 * Traverses from `rootDir` up to `testDir`, collecting any `options.json` along the way,
 * and merges them (outer → inner) into a single CompilerOptions object.
 */
function loadOptionsChain(
  rootDir: string,
  testDir: string,
  baseOptions: CompilerOptions,
): CompilerOptions {
  const dirs: string[] = [];
  let current = testDir;

  while (true) {
    dirs.push(current);
    if (current === rootDir) break;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  // Reverse so we apply outermost first, then innermost
  dirs.reverse();

  // Start with a copy of baseOptions
  let merged = { ...baseOptions };

  for (const dir of dirs) {
    const localOpts = safeReadJson(join(dir, "options.json"));
    if (localOpts && typeof localOpts === "object") {
      merged = merge({}, merged, localOpts);
    }
  }
  return merged;
}

/**
 * A helper that recursively collects all fixtures under `dir`.
 * Looks for `code.js` in a folder, and assumes `output.js` is next to it.
 */
function findFixtures(dir: string): Fixture[] {
  const fixtures: Fixture[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subdir = join(dir, entry.name);
      fixtures.push(...findFixtures(subdir));
    } else if (entry.name === "code.js") {
      const outputPath = join(dir, "output.js");
      fixtures.push({
        input: join(dir, entry.name),
        output: outputPath,
      });
    }
  }
  return fixtures;
}

/**
 * Converts a flat list of fixtures into a nested structure based on subfolders.
 */
function buildTreeFromFixtures(dir: string, fixtures: Fixture[]): TreeNode {
  const root: TreeNode = {};
  for (const { input, output } of fixtures) {
    // Convert to relative path so it doesn't show the full absolute path
    const relPath = relative(dir, input);
    // e.g. "variable-declaration/array-pattern/code.js"
    //      => ["variable-declaration","array-pattern","code.js"]
    const parts = relPath.split("/");
    parts.pop(); // remove "code.js"

    let currentNode: TreeNode = root;
    for (const part of parts) {
      if (!currentNode[part]) {
        currentNode[part] = {};
      }
      currentNode = currentNode[part] as TreeNode;
    }

    if (!currentNode.__fixtures) {
      currentNode.__fixtures = [];
    }
    currentNode.__fixtures.push({ input, output });
  }
  return root;
}

/**
 * Returns the parent folder's name for use in the test label.
 * e.g. "variable-declaration/array-pattern/code.js" => "array-pattern"
 */
function getFolderName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 2] || "unknown";
}

/**
 * Actually compiles the input, reads/creates expected output, formats both,
 * and does the jest `expect(...)`.
 */
async function runCompileTest(
  input: string,
  output: string,
  options: CompilerOptions,
) {
  const actualCode = compile(input, options);

  const formattedActual = await prettier.format(actualCode, {
    parser: "babel",
  });

  const outputExists = existsSync(output);
  if (
    !outputExists &&
    expect.getState().snapshotState._updateSnapshot == "new"
  ) {
    writeFileSync(output, formattedActual, "utf8");
    console.info(`[INFO] Created missing fixture file at: ${output}`);
  }

  const expectedCode = readFileSync(output, "utf-8").trim();
  const formattedExpected = await prettier.format(expectedCode, {
    parser: "babel",
  });

  expect(formattedActual).toBe(formattedExpected);
}

/**
 * Recursively creates describe/test blocks from the tree.
 * - If a folder has exactly one fixture and no subfolders, it becomes a single test line.
 * - If a folder has multiple fixtures or subfolders, it becomes a describe(...).
 */
function addTestSuites(
  tree: TreeNode,
  baseOptions: CompilerOptions,
  nodeName?: string,
  rootDir?: string,
  currentDir?: string,
) {
  const subDirs = Object.keys(tree).filter((k) => k !== "__fixtures");
  const fixtures = tree.__fixtures ?? [];

  // If exactly one fixture and no subdirectories, single test
  if (subDirs.length === 0 && fixtures.length === 1) {
    const { input, output } = fixtures[0];
    test(nodeName ?? getFolderName(input), async () => {
      // Load merged options for this fixture's directory
      const localOptions = loadOptionsChain(
        rootDir!,
        dirname(input),
        baseOptions,
      );
      await runCompileTest(input, output, localOptions);
    });
    return;
  }

  // Otherwise, create a describe block if we have a nodeName
  if (nodeName) {
    describe(nodeName, () => {
      // Add tests for each fixture in this directory
      for (const { input, output } of fixtures) {
        test(getFolderName(input), async () => {
          const localOptions = loadOptionsChain(
            rootDir!,
            dirname(input),
            baseOptions,
          );
          await runCompileTest(input, output, localOptions);
        });
      }
      // Recurse for subdirectories
      for (const subDir of subDirs) {
        const nextDir = join(currentDir ?? "", subDir);
        addTestSuites(
          tree[subDir] as TreeNode,
          baseOptions,
          subDir,
          rootDir,
          nextDir,
        );
      }
    });
  } else {
    // Top-level root: no named describe
    for (const { input, output } of fixtures) {
      test(getFolderName(input), async () => {
        const localOptions = loadOptionsChain(
          rootDir!,
          dirname(input),
          baseOptions,
        );
        await runCompileTest(input, output, localOptions);
      });
    }
    // Recurse on subdirectories
    for (const subDir of subDirs) {
      const nextDir = join(currentDir ?? "", subDir);
      addTestSuites(
        tree[subDir] as TreeNode,
        baseOptions,
        subDir,
        rootDir,
        nextDir,
      );
    }
  }
}

/**
 * MAIN EXPORTED FUNCTION:
 *
 * Call this in your Jest test file with a directory (e.g. `__dirname`):
 *   testFixtures(__dirname, { enableConstantPropagationPass: true });
 *
 * It will:
 *   1) Find all fixtures under the directory (look for `code.js`)
 *   2) Build a nested tree structure
 *   3) Dynamically add describe/test blocks for each fixture/subdirectory
 *   4) Merge any `options.json` from outer → inner directories for each test
 *   5) If `output.js` is missing and `JEST_UPDATE_SNAPSHOTS` is true, create it
 *      using the compiled code's actual output.
 */
export function testFixtures(
  directory: string,
  baseOptions: CompilerOptions = CompilerOptionsSchema.parse({}),
) {
  const allFixtures = findFixtures(directory);
  const tree = buildTreeFromFixtures(directory, allFixtures);
  addTestSuites(tree, baseOptions, undefined, directory, directory);
}
