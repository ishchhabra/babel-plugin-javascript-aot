import { buildUnsupportedNode } from '../buildUnsupportedNode.js';
import { buildBlockStatement } from './buildBlockStatement.js';
import { buildExportDefaultDeclaration } from './buildExportDefaultDeclaration.js';
import { buildExportNamedDeclaration } from './buildExportNamedDeclaration.js';
import { buildExpressionStatement } from './buildExpressionStatement.js';
import { buildForStatement } from './buildForStatement.js';
import { buildFunctionDeclaration } from './buildFunctionDeclaration.js';
import { buildIfStatement } from './buildIfStatement.js';
import { buildImportDeclaration } from './buildImportDeclaration.js';
import { buildReturnStatement } from './buildReturnStatement.js';
import { buildVariableDeclaration } from './buildVariableDeclaration.js';
import { buildWhileStatement } from './buildWhileStatement.js';

function buildStatement(nodePath, functionBuilder, moduleBuilder) {
    switch (nodePath.type) {
        case "BlockStatement":
            nodePath.assertBlockStatement();
            return buildBlockStatement(nodePath, functionBuilder, moduleBuilder);
        case "ExportDefaultDeclaration":
            nodePath.assertExportDefaultDeclaration();
            return buildExportDefaultDeclaration(nodePath, functionBuilder, moduleBuilder);
        case "ExportNamedDeclaration":
            nodePath.assertExportNamedDeclaration();
            return buildExportNamedDeclaration(nodePath, functionBuilder, moduleBuilder);
        case "ForStatement":
            nodePath.assertForStatement();
            return buildForStatement(nodePath, functionBuilder, moduleBuilder);
        case "IfStatement":
            nodePath.assertIfStatement();
            return buildIfStatement(nodePath, functionBuilder, moduleBuilder);
        case "ImportDeclaration":
            nodePath.assertImportDeclaration();
            return buildImportDeclaration(nodePath, functionBuilder, moduleBuilder);
        case "ExpressionStatement":
            nodePath.assertExpressionStatement();
            return buildExpressionStatement(nodePath, functionBuilder, moduleBuilder);
        case "FunctionDeclaration":
            nodePath.assertFunctionDeclaration();
            return buildFunctionDeclaration(nodePath, functionBuilder, moduleBuilder);
        case "ReturnStatement":
            nodePath.assertReturnStatement();
            return buildReturnStatement(nodePath, functionBuilder, moduleBuilder);
        case "VariableDeclaration":
            nodePath.assertVariableDeclaration();
            return buildVariableDeclaration(nodePath, functionBuilder, moduleBuilder);
        case "WhileStatement":
            nodePath.assertWhileStatement();
            return buildWhileStatement(nodePath, functionBuilder, moduleBuilder);
        default:
            return buildUnsupportedNode(nodePath, functionBuilder);
    }
}

export { buildStatement };
//# sourceMappingURL=buildStatement.js.map
