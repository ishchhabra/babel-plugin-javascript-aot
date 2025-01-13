import { buildUnsupportedNode } from '../buildUnsupportedNode.js';
import { buildArrayExpression } from './buildArrayExpression.js';
import { buildAssignmentExpression } from './buildAssignmentExpression.js';
import { buildBinaryExpression } from './buildBinaryExpression.js';
import { buildCallExpression } from './buildCallExpression.js';
import { buildLiteral } from './buildLiteral.js';
import { buildLogicalExpression } from './buildLogicalExpression.js';
import { buildMemberExpression } from './buildMemberExpression.js';
import { buildObjectExpression } from './buildObjectExpression.js';
import { buildUnaryExpression } from './buildUnaryExpression.js';
import { buildUpdateExpression } from './buildUpdateExpression.js';

function buildExpression(nodePath, builder) {
    switch (nodePath.type) {
        case "AssignmentExpression":
            nodePath.assertAssignmentExpression();
            return buildAssignmentExpression(nodePath, builder);
        case "ArrayExpression":
            nodePath.assertArrayExpression();
            return buildArrayExpression(nodePath, builder);
        case "BinaryExpression":
            nodePath.assertBinaryExpression();
            return buildBinaryExpression(nodePath, builder);
        case "BooleanLiteral":
            nodePath.assertBooleanLiteral();
            return buildLiteral(nodePath, builder);
        case "CallExpression":
            nodePath.assertCallExpression();
            return buildCallExpression(nodePath, builder);
        case "LogicalExpression":
            nodePath.assertLogicalExpression();
            return buildLogicalExpression(nodePath, builder);
        case "MemberExpression":
            nodePath.assertMemberExpression();
            return buildMemberExpression(nodePath, builder);
        case "NumericLiteral":
            nodePath.assertNumericLiteral();
            return buildLiteral(nodePath, builder);
        case "ObjectExpression":
            nodePath.assertObjectExpression();
            return buildObjectExpression(nodePath, builder);
        case "StringLiteral":
            nodePath.assertStringLiteral();
            return buildLiteral(nodePath, builder);
        case "UnaryExpression":
            nodePath.assertUnaryExpression();
            return buildUnaryExpression(nodePath, builder);
        case "UpdateExpression":
            nodePath.assertUpdateExpression();
            return buildUpdateExpression(nodePath, builder);
        default:
            return buildUnsupportedNode(nodePath, builder);
    }
}

export { buildExpression };
//# sourceMappingURL=buildExpression.js.map
