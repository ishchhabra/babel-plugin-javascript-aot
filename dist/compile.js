import { z } from 'zod';
import { CodeGenerator } from './backend/CodeGenerator.js';
import { makeBlockId } from './frontend/ir/Block.js';
import { ProjectBuilder } from './frontend/ProjectBuilder.js';
import { getBackEdges } from './pipeline/getBackEdges.js';
import { getPredecessors } from './pipeline/getPredecessors.js';
import { Pipeline } from './pipeline/Pipeline.js';
import { getDominators, getImmediateDominators, getDominanceFrontier } from './pipeline/ssa/dominator-utils.js';

z.object({
    enableLoadStoreForwardingPass: z.boolean().default(true),
    enableLateDeadCodeEliminationPass: z.boolean().default(true),
    enableConstantPropagationPass: z.boolean().default(true),
});
function compile(entryPoint, options) {
    const moduleUnit = new ProjectBuilder().build(entryPoint);
    const predecessors = getPredecessors(moduleUnit.hir.blocks);
    const dominators = getDominators(predecessors, makeBlockId(0));
    const iDoms = getImmediateDominators(dominators);
    const dominanceFrontier = getDominanceFrontier(predecessors, iDoms);
    const backEdges = getBackEdges(moduleUnit.hir.blocks, dominators, predecessors);
    const pipeline = new Pipeline(options);
    const pipelineResult = pipeline.run(entryPoint, moduleUnit.hir.blocks, predecessors, dominators, dominanceFrontier, moduleUnit.environment);
    return {
        code: new CodeGenerator(pipelineResult.blocks, backEdges).generate(),
        pipelineResult,
        backEdges,
    };
}

export { compile };
//# sourceMappingURL=compile.js.map
