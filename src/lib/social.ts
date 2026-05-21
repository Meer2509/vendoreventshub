export type SocialLink = {
  label: string;
  icon: string;
  className: string;
  url: string;
};

export function cleanSocialUrl(type: string, value: string) {
  if (!value?.trim()) return "";

  if (value.startsWith("http")) return value;

  const cleanValue = value.replace("@", "").trim();

  if (type === "instagram") return `https://instagram.com/${cleanValue}`;
  if (type === "tiktok") return `https://tiktok.com/@${cleanValue}`;
  if (type === "facebook") return `https://facebook.com/${cleanValue}`;

  return value;
}

export function buildSocialLinks(source: {
  website?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
}): SocialLink[] {
  return [
    {
      label: "Website",
      icon: "🌐",
      className: "website",
      url: source.website?.trim() || "",
    },
    {
      label: "Instagram",
      icon: "📸",
      className: "instagram",
      url: cleanSocialUrl("instagram", source.instagram || ""),
    },
    {
      label: "TikTok",
      icon: "🎵",
      className: "tiktok",
      url: cleanSocialUrl("tiktok", source.tiktok || ""),
    },
    {
      label: "Facebook",
      icon: "📘",
      className: "facebook",
      url: cleanSocialUrl("facebook", source.facebook || ""),
    },
  ].filter((item) => Boolean(item.url));
}
