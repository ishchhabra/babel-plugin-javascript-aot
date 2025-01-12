import { z } from 'zod';
import { CodeGenerator } from './backend/CodeGenerator.js';
import { ProjectBuilder } from './frontend/ProjectBuilder.js';
import { Pipeline } from './pipeline/Pipeline.js';

z.object({
    enableLoadStoreForwardingPass: z.boolean().default(true),
    enableLateDeadCodeEliminationPass: z.boolean().default(true),
    enableConstantPropagationPass: z.boolean().default(true),
});
function compile(entryPoint, options) {
    const projectUnit = new ProjectBuilder().build(entryPoint);
    new Pipeline(projectUnit, options).run();
    const code = new CodeGenerator(projectUnit, entryPoint).generate();
    return code;
}

export { compile };
//# sourceMappingURL=compile.js.map
