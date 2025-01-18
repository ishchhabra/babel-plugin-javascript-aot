import { z } from 'zod';
import { CodeGenerator } from './backend/CodeGenerator.js';
import { ProjectBuilder } from './frontend/ProjectBuilder.js';
import { Pipeline } from './pipeline/Pipeline.js';

const CompilerOptionsSchema = z.object({
    /** Whether to enable the optimizer */
    enableOptimizer: z.boolean().default(true),
    /** Whether to enable the constant propagation pass */
    enableConstantPropagationPass: z.boolean().default(true),
    /** Whether to enable the late optimizer */
    enableLateOptimizer: z.boolean().default(true),
    /** Whether to enable the load store forwarding pass */
    enableLoadStoreForwardingPass: z.boolean().default(true),
    /** Whether to enable the redundant store elimination pass */
    enableRedundantCopyEliminationPass: z.boolean().default(true),
    /** Whether to enable the late dead code elimination pass */
    enableLateDeadCodeEliminationPass: z.boolean().default(true),
});
function compile(entryPoint, options) {
    const projectUnit = new ProjectBuilder().build(entryPoint);
    new Pipeline(projectUnit, options).run();
    const code = new CodeGenerator(entryPoint, projectUnit).generate();
    return code;
}

export { CompilerOptionsSchema, compile };
//# sourceMappingURL=compile.js.map
