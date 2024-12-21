"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileProgram = compileProgram;
const Codegen_1 = require("../HIR/Codegen");
const HIRBuilder_1 = require("../HIR/HIRBuilder");
const ConstantPropagation_1 = require("../Optimization/ConstantPropagation");
const FunctionInlining_1 = require("../Optimization/FunctionInlining");
function compileProgram(program, options) {
    const builder = new HIRBuilder_1.HIRBuilder(program).build();
    if (options.enableConstantPropagation) {
        (0, ConstantPropagation_1.constantPropagation)(builder.blocks);
    }
    if (options.enableFunctionInlining) {
        (0, FunctionInlining_1.functionInlining)(builder.blocks);
    }
    const codegen = new Codegen_1.Codegen(builder.blocks, builder.phis);
    return codegen.generate();
}
