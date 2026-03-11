"use client";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface Props {
  src: string;
  title: string;
}

export default function JunioriVideoPlayer({ src, title }: Props) {
  const fullSrc = src.startsWith("http") ? src : `${BASE}${src}`;

  return (
    <div className="rounded-2xl overflow-hidden bg-black shadow-lg max-w-4xl">
      <video
        controls
        className="w-full"
        preload="metadata"
        aria-label={title}
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          const fallback = el.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "flex";
        }}
      >
        <source src={fullSrc} type="video/mp4" />
        Vaš pretraživač ne podržava video.
      </video>
      <div
        className="hidden items-center justify-center py-16 bg-brand-blue-light text-brand-gray-text text-sm"
        aria-live="polite"
      >
        Video trenutno nije dostupan.
      </div>
    </div>
  );
}
