"use client";

import { createContext, useContext, useMemo } from "react";
import type { CmsAsset, CmsSection, Navigation, SiteSettings } from "@/lib/cms";

type CmsValue = {
  copy: (section: string, key: string, fallback: string) => string;
  asset: (key: string, fallback: string) => string;
  settings: SiteSettings | null;
  navigation: Navigation | null;
};

const CmsContext = createContext<CmsValue | null>(null);

function assetUrl(assets: CmsAsset[] | undefined, key: string, fallback: string) {
  const asset = assets?.find((item) => item.key === key)?.asset;
  const url = asset && typeof asset === "object" ? asset.url : null;
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${(process.env.NEXT_PUBLIC_PAYLOAD_URL || "https://payload.gmfb.co.nz").replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function CmsProvider({ settings, navigation, children }: { settings: SiteSettings | null; navigation: Navigation | null; children: React.ReactNode }) {
  const value = useMemo<CmsValue>(() => {
    const sections = new Map((settings?.contentSections || []).map((item: CmsSection) => [item.key, item]));
    return {
      copy(sectionKey, entryKey, fallback) { return sections.get(sectionKey)?.entries?.find((item) => item.key === entryKey)?.text || fallback; },
      asset(key, fallback) { return assetUrl(settings?.siteAssets, key, fallback); },
      settings,
      navigation,
    };
  }, [settings, navigation]);
  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) throw new Error("useCms must be used inside CmsProvider");
  return context;
}
