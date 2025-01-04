import { Compiler } from './compiler/compiler.js';
import { PluginOptionsSchema } from './schemas/plugin-options.js';

function BabelPlugin() {
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

export { BabelPlugin as default };
//# sourceMappingURL=babel-plugin.js.map
