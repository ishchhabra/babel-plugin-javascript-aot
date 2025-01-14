import { buildArrayPattern } from './buildArrayPattern.js';

function buildPattern(nodePath, builder) {
    switch (nodePath.type) {
        case "ArrayPattern":
            nodePath.assertArrayPattern();
            return buildArrayPattern(nodePath, builder);
        default:
            throw new Error(`Unsupported pattern type: ${nodePath.type}`);
    }
}

export { buildPattern };
//# sourceMappingURL=buildPattern.js.map
