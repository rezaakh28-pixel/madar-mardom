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
 * Set these in your environment (Vercel: Settings -> Environment Variables)
 * to point to مدار مردم's real channel on each platform. Any left unset
 * simply won't render a link.
 */
export function getSocialLinks(): SocialLink[] {
  const configs: Array<Omit<SocialLink, "url"> & { envValue?: string }> = [
    { id: "eitaa", label: "ایتا", icon: MessageCircle, brandColor: "#8ecc42", envValue: process.env.NEXT_PUBLIC_EITAA_URL },
    { id: "bale", label: "بله", icon: MessageSquare, brandColor: "#2fa6dc", envValue: process.env.NEXT_PUBLIC_BALE_URL },
    { id: "instagram", label: "اینستاگرام", icon: Camera, brandColor: "#e1306c", envValue: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { id: "telegram", label: "تلگرام", icon: Send, brandColor: "#26a5e4", envValue: process.env.NEXT_PUBLIC_TELEGRAM_URL },
    { id: "aparat", label: "آپارات", icon: Video, brandColor: "#ed1c24", envValue: process.env.NEXT_PUBLIC_APARAT_URL },
    { id: "whatsapp", label: "واتساپ", icon: Phone, brandColor: "#25d366", envValue: process.env.NEXT_PUBLIC_WHATSAPP_URL },
    { id: "youtube", label: "یوتیوب", icon: PlayCircle, brandColor: "#ff0000", envValue: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  ];

  return configs
    .filter((c): c is typeof c & { envValue: string } => Boolean(c.envValue))
    .map(({ envValue, ...rest }) => ({ ...rest, url: envValue }));
}
