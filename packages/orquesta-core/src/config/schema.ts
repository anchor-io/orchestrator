import * as v from "valibot";

export const SUPPORTED_LOCALES = ["en", "es", "de"] as const;

const LocaleSchema = v.picklist(SUPPORTED_LOCALES);

export const DEFAULT_LOCALE: (typeof SUPPORTED_LOCALES)[number] = "en";

export const PiConfigSchema = v.object({
  /** Pi user/config directory. Maps to PI_CODING_AGENT_DIR. */
  agentDir: v.optional(v.string()),
  /** Pi session storage directory. Maps to PI_CODING_AGENT_SESSION_DIR. */
  sessionDir: v.optional(v.string()),
});

/** The valibot schema and inferred TypeScript types for Orquesta's config. */
export const ConfigSchema = v.object({
  $schema: v.optional(v.string()),
  lang: v.optional(LocaleSchema, DEFAULT_LOCALE),
  pi: v.optional(PiConfigSchema),
});

/** The validated output type of the config schema. */
export type Config = v.InferOutput<typeof ConfigSchema>;

/** Pi-specific configuration embedded inside Orquesta's config. */
export type PiConfig = v.InferOutput<typeof PiConfigSchema>;

/** The input type accepted by the config schema before defaults are applied. */
export type ConfigInput = v.InferInput<typeof ConfigSchema>;
