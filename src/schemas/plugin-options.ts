import { z } from "zod";

export const PluginOptionsSchema = z.object({
  enableLoadStoreForwardingPass: z.boolean().default(true),
  enableLateDeadCodeEliminationPass: z.boolean().default(true),
});

export type PluginOptions = z.infer<typeof PluginOptionsSchema>;
