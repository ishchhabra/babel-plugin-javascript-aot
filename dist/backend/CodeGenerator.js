import _generate from '@babel/generator';
import * as t from '@babel/types';
import { generateBlock } from './codegen/generateBlock.js';

const generate = _generate
    .default;
/**
 * Generates the code from the IR.
 */
class CodeGenerator {
    projectUnit;
    path;
    places = new Map();
    blockToStatements = new Map();
    generatedBlocks = new Set();
    blocks;
    backEdges;
    constructor(projectUnit, path) {
        this.projectUnit = projectUnit;
        this.path = path;
        const moduleUnit = this.projectUnit.modules.get(path);
        this.blocks = moduleUnit.blocks;
        this.backEdges = moduleUnit.backEdges;
    }
    generate() {
        const statements = generateBlock(this.blocks.keys().next().value, this);
        const program = t.program(statements);
        return generate(program).code;
    }
}

export { CodeGenerator };
//# sourceMappingURL=CodeGenerator.js.map
