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

function buildStatement(nodePath, builder) {
    switch (nodePath.type) {
        case "BlockStatement":
            nodePath.assertBlockStatement();
            return buildBlockStatement(nodePath, builder);
        case "ExportDefaultDeclaration":
            nodePath.assertExportDefaultDeclaration();
            return buildExportDefaultDeclaration(nodePath, builder);
        case "ExportNamedDeclaration":
            nodePath.assertExportNamedDeclaration();
            return buildExportNamedDeclaration(nodePath, builder);
        case "ForStatement":
            nodePath.assertForStatement();
            return buildForStatement(nodePath, builder);
        case "IfStatement":
            nodePath.assertIfStatement();
            return buildIfStatement(nodePath, builder);
        case "ImportDeclaration":
            nodePath.assertImportDeclaration();
            return buildImportDeclaration(nodePath, builder);
        case "ExpressionStatement":
            nodePath.assertExpressionStatement();
            return buildExpressionStatement(nodePath, builder);
        case "FunctionDeclaration":
            nodePath.assertFunctionDeclaration();
            return buildFunctionDeclaration(nodePath, builder);
        case "ReturnStatement":
            nodePath.assertReturnStatement();
            return buildReturnStatement(nodePath, builder);
        case "VariableDeclaration":
            nodePath.assertVariableDeclaration();
            return buildVariableDeclaration(nodePath, builder);
        case "WhileStatement":
            nodePath.assertWhileStatement();
            return buildWhileStatement(nodePath, builder);
        default:
            return buildUnsupportedNode(nodePath, builder);
    }
}

export { buildStatement };
//# sourceMappingURL=buildStatement.js.map
