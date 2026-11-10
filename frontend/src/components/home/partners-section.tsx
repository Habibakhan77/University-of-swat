import Image from "next/image";
import { Handshake } from "lucide-react";
import type { Partner } from "@/lib/strapi/home";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartLink } from "@/components/layout/smart-link";

interface PartnersSectionProps {
  partners: Partner[];
  labels: { eyebrow: string; title: string; mou: (year: number) => string };
}

/** Partners and MoUs from the Homepage entry. Shows the logo when one is uploaded, else the name. */
export function PartnersSection({ partners, labels }: PartnersSectionProps) {
  if (!partners.length) return null;

  return (
    <section aria-labelledby="home-partners" className="border-t border-line py-section-sm">
      <Container size="wide" className="flex flex-col gap-8">
        <SectionHeading id="home-partners" eyebrow={labels.eyebrow} title={labels.title} size="md" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner) => {
            const body = (
              <>
                {partner.logo ? (
                  <Image
                    src={partner.logo.src}
                    alt=""
                    width={partner.logo.width}
                    height={partner.logo.height}
                    className="h-10 w-auto max-w-28 object-contain"
                  />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-fg">
                    <Handshake aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="text-body-sm font-semibold text-pretty">{partner.name}</span>
                  {partner.country || partner.year ? (
                    <span className="text-caption text-fg-subtle">
                      {[partner.country, partner.year ? labels.mou(partner.year) : null].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </span>
              </>
            );
            return (
              <li key={partner.name} className="flex">
                {partner.href ? (
                  <SmartLink
                    href={partner.href}
                    external
                    className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
                  >
                    {body}
                  </SmartLink>
                ) : (
                  <div className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
