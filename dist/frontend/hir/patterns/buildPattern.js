import { buildArrayPattern } from './buildArrayPattern.js';

function buildPattern(nodePath, functionBuilder, moduleBuilder) {
    switch (nodePath.type) {
        case "ArrayPattern":
            nodePath.assertArrayPattern();
            return buildArrayPattern(nodePath, functionBuilder, moduleBuilder);
        default:
            throw new Error(`Unsupported pattern type: ${nodePath.type}`);
    }
}

export { buildPattern };
//# sourceMappingURL=buildPattern.js.map
