import { CompilerOptions } from "../../compile";
import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../../ir";
import { LoadStoreForwardingPass } from "./passes/LoadStoreForwardingPass";

interface LateOptimizerResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class LateOptimizer {
  constructor(
    private readonly moduleUnit: ModuleUnit,
    private readonly projectUnit: ProjectUnit,
    private readonly options: CompilerOptions,
  ) {}

  public run(): LateOptimizerResult {
    let blocks = this.moduleUnit.blocks;
    if (this.options.enableLoadStoreForwardingPass) {
      const loadStoreForwardingResult = new LoadStoreForwardingPass(
        this.moduleUnit,
      ).run();
      blocks = loadStoreForwardingResult.blocks;
    }

    return { blocks };
  }
}
