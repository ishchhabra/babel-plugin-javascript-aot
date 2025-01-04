import { makeBlockId } from "../ir";
import { BranchTerminal, JumpTerminal } from "../ir/Terminal";
import { getDominanceFrontier, getDominators, getImmediateDominators, } from "../ssa/dominator-utils";
export class CFGBuilder {
    environment;
    blocks;
    constructor(environment, blocks) {
        this.environment = environment;
        this.blocks = blocks;
    }
    build() {
        const predecessors = this.getPredecessors();
        const successors = this.getSuccessors(predecessors);
        this.environment.dominators = getDominators(predecessors, makeBlockId(0));
        this.environment.immediateDominators = getImmediateDominators(this.environment.dominators);
        this.environment.dominanceFrontier = getDominanceFrontier(predecessors, this.environment.immediateDominators);
        const backEdges = this.getBackEdges(predecessors);
        const postOrder = this.getPostOrder(successors);
        return { predecessors, successors, postOrder, backEdges };
    }
    getPredecessors() {
        const predecessors = new Map();
        const visited = new Set();
        // Initialize empty predecessor sets
        for (const blockId of this.blocks.keys()) {
            predecessors.set(blockId, new Set());
        }
        const processBlock = (blockId, prevBlock) => {
            const block = this.blocks.get(blockId);
            if (block === undefined) {
                return;
            }
            // Add predecessor if we came from a previous block
            if (prevBlock !== undefined) {
                predecessors.get(blockId)?.add(prevBlock.id);
            }
            // Skip if already visited to handle cycles
            if (visited.has(blockId))
                return;
            visited.add(blockId);
            // Visit successors based on terminal type
            if (block.terminal instanceof JumpTerminal) {
                processBlock(block.terminal.target, block);
            }
            else if (block.terminal instanceof BranchTerminal) {
                processBlock(block.terminal.consequent, block);
                processBlock(block.terminal.alternate, block);
            }
        };
        // Start from entry block (assumed to be block 0)
        processBlock(makeBlockId(0), undefined);
        return predecessors;
    }
    getSuccessors(predecessors) {
        const successors = new Map();
        // Initialize empty successor sets.
        for (const blockId of this.blocks.keys()) {
            successors.set(blockId, new Set());
        }
        // Reverse the predecessor relationship.
        for (const [blockId, preds] of predecessors.entries()) {
            for (const pred of preds) {
                successors.get(pred)?.add(blockId);
            }
        }
        return successors;
    }
    getBackEdges(predecessors) {
        const backEdges = new Map();
        // Initialize empty sets for all blocks
        for (const blockId of this.blocks.keys()) {
            backEdges.set(blockId, new Set());
        }
        for (const [blockId, preds] of predecessors.entries()) {
            const dominatedByBlock = Array.from(this.blocks.keys()).filter((b) => this.environment.dominators.get(b)?.has(blockId));
            for (const pred of preds) {
                if (dominatedByBlock.includes(pred)) {
                    // Add the predecessor to the set of back edges for this block
                    backEdges.get(blockId)?.add(pred);
                }
            }
        }
        return backEdges;
    }
    getPostOrder(successors) {
        const postOrder = [];
        const visited = new Set();
        const dfs = (blockId) => {
            if (visited.has(blockId)) {
                return;
            }
            visited.add(blockId);
            const blockSuccessors = successors.get(blockId) ?? [];
            for (const successor of blockSuccessors) {
                dfs(successor);
            }
            postOrder.push(blockId);
        };
        for (const blockId of this.blocks.keys()) {
            dfs(blockId);
        }
        return postOrder;
    }
}
//# sourceMappingURL=CFGBuilder.js.map