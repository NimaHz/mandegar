import type { ComponentProps } from "react";

import type { SocialLinks } from "@/types/content";

export type SocialPlatform = keyof SocialLinks;

const paths: Record<SocialPlatform, string> = {
  aparat:
    "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-3.4 4.1a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6Zm6.8 0a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6Zm-6.8 7.2a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6Zm6.8 0a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6ZM12 10.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
  instagram:
    "M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.7 1.5a1.2 1.2 0 1 1 0 2.5 1.2 1.2 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  telegram:
    "M21.4 3.6 2.9 10.8c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.6ZM9.5 14.2l8.6-5.4c.4-.3.8-.1.5.2l-7.1 6.4-.3 3Z",
  bale: "M12 2.5c5.2 0 9.5 4 9.5 9s-4.3 9-9.5 9c-1.5 0-2.9-.3-4.2-.9L3 20.8l1.3-4.3A8.6 8.6 0 0 1 2.5 11.5c0-5 4.3-9 9.5-9Zm3.9 6.1-5 5-2.3-2.3-1.4 1.4 3.7 3.7 6.4-6.4-1.4-1.4Z",
  eitaa:
    "M6 3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-5.6L7 21.6V18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm6.2 3.6a4 4 0 0 0-4 4.1 3.9 3.9 0 0 0 4 3.9c1.4 0 2.6-.6 3.4-1.7l-1.5-1c-.4.6-1.1 1-1.9 1-.9 0-1.7-.6-2-1.4h5.8c0-.3.1-.5.1-.8a4 4 0 0 0-3.9-4.1Zm-.1 1.8c.8 0 1.5.5 1.8 1.3h-3.6c.3-.8 1-1.3 1.8-1.3Z",
  rubika:
    "m12 2 8.7 5v10L12 22l-8.7-5V7L12 2Zm0 2.3L5.3 8.1v7.8l6.7 3.8 6.7-3.8V8.1L12 4.3Zm0 3.2 3.9 2.2v4.6L12 16.5l-3.9-2.2V9.7L12 7.5Z",
  linkedin:
    "M4.5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h3v12H3Zm6 0h2.9v1.7c.5-.9 1.7-2 3.6-2 3.8 0 4.5 2.4 4.5 5.6V21h-3v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v6H9Z",
};

interface SocialIconProps extends ComponentProps<"svg"> {
  platform: SocialPlatform;
}

export function SocialIcon({ platform, ...props }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden {...props}>
      <path d={paths[platform]} />
    </svg>
  );
}
