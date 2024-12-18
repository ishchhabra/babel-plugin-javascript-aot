export type OptimizationOptions = {
  enableConstantPropagation: boolean;
  enableFunctionInlining: boolean;
};

export const DEFAULT_OPTIMIZATION_OPTIONS: OptimizationOptions = {
  enableConstantPropagation: false,
  enableFunctionInlining: false,
};
