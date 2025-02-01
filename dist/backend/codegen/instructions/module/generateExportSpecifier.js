import * as t from '@babel/types';
import { toIdentifierOrStringLiteral } from '../../../../babel-utils.js';

function generateExportSpecifierInstruction(instruction, generator) {
    const local = t.identifier(instruction.local);
    const exported = toIdentifierOrStringLiteral(instruction.exported);
    const node = t.exportSpecifier(local, exported);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateExportSpecifierInstruction };
//# sourceMappingURL=generateExportSpecifier.js.map
