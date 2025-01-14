import { buildExportSpecifier } from './buildExportSpecifier.js';
import { buildIdentifier } from './buildIdentifier.js';
import { buildImportSpecifier } from './buildImportSpecifier.js';
import { buildObjectMethod } from './buildObjectMethod.js';
import { buildObjectProperty } from './buildObjectProperty.js';
import { buildSpreadElement } from './buildSpreadElement.js';
import { buildUnsupportedNode } from './buildUnsupportedNode.js';
import { buildHole } from './buildHole.js';
import '@babel/types';
import { buildExpression } from './expressions/buildExpression.js';
import { buildPattern } from './patterns/buildPattern.js';
import { buildStatement } from './statements/buildStatement.js';

function buildNode(nodePath, builder) {
    if (nodePath.node === null) {
        return buildHole(nodePath, builder);
    }
    if (nodePath.isIdentifier()) {
        return buildIdentifier(nodePath, builder);
    }
    if (nodePath.isObjectMethod()) {
        return buildObjectMethod(nodePath, builder);
    }
    if (nodePath.isObjectProperty()) {
        return buildObjectProperty(nodePath, builder);
    }
    if (nodePath.isExpression()) {
        return buildExpression(nodePath, builder);
    }
    if (nodePath.isStatement()) {
        return buildStatement(nodePath, builder);
    }
    if (nodePath.isSpreadElement()) {
        return buildSpreadElement(nodePath, builder);
    }
    if (nodePath.isPattern()) {
        return buildPattern(nodePath, builder);
    }
    if (nodePath.isImportSpecifier()) {
        return buildImportSpecifier(nodePath, builder);
    }
    if (nodePath.isExportSpecifier()) {
        return buildExportSpecifier(nodePath, builder);
    }
    return buildUnsupportedNode(nodePath, builder);
}

export { buildNode };
//# sourceMappingURL=buildNode.js.map
