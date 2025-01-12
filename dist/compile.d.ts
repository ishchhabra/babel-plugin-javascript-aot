import { z } from "zod";
export declare const CompilerOptionsSchema: z.ZodObject<{
    enableLoadStoreForwardingPass: z.ZodDefault<z.ZodBoolean>;
    enableLateDeadCodeEliminationPass: z.ZodDefault<z.ZodBoolean>;
    enableConstantPropagationPass: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enableLoadStoreForwardingPass: boolean;
    enableLateDeadCodeEliminationPass: boolean;
    enableConstantPropagationPass: boolean;
}, {
    enableLoadStoreForwardingPass?: boolean | undefined;
    enableLateDeadCodeEliminationPass?: boolean | undefined;
    enableConstantPropagationPass?: boolean | undefined;
}>;
export type CompilerOptions = z.infer<typeof CompilerOptionsSchema>;
export declare function compile(entryPoint: string, options: CompilerOptions): string;
