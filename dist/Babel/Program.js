import { Codegen } from "../HIR/Codegen";
import { HIRBuilder } from "../HIR/HIRBuilder";
import { constantPropagation } from "../Optimization/ConstantPropagation";
export function compileProgram(program, options) {
    const builder = new HIRBuilder(program).build();
    if (options.enableConstantPropagation) {
        constantPropagation(builder.blocks);
    }
    const codegen = new Codegen(builder.blocks, builder.phis);
    return codegen.generate();
}
