import { castArray } from 'lodash-es';
import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { ExpressionStatementInstruction } from '../../../ir/instructions/ExpressionStatement.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { buildNode } from '../buildNode.js';

function buildExpressionStatement(nodePath, functionBuilder, moduleBuilder) {
    const expressionPath = nodePath.get("expression");
    const expressionPlace = buildNode(expressionPath, functionBuilder, moduleBuilder);
    const expressionPlaces = castArray(expressionPlace);
    const places = expressionPlaces
        .map((expressionPlace) => {
        const expressionInstruction = functionBuilder.environment.placeToInstruction.get(expressionPlace.id);
        // For assignments, since we convert them to a memory instruction,
        // we do not need to emit an expression statement instruction.
        if (expressionInstruction instanceof StoreLocalInstruction) {
            return undefined;
        }
        const identifier = createIdentifier(functionBuilder.environment);
        const place = createPlace(identifier, functionBuilder.environment);
        const instructionId = createInstructionId(functionBuilder.environment);
        functionBuilder.addInstruction(new ExpressionStatementInstruction(instructionId, place, expressionPath, expressionPlace));
        return place;
    })
        .filter((place) => place !== undefined);
    return places;
}

export { buildExpressionStatement };
//# sourceMappingURL=buildExpressionStatement.js.map
