import { z } from "zod";
export declare const PluginOptionsSchema: z.ZodObject<{
    enableLoadStoreForwardingPass: z.ZodDefault<z.ZodBoolean>;
    enableLateDeadCodeEliminationPass: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enableLoadStoreForwardingPass: boolean;
    enableLateDeadCodeEliminationPass: boolean;
}, {
    enableLoadStoreForwardingPass?: boolean | undefined;
    enableLateDeadCodeEliminationPass?: boolean | undefined;
}>;
export type PluginOptions = z.infer<typeof PluginOptionsSchema>;
