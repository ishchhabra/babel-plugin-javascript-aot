import { getBackEdges } from '../../pipeline/getBackEdges.js';
import { getPredecessors } from '../../pipeline/getPredecessors.js';
import { getDominators, getImmediateDominators, getDominanceFrontier } from '../../pipeline/ssa/dominator-utils.js';
import { makeBlockId } from './Block.js';

function makeFunctionIRId(id) {
    return id;
}
class FunctionIR {
    id;
    blocks;
    predecessors;
    dominators;
    immediateDominators;
    dominanceFrontier;
    backEdges;
    constructor(id, blocks) {
        this.id = id;
        this.blocks = blocks;
        this.predecessors = getPredecessors(blocks);
        this.dominators = getDominators(this.predecessors, makeBlockId(0));
        this.immediateDominators = getImmediateDominators(this.dominators);
        this.dominanceFrontier = getDominanceFrontier(this.predecessors, this.immediateDominators);
        this.backEdges = getBackEdges(blocks, this.dominators, this.predecessors);
    }
    recomputeCFG() {
        this.predecessors = getPredecessors(this.blocks);
        this.dominators = getDominators(this.predecessors, makeBlockId(0));
        this.immediateDominators = getImmediateDominators(this.dominators);
        this.dominanceFrontier = getDominanceFrontier(this.predecessors, this.immediateDominators);
        this.backEdges = getBackEdges(this.blocks, this.dominators, this.predecessors);
    }
}

export { FunctionIR, makeFunctionIRId };
//# sourceMappingURL=FunctionIR.js.map
