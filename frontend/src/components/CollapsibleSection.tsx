import { useState } from "react";

interface Props {
  title: string;
  description: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="mb-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 text-left cursor-pointer group mb-4"
      >
        <span
          className="mt-1 shrink-0 text-gray-500 group-hover:text-gray-300 transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 3L11 8L6 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors">
              {title}
            </h2>
            {badge && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        </div>
      </button>
      {open && children}
    </section>
  );
}
