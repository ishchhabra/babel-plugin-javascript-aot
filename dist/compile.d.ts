import { z } from "zod";
export declare const CompilerOptionsSchema: z.ZodObject<{
    /** Whether to enable the optimizer */
    enableOptimizer: z.ZodDefault<z.ZodBoolean>;
    /** Whether to enable the constant propagation pass */
    enableConstantPropagationPass: z.ZodDefault<z.ZodBoolean>;
    /** Whether to enable the late optimizer */
    enableLateOptimizer: z.ZodDefault<z.ZodBoolean>;
    /** Whether to enable the load store forwarding pass */
    enableLoadStoreForwardingPass: z.ZodDefault<z.ZodBoolean>;
    /** Whether to enable the late dead code elimination pass */
    enableLateDeadCodeEliminationPass: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enableOptimizer: boolean;
    enableConstantPropagationPass: boolean;
    enableLateOptimizer: boolean;
    enableLoadStoreForwardingPass: boolean;
    enableLateDeadCodeEliminationPass: boolean;
}, {
    enableOptimizer?: boolean | undefined;
    enableConstantPropagationPass?: boolean | undefined;
    enableLateOptimizer?: boolean | undefined;
    enableLoadStoreForwardingPass?: boolean | undefined;
    enableLateDeadCodeEliminationPass?: boolean | undefined;
}>;
export type CompilerOptions = z.infer<typeof CompilerOptionsSchema>;
export declare function compile(entryPoint: string, options: CompilerOptions): string;