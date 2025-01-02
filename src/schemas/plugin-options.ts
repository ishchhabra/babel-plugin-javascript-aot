import { z } from "zod";

export const PluginOptionsSchema = z.object({});

export type PluginOptions = z.infer<typeof PluginOptionsSchema>;
