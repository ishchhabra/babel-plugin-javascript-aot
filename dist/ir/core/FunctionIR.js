import { getSuccessors } from '../../frontend/cfg/getSuccessors.js';
import { getBackEdges } from '../../pipeline/getBackEdges.js';
import { getPredecessors } from '../../pipeline/getPredecessors.js';
import { getDominators, getImmediateDominators, getDominanceFrontier } from '../../pipeline/ssa/dominator-utils.js';

function makeFunctionIRId(id) {
    return id;
}
class FunctionIR {
    id;
    blocks;
    predecessors;
    successors;
    dominators;
    immediateDominators;
    dominanceFrontier;
    backEdges;
    get entryBlockId() {
        return this.blocks.keys().next().value;
    }
    constructor(id, blocks) {
        this.id = id;
        this.blocks = blocks;
        this.computeCFG();
    }
    computeCFG() {
        this.predecessors = getPredecessors(this.blocks);
        this.successors = getSuccessors(this.predecessors);
        this.dominators = getDominators(this.predecessors, this.entryBlockId);
        this.immediateDominators = getImmediateDominators(this.dominators);
        this.dominanceFrontier = getDominanceFrontier(this.predecessors, this.immediateDominators);
        this.backEdges = getBackEdges(this.blocks, this.dominators, this.predecessors);
    }
    recomputeCFG() {
        this.computeCFG();
    }
}

export { FunctionIR, makeFunctionIRId };
//# sourceMappingURL=FunctionIR.js.map
