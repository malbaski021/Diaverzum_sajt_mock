const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
}

export default function Img({ src, alt, fill, width, height, className, style, priority }: Props) {
  const fullSrc = src.startsWith("http") ? src : `${BASE}${src}`;

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fullSrc}
        alt={alt}
        className={className}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fullSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
