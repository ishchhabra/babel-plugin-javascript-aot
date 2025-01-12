import { z } from "zod";
import { CodeGenerator } from "./backend/CodeGenerator";
import { ProjectBuilder } from "./frontend/ProjectBuilder";
import { Pipeline } from "./pipeline/Pipeline";

export const CompilerOptionsSchema = z.object({
  enableLoadStoreForwardingPass: z.boolean().default(true),
  enableLateDeadCodeEliminationPass: z.boolean().default(true),
  enableConstantPropagationPass: z.boolean().default(true),
});

export type CompilerOptions = z.infer<typeof CompilerOptionsSchema>;

export function compile(entryPoint: string, options: CompilerOptions) {
  const projectUnit = new ProjectBuilder().build(entryPoint);
  new Pipeline(projectUnit, options).run();
  const code = new CodeGenerator(projectUnit, entryPoint).generate();
  return code;
}
