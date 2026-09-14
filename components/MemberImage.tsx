"use client";

const DEFAULT = "/content/clanovi/default.jpg";

interface Props {
  src: string;
  alt: string;
}

export default function MemberImage({ src, alt }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || DEFAULT}
      alt={alt}
      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT; }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
    />
  );
}
