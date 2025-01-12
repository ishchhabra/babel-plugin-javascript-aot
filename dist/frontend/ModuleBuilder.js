import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { readFileSync } from 'fs';
import { getBackEdges } from '../pipeline/getBackEdges.js';
import { getPredecessors } from '../pipeline/getPredecessors.js';
import { getDominators, getImmediateDominators, getDominanceFrontier } from '../pipeline/ssa/dominator-utils.js';
import { HIRBuilder } from './HIRBuilder.js';
import { makeBlockId } from './ir/Block.js';

const traverse = _traverse
    .default;
class ModuleBuilder {
    path;
    environment;
    constructor(path, environment) {
        this.path = path;
        this.environment = environment;
    }
    build() {
        const code = readFileSync(this.path, "utf-8");
        const ast = parse(code, {
            sourceType: "module",
            plugins: ["typescript"],
        });
        let programNodePath;
        traverse(ast, {
            Program: (path) => {
                programNodePath = path;
            },
        });
        if (programNodePath === undefined) {
            throw new Error("Program path not found");
        }
        const { blocks, exportToInstructions, importToPlaces } = new HIRBuilder(this.path, programNodePath, this.environment).build();
        const predecessors = getPredecessors(blocks);
        const dominators = getDominators(predecessors, makeBlockId(0));
        const iDoms = getImmediateDominators(dominators);
        const dominanceFrontier = getDominanceFrontier(predecessors, iDoms);
        const backEdges = getBackEdges(blocks, dominators, predecessors);
        return {
            path: this.path,
            environment: this.environment,
            blocks,
            exportToInstructions,
            importToPlaces,
            predecessors,
            dominators,
            dominanceFrontier,
            backEdges,
        };
    }
}

export { ModuleBuilder };
//# sourceMappingURL=ModuleBuilder.js.map
