"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BabelPlugin;
const Program_1 = require("./Program");
function BabelPlugin() {
    return {
        name: "javascript-aot",
        visitor: {
            Program(program, pass) {
                const pluginOptions = pass.opts;
                const result = (0, Program_1.compileProgram)(program, pluginOptions);
                program.replaceWith(result);
                program.skip();
            },
        },
    };
}
