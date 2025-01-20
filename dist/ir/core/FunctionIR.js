import { getBackEdges } from '../../frontend/cfg/getBackEdges.js';
import { getDominanceFrontier } from '../../frontend/cfg/getDominanceFrontier.js';
import { getDominators } from '../../frontend/cfg/getDominators.js';
import { getImmediateDominators } from '../../frontend/cfg/getImmediateDominators.js';
import { getPredecessors } from '../../frontend/cfg/getPredecessors.js';
import { getSuccessors } from '../../frontend/cfg/getSuccessors.js';

function makeFunctionIRId(id) {
    return id;
}
class FunctionIR {
    id;
    params;
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
    constructor(id, params, blocks) {
        this.id = id;
        this.params = params;
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
