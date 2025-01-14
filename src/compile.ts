import { z } from "zod";
import { CodeGenerator } from "./backend/CodeGenerator";
import { ProjectBuilder } from "./frontend/ProjectBuilder";
import { Pipeline } from "./pipeline/Pipeline";

export const CompilerOptionsSchema = z.object({
  /** Whether to enable the optimizer */
  enableOptimizer: z.boolean().default(true),
  /** Whether to enable the constant propagation pass */
  enableConstantPropagationPass: z.boolean().default(true),

  /** Whether to enable the late optimizer */
  enableLateOptimizer: z.boolean().default(true),
  /** Whether to enable the load store forwarding pass */
  enableLoadStoreForwardingPass: z.boolean().default(true),
  /** Whether to enable the late dead code elimination pass */
  enableLateDeadCodeEliminationPass: z.boolean().default(true),
});

export type CompilerOptions = z.infer<typeof CompilerOptionsSchema>;

export function compile(entryPoint: string, options: CompilerOptions) {
  const projectUnit = new ProjectBuilder().build(entryPoint);
  new Pipeline(projectUnit, options).run();
  const code = new CodeGenerator(projectUnit, entryPoint).generate();
  return code;
}
