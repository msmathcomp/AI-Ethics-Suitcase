import { t, type Dictionary } from "intlayer";
import translations from "../tr/index.ts";
import intlayerConfig from "../intlayer.config.ts";

type JsonTree = string | { [key: string]: JsonTree };

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function buildContentFromEn(
  enNode: JsonTree | undefined,
  localeTrees: Record<string, JsonTree | undefined>
): unknown {
  const configuredLocales = (intlayerConfig.internationalization?.locales ?? []).map((l) => l.toLowerCase());

  if (typeof enNode === "string") {
    const enVal = enNode;
    // Build values only for configured locales; enforce required keys by later cast
    const values: Record<string, string> = {};
    for (const locale of configuredLocales) {
      const v = localeTrees[locale];
      values[locale] = typeof v === "string" ? v : enVal;
    }
    if (!("en" in values)) values.en = enVal;
    return t(values as unknown as { [K in keyof typeof translations]: string });
  }

  if (isObj(enNode)) {
    const result: Record<string, unknown> = {};
    const enObj = enNode as Record<string, JsonTree>;
    for (const key of Object.keys(enObj)) {
      const childTrees: Record<string, JsonTree | undefined> = {};
      for (const locale of configuredLocales) {
        const v = localeTrees[locale];
        childTrees[locale] = isObj(v) ? (v as Record<string, JsonTree>)[key] : undefined;
      }
      const child = buildContentFromEn(enObj[key], childTrees);
      if (child !== undefined) result[key] = child;
    }
    return result;
  }

  return undefined;
}

const allLocales = translations as Record<string, JsonTree>;

const appContent = {
  key: "app",
  content: buildContentFromEn(allLocales.en, allLocales) as Dictionary["content"],
} satisfies Dictionary;

export default appContent;