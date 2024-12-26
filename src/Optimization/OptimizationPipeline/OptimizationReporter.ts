/**
 * Reports statistics about optimizations performed during compilation
 */
export class OptimizationReporter {
  /**
   * Statistics counters for different optimization types
   */
  private stats = {
    constantPropagation: 0,
    functionInlining: 0,
  };

  /**
   * Records that a constant propagation optimization was performed
   */
  recordConstantPropagation(): void {
    this.stats.constantPropagation++;
  }

  /**
   * Records that a function inlining optimization was performed
   */
  recordFunctionInlining(): void {
    this.stats.functionInlining++;
  }

  /**
   * Prints a report of all optimization statistics to the console
   */
  report(): void {
    console.log("=== Optimization Report ===");
    console.log(`Constant propagations: ${this.stats.constantPropagation}`);
    console.log(`Function inlinings: ${this.stats.functionInlining}`);
    console.log("========================");
  }
}
