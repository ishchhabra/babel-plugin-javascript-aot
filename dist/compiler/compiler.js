import { CFGBuilder } from '../cfg/CFGBuilder.js';
import { CodeGenerator } from '../codegen/CodeGenerator.js';
import { HIRBuilder } from '../hir/HIRBuilder.js';
import { LateOptimizer } from '../late-optimizer/LateOptimizer.js';
import { PluginOptionsSchema } from '../schemas/plugin-options.js';
import { SSABuilder } from '../ssa/SSABuilder.js';
import { SSAEliminator } from '../ssa/SSAEliminator.js';
import { Environment } from './environment.js';

class Compiler {
    compileProgram(program, pluginOptions) {
        const options = PluginOptionsSchema.parse(pluginOptions);
        const environment = new Environment();
        const { blocks } = new HIRBuilder(program, environment).build();
        const { predecessors, backEdges, postOrder } = new CFGBuilder(environment, blocks).build();
        const { phis } = new SSABuilder(predecessors, environment).build();
        const ssaEliminatorResult = new SSAEliminator(environment, blocks, phis).eliminate();
        const lateOptimizerResult = new LateOptimizer(options, environment, ssaEliminatorResult.blocks, postOrder).optimize();
        const generator = new CodeGenerator(lateOptimizerResult.blocks, backEdges);
        const code = generator.generate();
        return code;
    }
}

export { Compiler };
//# sourceMappingURL=compiler.js.map
