import { useState } from "react";
import { Icon } from "./Icon";

interface Props {
  title: string;
  description: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  eyebrow?: string;
}

export function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
  eyebrow,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="mb-12">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 text-left cursor-pointer group"
        aria-expanded={open}
      >
        <span
          className="mt-2 shrink-0 text-secondary group-hover:text-primary transition-all duration-300"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        >
          <Icon name="chevron_right" className="text-[20px]" />
        </span>
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary mb-1.5">
              {eyebrow}
            </div>
          )}
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="font-headline text-2xl md:text-3xl italic font-bold text-on-surface group-hover:text-primary transition-colors">
              {title}
            </h2>
            {badge && (
              <span className="font-label text-[10px] uppercase tracking-[0.22em] text-secondary">
                {badge}
              </span>
            )}
          </div>
          <p className="font-body text-sm text-on-surface-variant mt-1 leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
      </button>
      {open && <div className="mt-8 pl-0 md:pl-10">{children}</div>}
    </section>
  );
}
