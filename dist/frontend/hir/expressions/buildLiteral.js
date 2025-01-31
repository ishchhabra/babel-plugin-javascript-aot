import * as t from '@babel/types';
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
    const instruction = environment.createInstruction(LiteralInstruction, place, expressionPath, expressionPath.node.value);
    functionBuilder.addInstruction(instruction);
    environment.registerDeclarationInstruction(place, instruction);
    return place;
}

export { buildLiteral };
//# sourceMappingURL=buildLiteral.js.map
