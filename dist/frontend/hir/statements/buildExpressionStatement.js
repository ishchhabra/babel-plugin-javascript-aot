import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { ExpressionStatementInstruction } from '../../../ir/instructions/ExpressionStatement.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { buildNode } from '../buildNode.js';

function buildExpressionStatement(nodePath, functionBuilder, moduleBuilder) {
    const expressionPath = nodePath.get("expression");
    const expressionPlace = buildNode(expressionPath, functionBuilder, moduleBuilder);
    if (expressionPlace === undefined || Array.isArray(expressionPlace)) {
        throw new Error("Expression statement expression must be a single place");
    }
    // For assignments, since we convert them to a memory instruction,
    // we do not need to emit an expression statement instruction.
    const expressionInstruction = functionBuilder.currentBlock.instructions.at(-1);
    if (expressionInstruction instanceof StoreLocalInstruction &&
        expressionInstruction.place === expressionPlace) {
        return;
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(new ExpressionStatementInstruction(instructionId, place, expressionPath, expressionPlace));
    return place;
}

export { buildExpressionStatement };
//# sourceMappingURL=buildExpressionStatement.js.map
