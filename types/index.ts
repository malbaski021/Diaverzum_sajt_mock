export interface ArticleMeta {
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  noHero?: boolean;
  heroLayout?: "top" | "float";
  gallery?: string[];
  author: string;
  tags: string[];
  slug: string;
  arhivirano?: boolean;
}

export interface Article extends ArticleMeta {
  content: string;
}

export interface Member {
  id: number;
  name: string;
  role: string;
  bio: string;
  image?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface JunioriPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  type: "video" | "gallery";
  coverImage: string | null;
  videoSrc?: string;
  images: string[];
  author: string;
  tags: string[];
}
