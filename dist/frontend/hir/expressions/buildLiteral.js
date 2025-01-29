import * as t from '@babel/types';
import { makeInstructionId } from '../../../ir/base/Instruction.js';
import 'lodash-es';
import { LiteralInstruction } from '../../../ir/instructions/value/Literal.js';

function buildLiteral(expressionPath, functionBuilder, environment) {
    if (!t.isNumericLiteral(expressionPath.node) &&
        !t.isStringLiteral(expressionPath.node) &&
        !t.isBooleanLiteral(expressionPath.node)) {
        throw new Error(`Unsupported literal type: ${expressionPath.type}`);
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = makeInstructionId(environment.nextInstructionId++);
    functionBuilder.addInstruction(new LiteralInstruction(instructionId, place, expressionPath, expressionPath.node.value));
    return place;
}

export { buildLiteral };
//# sourceMappingURL=buildLiteral.js.map
