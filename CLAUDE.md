# Diaverzum Novi Sad — Project Context

## Project Overview
Website for a diabetes patient association "Diaverzum Novi Sad".
Inspired by plavikrug.org. Language: Serbian (Latin script only).

## Tech Stack
- **Framework**: Next.js 14, App Router, TypeScript
- **CSS**: Tailwind CSS v3
- **Content**: MDX files (local, via next-mdx-remote + gray-matter)
- **Package manager**: npm
- **Node**: v18.x

## Design System

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| `brand-blue` | `#0056b3` | Primary CTA, links, accents |
| `brand-blue-dark` | `#003d80` | Hover states |
| `brand-blue-light` | `#e8f0fb` | Backgrounds, cards |
| `brand-gray` | `#f5f7fa` | Page backgrounds |
| `brand-gray-mid` | `#e2e8f0` | Borders, dividers |
| `brand-gray-text` | `#64748b` | Secondary text |

### Spacing Rhythm — 8px base
All spacing, padding, margin must be multiples of 8px:
`8 | 16 | 24 | 32 | 48 | 64 | 96px`

### Typography
- Font: Inter (Google Fonts)
- Base: 16px / line-height 1.6
- Headings: font-weight 700
- Body: font-weight 400

### Accessibility (WCAG 2.1 AA)
- Minimum contrast ratio: 4.5:1 for text
- Focus indicators on all interactive elements
- ARIA labels on icon-only buttons
- Semantic HTML (nav, main, article, section, footer)
- Skip-to-content link in header

## Naming Conventions
- **Components**: PascalCase (`Navbar.tsx`, `HeroSection.tsx`)
- **Pages**: kebab-case folders (`o-nama/`, `o-dijabetesu/`)
- **Content files**: kebab-case (`prvi-korak-ka-zdravlju.mdx`)
- **CSS classes**: Tailwind utility-first, custom classes only when needed
- **Types**: PascalCase interfaces in `types/` folder

## Folder Structure
```
/app                    # Next.js App Router pages
  /o-nama               # About us
  /vesti                # News listing + [slug]
  /o-dijabetesu         # About diabetes (static)
  /blog                 # Blog listing + [slug]
  /clanovi              # Members (static, images + descriptions)
  /kontakt              # Contact (phone + location)
/components             # Shared UI components
/content
  /vesti                # MDX news articles
  /blog                 # MDX blog posts
/public
  /content              # Images for content (add your own here)
    /vesti              # News images
    /blog               # Blog images
    /clanovi            # Member photos
/lib                    # Utility functions (MDX loader, search)
/types                  # TypeScript interfaces
```

## Pages & Features
| Page | Route | Notes |
|---|---|---|
| Home | `/` | Hero, news slider, quick links |
| O nama | `/o-nama` | Static about page |
| Vesti | `/vesti` | MDX list + dynamic [slug] |
| O dijabetesu | `/o-dijabetesu` | Static info page |
| Blog | `/blog` | MDX list + dynamic [slug] |
| Članovi | `/clanovi` | Static: images + descriptions |
| Kontakt | `/kontakt` | Phone, address, Google Maps embed |

## Content: MDX Frontmatter Schema
### Vesti & Blog
```yaml
---
title: "Naslov članka"
date: "2024-01-15"
excerpt: "Kratak opis..."
image: "/content/vesti/slika.jpg"
author: "Ime Prezime"
tags: ["dijabetes", "zdravlje"]
---
```

## Git & Code Quality
- No git initialized (local dev only)
- ESLint: next/core-web-vitals + next/typescript
- Strict TypeScript: enabled
