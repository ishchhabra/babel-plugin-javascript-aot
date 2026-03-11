import { CompilerOptions } from "../../compile";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ExportDeclarationMergingPass } from "./passes/ExportDeclarationMergingPass";
import { LateCopyPropagationPass } from "./passes/LateCopyPropagationPass";
import { LoadStoreForwardingPass } from "./passes/LoadStoreForwardingPass";
import { RedundantCopyEliminationPass } from "./passes/RedundantCopyEliminationPass";

interface LateOptimizerResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class LateOptimizer {
  constructor(
    private readonly functionIR: FunctionIR,
    private readonly projectUnit: ProjectUnit,
    private readonly options: CompilerOptions,
  ) {}

  public run(): LateOptimizerResult {
    let blocks = this.functionIR.blocks;
    if (this.options.enableLoadStoreForwardingPass) {
      const loadStoreForwardingResult = new LoadStoreForwardingPass(
        this.functionIR,
      ).run();
      blocks = loadStoreForwardingResult.blocks;
    }

    if (this.options.enableRedundantCopyEliminationPass) {
      const redundantStoreEliminationResult = new RedundantCopyEliminationPass(
        this.functionIR,
      ).run();
      blocks = redundantStoreEliminationResult.blocks;
    }

    if (this.options.enableLateCopyPropagationPass) {
      const lateCopyPropagationResult = new LateCopyPropagationPass(
        this.functionIR,
      ).run();
      blocks = lateCopyPropagationResult.blocks;
    }

    if (this.options.enableExportDeclarationMergingPass) {
      const exportDeclarationMergingResult = new ExportDeclarationMergingPass(
        this.functionIR,
      ).run();
      blocks = exportDeclarationMergingResult.blocks;
    }

    return { blocks };
  }
}
