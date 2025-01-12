import { readdirSync, readFileSync } from "fs";
import { join, relative } from "path";
import * as prettier from "prettier";
import { compile, CompilerOptions } from "../src/compile";

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
    // e.g. "variable-declaration/array-pattern/code.js" => ["variable-declaration","array-pattern","code.js"]
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
 * Actually compiles the input, reads expected output, formats both,
 * and does the jest `expect(...)`.
 */
async function runCompileTest(
  input: string,
  output: string,
  options: CompilerOptions,
) {
  const actualCode = compile(input, options);

  const expectedCode = readFileSync(output, "utf-8").trim();
  const formattedActual = await prettier.format(actualCode, {
    parser: "babel",
  });
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
  options: CompilerOptions,
  nodeName?: string,
) {
  const subDirs = Object.keys(tree).filter((k) => k !== "__fixtures");
  const fixtures = tree.__fixtures ?? [];

  // If exactly one fixture and no subdirectories, make a single test (no describe)
  if (subDirs.length === 0 && fixtures.length === 1) {
    const { input, output } = fixtures[0];
    test(nodeName ?? getFolderName(input), async () => {
      await runCompileTest(input, output, options);
    });
    return;
  }

  // Otherwise, create a describe block if we have a nodeName
  if (nodeName) {
    describe(nodeName, () => {
      // Add tests for each fixture in this directory
      for (const { input, output } of fixtures) {
        test(getFolderName(input), async () => {
          await runCompileTest(input, output, options);
        });
      }
      // Recurse for subdirectories
      for (const subDir of subDirs) {
        addTestSuites(tree[subDir] as TreeNode, options, subDir);
      }
    });
  } else {
    // Top-level root: no named describe
    // Add any top-level fixtures as tests
    for (const { input, output } of fixtures) {
      test(getFolderName(input), async () => {
        await runCompileTest(input, output, options);
      });
    }
    // Recurse on subDirs
    for (const subDir of subDirs) {
      addTestSuites(tree[subDir] as TreeNode, options, subDir);
    }
  }
}

/**
 * MAIN EXPORTED FUNCTION:
 *
 * Call this in your .test.ts file with a directory (e.g. `__dirname`).
 * It will:
 *   1) Find all fixtures under that directory
 *   2) Build a nested tree structure
 *   3) Add describe/test suites so that Jest can run them
 *
 * Example usage in a .test.ts file:
 *    import { testFixtures } from "./somewhere/fixture-tester";
 *    testFixtures(__dirname, { enableConstantPropagationPass: true });
 */
export function testFixtures(directory: string, options: CompilerOptions) {
  const allFixtures = findFixtures(directory);
  const tree = buildTreeFromFixtures(directory, allFixtures);
  addTestSuites(tree, options);
}
