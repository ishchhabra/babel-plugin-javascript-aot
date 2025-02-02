import { buildArrayPattern } from './buildArrayPattern.js';

function buildPattern(nodePath, functionBuilder, moduleBuilder, environment) {
    switch (nodePath.type) {
        case "ArrayPattern":
            nodePath.assertArrayPattern();
            return buildArrayPattern(nodePath, functionBuilder, moduleBuilder, environment);
        default:
            throw new Error(`Unsupported pattern type: ${nodePath.type}`);
    }
}

export { buildPattern };
//# sourceMappingURL=buildPattern.js.map
