import { z } from 'zod';

const PluginOptionsSchema = z.object({
    enableLoadStoreForwardingPass: z.boolean().default(true),
    enableLateDeadCodeEliminationPass: z.boolean().default(true),
});

export { PluginOptionsSchema };
//# sourceMappingURL=plugin-options.js.map
