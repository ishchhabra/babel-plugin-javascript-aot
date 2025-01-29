import * as t from '@babel/types';
import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { LiteralInstruction } from '../../../ir/instructions/value/Literal.js';

function buildLiteral(expressionPath, functionBuilder) {
    if (!t.isNumericLiteral(expressionPath.node) &&
        !t.isStringLiteral(expressionPath.node) &&
        !t.isBooleanLiteral(expressionPath.node)) {
        throw new Error(`Unsupported literal type: ${expressionPath.type}`);
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    functionBuilder.addInstruction(new LiteralInstruction(instructionId, place, expressionPath, expressionPath.node.value));
    return place;
}

export { buildLiteral };
//# sourceMappingURL=buildLiteral.js.map
