import { Compiler } from "./compiler/compiler";
import { PluginOptionsSchema } from "./schemas/plugin-options";
export default function BabelPlugin() {
    return {
        name: "javascript-aot",
        visitor: {
            Program: (program, pass) => {
                const pluginOptions = PluginOptionsSchema.parse(pass.opts);
                const compiler = new Compiler();
                const compiledProgram = compiler.compileProgram(program, pluginOptions);
                program.replaceWith(compiledProgram);
                program.skip();
            },
        },
    };
}
//# sourceMappingURL=babel-plugin.js.map