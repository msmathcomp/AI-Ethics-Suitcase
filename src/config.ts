import { z } from 'zod';

export const ConfigSchema = z.object({
  defaultLanguage: z.enum(['en', 'nl']),
  startLevel: z.number().min(-1).max(7),
  showHomePage: z.boolean()
});

export type Config = z.infer<typeof ConfigSchema>;

// Default fallback used if fetching config fails
export const defaultConfig: Config = {
  defaultLanguage: 'en',
  startLevel: -1,
  showHomePage: true
};

let cachedConfig: Config | null = null;
let pendingConfigPromise: Promise<Config> | null = null;

export function resetConfigCache() {
  cachedConfig = null;
  pendingConfigPromise = null;
}

export async function getConfig(force = false): Promise<Config> {
  if (force) resetConfigCache();
  if (cachedConfig) return cachedConfig;
  if (pendingConfigPromise) return pendingConfigPromise;

  const url = `${import.meta.env.BASE_URL}config.json`;
  pendingConfigPromise = fetch(url, { cache: 'no-store' })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to fetch config.json: ${res.status}`);
      const data = await res.json();
      return ConfigSchema.parse(data);
    })
    .then((cfg) => {
      cachedConfig = cfg;
      return cfg;
    })
    .catch((err) => {
      console.error('[config] Falling back to default config due to error:', err);
      cachedConfig = defaultConfig;
      return defaultConfig;
    })
    .finally(() => {
      pendingConfigPromise = null;
    });

  return pendingConfigPromise;
}
