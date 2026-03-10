import { existsSync } from "fs";
import { createRequire } from "module";

/**
 * Resolves an import path to an absolute file path, preferring ESM (.mjs) entry points.
 *
 * Strategy: use require.resolve() to find the package, then check if a .mjs
 * sibling exists (common dual-publish pattern: index.js + index.mjs).
 */
export function resolveModulePath(
  importPath: string,
  fromPath: string,
): string {
  try {
    const require = createRequire(fromPath);
    const resolved = require.resolve(importPath);

    // Check for .mjs sibling (e.g. dist/index.js → dist/index.mjs)
    const mjsSibling = resolved.replace(/\.js$/, ".mjs");
    if (mjsSibling !== resolved && existsSync(mjsSibling)) {
      return mjsSibling;
    }

    return resolved;
  } catch {
    return importPath;
  }
}
