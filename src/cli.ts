import { Command } from "commander";
import { writeFileSync } from "fs";
import { compile, CompilerOptionsSchema } from "./compile";
import { compileProject } from "./compileProject";

const program = new Command();

program.name("aot").description("JavaScript ahead-of-time compiler");

program
  .command("compile")
  .description("Compile a single file")
  .argument("<entry>", "Entry point file")
  .argument("[output]", "Output file (defaults to stdout)")
  .option(
    "--enable-load-store-forwarding-pass <boolean>",
    "Enable load store forwarding optimization pass",
    (value) => value === "true",
  )
  .option(
    "--enable-late-dead-code-elimination-pass <boolean>",
    "Enable late dead code elimination optimization pass",
    (value) => value === "true",
  )
  .option(
    "--enable-constant-propagation-pass <boolean>",
    "Enable constant propagation optimization pass",
    (value) => value === "true",
  )
  .option(
    "--enable-function-inlining-pass <boolean>",
    "Enable function inlining optimization pass",
    (value) => value === "true",
  )
  .action((entry, output, options) => {
    const compilerOptions = CompilerOptionsSchema.parse(options);
    const code = compile(entry, compilerOptions);

    if (output) {
      writeFileSync(output, code);
    } else {
      console.log(code);
    }
  });

program
  .command("compile-project")
  .description("Compile all files in a directory")
  .argument("<src>", "Source directory")
  .argument("<out>", "Output directory")
  .option(
    "--exclude <patterns...>",
    "Regex patterns for files to skip (copy as-is)",
  )
  .option(
    "--exclude-content <patterns...>",
    "Skip files containing these strings (copy as-is)",
  )
  .action((src, out, options) => {
    const exclude = (options.exclude || []).map((p: string) => new RegExp(p));
    const excludeContentPatterns: string[] = options.excludeContent || [];

    const results = compileProject({
      ...CompilerOptionsSchema.parse({}),
      srcDir: src,
      outDir: out,
      exclude,
      excludeContentPatterns,
    });

    let compiled = 0;
    let copied = 0;
    let skipped = 0;

    for (const result of results) {
      if (result.status === "compiled") {
        compiled++;
        console.log(`✓ ${result.file}`);
      } else if (result.status === "copied") {
        copied++;
        console.log(`→ ${result.file} (copied)`);
      } else {
        skipped++;
        console.log(`✗ ${result.file}: ${result.error}`);
      }
    }

    console.log(
      `\nDone: ${compiled} compiled, ${copied} copied, ${skipped} skipped`,
    );
  });

program.parse();
