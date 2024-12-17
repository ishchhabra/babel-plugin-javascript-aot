import { compileProgram } from "./Program";
export default function BabelPlugin() {
    return {
        name: "javascript-aot",
        visitor: {
            Program(program, pass) {
                const pluginOptions = pass.opts;
                const result = compileProgram(program, pluginOptions);
                program.replaceWith(result);
                program.skip();
            },
        },
    };
}
