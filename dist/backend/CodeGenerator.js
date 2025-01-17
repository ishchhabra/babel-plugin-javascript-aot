import _generate from '@babel/generator';
import * as t from '@babel/types';
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
    generate() {
        const moduleIR = this.projectUnit.modules.get(this.path);
        const functionIR = moduleIR.functions.values().next().value;
        const statements = generateFunction(functionIR, this);
        const program = t.program(statements);
        return generate(program).code;
    }
}

export { CodeGenerator };
//# sourceMappingURL=CodeGenerator.js.map
