import * as t from '@babel/types';
import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { LiteralInstruction } from '../../../ir/instructions/value/Literal.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';

function buildLiteral(expressionPath, builder) {
    if (!t.isNumericLiteral(expressionPath.node) &&
        !t.isStringLiteral(expressionPath.node) &&
        !t.isBooleanLiteral(expressionPath.node)) {
        throw new Error(`Unsupported literal type: ${expressionPath.type}`);
    }
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new LiteralInstruction(instructionId, place, expressionPath, expressionPath.node.value));
    return place;
}

export { buildLiteral };
//# sourceMappingURL=buildLiteral.js.map
