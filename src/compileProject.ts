import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { compile, CompilerOptions, CompilerOptionsSchema } from "./compile";
import { glob } from "glob";

export interface ProjectCompilerOptions extends CompilerOptions {
  srcDir: string;
  outDir: string;
  exclude?: RegExp[];
  excludeContentPatterns?: string[];
}

export interface FileResult {
  file: string;
  status: "compiled" | "copied" | "skipped";
  error?: string;
}

export function compileProject(options: ProjectCompilerOptions): FileResult[] {
  const {
    srcDir,
    outDir,
    exclude = [],
    excludeContentPatterns = [],
    ...compilerOptions
  } = options;

  const resolvedSrc = resolve(srcDir);
  const resolvedOut = resolve(outDir);

  const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
    cwd: resolvedSrc,
    ignore: ["**/*.d.ts"],
  });

  const results: FileResult[] = [];

  for (const file of files) {
    const absInput = join(resolvedSrc, file);
    const absOutput = join(resolvedOut, file);

    // Ensure output directory exists
    mkdirSync(dirname(absOutput), { recursive: true });

    // Check exclusion patterns
    const excluded = exclude.some((pattern) => pattern.test(file));
    if (excluded) {
      // Copy file as-is
      writeFileSync(absOutput, readFileSync(absInput));
      results.push({ file, status: "copied" });
      continue;
    }

    // Check content-based exclusion
    const content = readFileSync(absInput, "utf-8");
    const contentExcluded = excludeContentPatterns.some((pattern) =>
      content.includes(pattern),
    );
    if (contentExcluded) {
      writeFileSync(absOutput, content);
      results.push({ file, status: "copied" });
      continue;
    }

    try {
      const code = compile(
        absInput,
        CompilerOptionsSchema.parse(compilerOptions),
      );

      writeFileSync(absOutput, code);
      results.push({ file, status: "compiled" });
    } catch (err: unknown) {
      // On failure, copy original file so build doesn't break
      writeFileSync(absOutput, content);
      results.push({
        file,
        status: "skipped",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
