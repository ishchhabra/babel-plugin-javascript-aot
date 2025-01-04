import { z } from "zod";
export const PluginOptionsSchema = z.object({
    enableLoadStoreForwardingPass: z.boolean().default(true),
    enableLateDeadCodeEliminationPass: z.boolean().default(true),
});
//# sourceMappingURL=plugin-options.js.map