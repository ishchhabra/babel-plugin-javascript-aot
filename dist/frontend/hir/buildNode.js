import { buildExportSpecifier } from './buildExportSpecifier.js';
import { buildIdentifier } from './buildIdentifier.js';
import { buildImportSpecifier } from './buildImportSpecifier.js';
import { buildObjectMethod } from './buildObjectMethod.js';
import { buildObjectProperty } from './buildObjectProperty.js';
import { buildSpreadElement } from './buildSpreadElement.js';
import { buildUnsupportedNode } from './buildUnsupportedNode.js';
import { buildHole } from './buildHole.js';
import '@babel/types';
import 'lodash-es';
import { buildExpression } from './expressions/buildExpression.js';
import { buildPattern } from './patterns/buildPattern.js';
import { buildStatement } from './statements/buildStatement.js';

function buildNode(nodePath, functionBuilder, moduleBuilder) {
    if (nodePath.node === null) {
        return buildHole(nodePath, functionBuilder);
    }
    if (nodePath.isIdentifier()) {
        return buildIdentifier(nodePath, functionBuilder);
    }
    if (nodePath.isObjectMethod()) {
        return buildObjectMethod(nodePath, functionBuilder, moduleBuilder);
    }
    if (nodePath.isObjectProperty()) {
        return buildObjectProperty(nodePath, functionBuilder, moduleBuilder);
    }
    if (nodePath.isExpression()) {
        return buildExpression(nodePath, functionBuilder, moduleBuilder);
    }
    if (nodePath.isStatement()) {
        return buildStatement(nodePath, functionBuilder, moduleBuilder);
    }
    if (nodePath.isSpreadElement()) {
        return buildSpreadElement(nodePath, functionBuilder, moduleBuilder);
    }
    if (nodePath.isPattern()) {
        return buildPattern(nodePath, functionBuilder, moduleBuilder);
    }
    if (nodePath.isImportSpecifier()) {
        return buildImportSpecifier(nodePath, functionBuilder, moduleBuilder);
    }
    if (nodePath.isExportSpecifier()) {
        return buildExportSpecifier(nodePath, functionBuilder, moduleBuilder);
    }
    return buildUnsupportedNode(nodePath, functionBuilder);
}

export { buildNode };
//# sourceMappingURL=buildNode.js.map
