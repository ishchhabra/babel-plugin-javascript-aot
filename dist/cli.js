import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { compile } from './compile.js';

const program = new Command();
program
    .name("aot")
    .description("JavaScript ahead-of-time compiler")
    .argument("<entry>", "Entry point file")
    .argument("[output]", "Output file (defaults to stdout)")
    .option("--enable-load-store-forwarding-pass <boolean>", "Enable load store forwarding optimization pass", (value) => value === "true")
    .option("--enable-late-dead-code-elimination-pass <boolean>", "Enable late dead code elimination optimization pass", (value) => value === "true")
    .option("--enable-constant-propagation-pass <boolean>", "Enable constant propagation optimization pass", (value) => value === "true")
    .action((entry, output, options) => {
    const code = compile(entry, {
        enableConstantPropagationPass: options.enableConstantPropagationPass,
        enableLoadStoreForwardingPass: options.enableLoadStoreForwardingPass,
        enableLateDeadCodeEliminationPass: options.enableLateDeadCodeEliminationPass,
    });
    if (output) {
        writeFileSync(output, code);
    }
    else {
        console.log(code);
    }
});
if (import.meta.url === new URL(process.argv[1], "file://").href) {
    program.parse();
}
//# sourceMappingURL=cli.js.map
