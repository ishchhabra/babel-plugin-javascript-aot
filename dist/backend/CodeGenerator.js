import _generate from '@babel/generator';
import * as t from '@babel/types';
import { makeFunctionIRId } from '../ir/core/FunctionIR.js';
import { generateFunction } from './codegen/generateFunction.js';

const generate = _generate
    .default;
/**
 * Generates the code from the IR.
 */
class CodeGenerator {
    path;
    projectUnit;
    places = new Map();
    blockToStatements = new Map();
    generatedBlocks = new Set();
    constructor(path, projectUnit) {
        this.path = path;
        this.projectUnit = projectUnit;
    }
    get entryFunction() {
        const moduleIR = this.projectUnit.modules.get(this.path);
        return moduleIR.functions.get(makeFunctionIRId(0));
    }
    generate() {
        const { statements } = generateFunction(this.entryFunction, this);
        const program = t.program(statements);
        return generate(program).code;
    }
}

export { CodeGenerator };
//# sourceMappingURL=CodeGenerator.js.map
