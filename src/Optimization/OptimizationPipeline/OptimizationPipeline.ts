import { Environment } from "../../Environment";
import { Bindings } from "../../HIR";
import { BlockId } from "../../HIR/Block";

import { Block } from "../../HIR/Block";
import { constantPropagation } from "../ConstantPropagation/ConstantPropagation";
import { functionInlining } from "../FunctionInlining/FunctionInlining";
import {
  DEFAULT_OPTIMIZATION_OPTIONS,
  OptimizationOptions,
} from "./OptimizationOptions";
import { OptimizationReporter } from "./OptimizationReporter";

export class OptimizationPipeline {
  #environment: Environment;
  #reporter: OptimizationReporter;
  #options: OptimizationOptions;

  constructor(
    environment: Environment,
    options: OptimizationOptions = DEFAULT_OPTIMIZATION_OPTIONS,
  ) {
    this.#environment = environment;
    this.#options = options;
    this.#reporter = new OptimizationReporter();
  }

  /**
   * Runs the optimization pipeline on the given blocks
   */
  run(bindings: Bindings, blocks: Map<BlockId, Block>): void {
    if (this.#options.enableConstantPropagation) {
      constantPropagation(blocks, this.#reporter);
    }

    if (this.#options.enableFunctionInlining) {
      functionInlining(bindings, blocks, this.#reporter);
    }

    // this.reporter.report();
  }

  /**
   * Gets the optimization metrics reporter
   */
  getMetrics(): OptimizationReporter {
    return this.#reporter;
  }
}
