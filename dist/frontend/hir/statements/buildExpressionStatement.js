import { castArray } from 'lodash-es';
import { ExpressionStatementInstruction } from '../../../ir/instructions/ExpressionStatement.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { buildNode } from '../buildNode.js';

function buildExpressionStatement(nodePath, functionBuilder, moduleBuilder, environment) {
    const expressionPath = nodePath.get("expression");
    const expressionPlace = buildNode(expressionPath, functionBuilder, moduleBuilder, environment);
    const expressionPlaces = castArray(expressionPlace);
    const places = expressionPlaces
        .map((expressionPlace) => {
        const expressionInstruction = functionBuilder.environment.placeToInstruction.get(expressionPlace.id);
        // For assignments, since we convert them to a memory instruction,
        // we do not need to emit an expression statement instruction.
        if (expressionInstruction instanceof StoreLocalInstruction) {
            return undefined;
        }
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instruction = environment.createInstruction(ExpressionStatementInstruction, place, expressionPath, expressionPlace);
        functionBuilder.addInstruction(instruction);
        return place;
    })
        .filter((place) => place !== undefined);
    return places;
}

export { buildExpressionStatement };
//# sourceMappingURL=buildExpressionStatement.js.map
