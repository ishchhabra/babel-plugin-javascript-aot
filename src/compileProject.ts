import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { CompilerOptions, CompilerOptionsSchema } from "./compile";
import { CodeGenerator } from "./backend/CodeGenerator";
import { ProjectBuilder } from "./frontend/ProjectBuilder";
import { Pipeline } from "./pipeline/Pipeline";
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

  // Partition files into compilable entries vs excluded/copied
  const entryFiles: string[] = [];
  const copiedFiles: string[] = [];

  for (const file of files) {
    if (exclude.some((pattern) => pattern.test(file))) {
      copiedFiles.push(file);
      continue;
    }

    const content = readFileSync(join(resolvedSrc, file), "utf-8");
    if (excludeContentPatterns.some((pattern) => content.includes(pattern))) {
      copiedFiles.push(file);
      continue;
    }

    entryFiles.push(file);
  }

  const results: FileResult[] = [];

  // Copy excluded files as-is
  for (const file of copiedFiles) {
    const absOutput = join(resolvedOut, file);
    mkdirSync(dirname(absOutput), { recursive: true });
    writeFileSync(absOutput, readFileSync(join(resolvedSrc, file)));
    results.push({ file, status: "copied" });
  }

  // Build the entire project as a single unit
  const projectBuilder = new ProjectBuilder();
  const builtFiles: string[] = [];
  for (const file of entryFiles) {
    try {
      projectBuilder.build(join(resolvedSrc, file));
      builtFiles.push(file);
    } catch (err: unknown) {
      // If a file fails to parse, copy it as-is
      const absOutput = join(resolvedOut, file);
      mkdirSync(dirname(absOutput), { recursive: true });
      writeFileSync(absOutput, readFileSync(join(resolvedSrc, file)));
      results.push({
        file,
        status: "skipped",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const entryPaths = builtFiles.map((f) => join(resolvedSrc, f));
  const projectUnit = projectBuilder.getProjectUnit(entryPaths);

  // Determine root entries: source files not imported by any other source file
  const allSourcePaths = new Set(entryPaths);
  const importedSourcePaths = new Set<string>();
  for (const [, moduleIR] of projectUnit.modules) {
    for (const global of moduleIR.globals.values()) {
      if (global.kind === "import" && allSourcePaths.has(global.source)) {
        importedSourcePaths.add(global.source);
      }
    }
  }
  const rootEntryPaths = [...allSourcePaths].filter(
    (p) => !importedSourcePaths.has(p),
  );

  // Run the pipeline once on the entire project
  const parsedOptions = CompilerOptionsSchema.parse(compilerOptions);
  try {
    new Pipeline(projectUnit, parsedOptions, rootEntryPaths).run();
  } catch (err: unknown) {
    // If pipeline fails, copy all entry files as-is
    for (const file of builtFiles) {
      const absOutput = join(resolvedOut, file);
      mkdirSync(dirname(absOutput), { recursive: true });
      writeFileSync(absOutput, readFileSync(join(resolvedSrc, file)));
      results.push({
        file,
        status: "skipped",
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return results;
  }

  // Generate code for each source module
  const generator = new CodeGenerator("", projectUnit);
  for (const file of entryFiles) {
    const absInput = join(resolvedSrc, file);
    const absOutput = join(resolvedOut, file);
    mkdirSync(dirname(absOutput), { recursive: true });

    try {
      const code = generator.generateModule(absInput);
      writeFileSync(absOutput, code);
      results.push({ file, status: "compiled" });
    } catch (err: unknown) {
      writeFileSync(absOutput, readFileSync(absInput));
      results.push({
        file,
        status: "skipped",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
