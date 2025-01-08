import { z } from "zod";
import { CodeGenerator } from "./backend/CodeGenerator";
import { makeBlockId } from "./frontend/ir";
import { ProjectBuilder } from "./frontend/ProjectBuilder";
import { getBackEdges } from "./pipeline/getBackEdges";
import { getPredecessors } from "./pipeline/getPredecessors";
import { Pipeline } from "./pipeline/Pipeline";
import {
  getDominanceFrontier,
  getDominators,
  getImmediateDominators,
} from "./pipeline/ssa/dominator-utils";

export const CompilerOptionsSchema = z.object({
  enableLoadStoreForwardingPass: z.boolean().default(true),
  enableLateDeadCodeEliminationPass: z.boolean().default(true),
  enableConstantPropagationPass: z.boolean().default(true),
});

export type CompilerOptions = z.infer<typeof CompilerOptionsSchema>;

export function compile(entryPoint: string, options: CompilerOptions) {
  const moduleUnit = new ProjectBuilder().build(entryPoint);
  const predecessors = getPredecessors(moduleUnit.hir.blocks);
  const dominators = getDominators(predecessors, makeBlockId(0));
  const iDoms = getImmediateDominators(dominators);
  const dominanceFrontier = getDominanceFrontier(predecessors, iDoms);
  const backEdges = getBackEdges(
    moduleUnit.hir.blocks,
    dominators,
    predecessors,
  );

  const pipeline = new Pipeline(options);
  const pipelineResult = pipeline.run(
    entryPoint,
    moduleUnit.hir.blocks,
    predecessors,
    dominators,
    dominanceFrontier,
    moduleUnit.environment,
  );

  return {
    code: new CodeGenerator(pipelineResult.blocks, backEdges).generate(),
    pipelineResult,
    backEdges,
  };
}
