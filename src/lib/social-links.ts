import { MessageCircle, MessageSquare, Camera, Send, Video, Phone, PlayCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: LucideIcon;
  brandColor: string;
}

/**
 * Real channel URLs — override any of these via environment variable
 * (Vercel: Settings -> Environment Variables) without touching code.
 * Any platform with neither an env value nor a default below simply won't
 * render a link.
 */
export function getSocialLinks(): SocialLink[] {
  const configs: Array<Omit<SocialLink, "url"> & { envValue?: string; defaultUrl?: string }> = [
    {
      id: "telegram",
      label: "تلگرام",
      icon: Send,
      brandColor: "#26a5e4",
      envValue: process.env.NEXT_PUBLIC_TELEGRAM_URL,
      defaultUrl: "https://t.me/madar_mardom",
    },
    {
      id: "eitaa",
      label: "ایتا",
      icon: MessageCircle,
      brandColor: "#8ecc42",
      envValue: process.env.NEXT_PUBLIC_EITAA_URL,
      defaultUrl: "https://eitaa.com/madar_mardom",
    },
    {
      id: "bale",
      label: "بله",
      icon: MessageSquare,
      brandColor: "#2fa6dc",
      envValue: process.env.NEXT_PUBLIC_BALE_URL,
      defaultUrl: "https://ble.ir/madar_mardom",
    },
    {
      id: "instagram",
      label: "اینستاگرام",
      icon: Camera,
      brandColor: "#e1306c",
      envValue: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      defaultUrl: "https://www.instagram.com/madar.mardom",
    },
    { id: "aparat", label: "آپارات", icon: Video, brandColor: "#ed1c24", envValue: process.env.NEXT_PUBLIC_APARAT_URL },
    { id: "whatsapp", label: "واتساپ", icon: Phone, brandColor: "#25d366", envValue: process.env.NEXT_PUBLIC_WHATSAPP_URL },
    { id: "youtube", label: "یوتیوب", icon: PlayCircle, brandColor: "#ff0000", envValue: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  ];

  return configs
    .map(({ envValue, defaultUrl, ...rest }) => ({ ...rest, url: envValue || defaultUrl }))
    .filter((c): c is SocialLink => Boolean(c.url));
}
