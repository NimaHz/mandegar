import { Clock3, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { SocialIcon } from "@/components/icons/social-icon";
import { socialLinksFor } from "@/components/layout/social-links";
import { CopyButton } from "@/components/shared/copy-button";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import type { SiteSettings } from "@/types/content";

import { type ContactContent, contactLocation } from "../content";
import { mapLinks } from "../map-links";

interface ContactChannelsProps {
  locale: Locale;
  content: ContactContent;
  settings: SiteSettings;
  className?: string;
}

interface ChannelGroupProps {
  icon: typeof Phone;
  title: string;
  children: ReactNode;
}

function ChannelGroup({ icon: Icon, title, children }: ChannelGroupProps) {
  return (
    <div className="flex flex-col gap-3 p-5">
      <h3 className="flex items-center gap-2 text-xs font-extrabold text-muted">
        <Icon className="size-4 text-primary" aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}

const rowClass = "flex items-center gap-3 rounded-field bg-raised px-3.5 py-2.5 ring-1 ring-line";

export function ContactChannels({ locale, content, settings, className }: ContactChannelsProps) {
  const { channels } = content;
  const socials = socialLinksFor(settings.socials, locale);
  const maps = mapLinks(contactLocation);

  return (
    <aside aria-labelledby="contact-channels" className={cn("flex flex-col gap-4", className)}>
      <h2 id="contact-channels" className="sr-only">
        {channels.title}
      </h2>
      <div className="flex flex-col divide-y divide-line card">
        {settings.phones.length > 0 && (
          <ChannelGroup icon={Phone} title={channels.phones}>
            <ul className="flex flex-col gap-2">
              {settings.phones.map((phone) => (
                <li key={phone.value} className={rowClass}>
                  <a
                    href={`tel:${phone.value.replace(/[^\d+]/g, "")}`}
                    aria-label={fill(channels.call, { label: phone.label })}
                    className="flex min-w-0 flex-1 flex-col transition-colors hover:text-primary"
                  >
                    <span className="text-xs text-muted">{phone.label}</span>
                    <bdi dir="ltr" className="font-code text-sm font-bold text-ink">
                      {phone.value}
                    </bdi>
                  </a>
                  <CopyButton value={phone.value} label={phone.label} className="size-9" />
                </li>
              ))}
            </ul>
          </ChannelGroup>
        )}
        {settings.emails.length > 0 && (
          <ChannelGroup icon={Mail} title={channels.emails}>
            <ul className="flex flex-col gap-2">
              {settings.emails.map((email) => (
                <li key={email.value} className={rowClass}>
                  <a
                    href={`mailto:${email.value}`}
                    aria-label={fill(channels.write, { label: email.label })}
                    className="flex min-w-0 flex-1 flex-col transition-colors hover:text-primary"
                  >
                    <span className="text-xs text-muted">{email.label}</span>
                    <bdi dir="ltr" className="truncate text-sm font-bold text-ink">
                      {email.value}
                    </bdi>
                  </a>
                  <CopyButton value={email.value} label={email.label} className="size-9" />
                </li>
              ))}
            </ul>
          </ChannelGroup>
        )}
        {settings.address && (
          <ChannelGroup icon={MapPin} title={channels.address}>
            <address className="text-sm leading-7 font-semibold text-ink not-italic">
              {settings.address}
            </address>
            <div className="flex flex-wrap gap-2">
              {[
                { href: maps.neshan, label: channels.neshan },
                { href: maps.balad, label: channels.balad },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={channels.mapHint}
                  className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line-strong bg-surface px-3 text-label font-bold text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  {link.label}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              ))}
            </div>
          </ChannelGroup>
        )}
        {settings.hours && (
          <ChannelGroup icon={Clock3} title={channels.hours}>
            <p className="text-sm leading-7 font-semibold text-ink">{settings.hours}</p>
          </ChannelGroup>
        )}
        {socials.length > 0 && (
          <ChannelGroup icon={ExternalLink} title={channels.socials}>
            <ul className="flex flex-wrap gap-2">
              {socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid size-10 place-items-center rounded-field border border-line bg-raised text-ink transition-colors hover:border-line-strong hover:text-primary"
                  >
                    <SocialIcon platform={social.platform} className="size-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          </ChannelGroup>
        )}
      </div>
    </aside>
  );
}
