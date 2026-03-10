export interface ArticleMeta {
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  author: string;
  tags: string[];
  slug: string;
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
