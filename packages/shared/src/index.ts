// ☩ São Jorge V2 — Shared types and constants

export interface LiturgicalDay {
  date: string
  toneOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  fastType: 'none' | 'strict' | 'fish' | 'wine-oil' | 'xerophagy'
  feastLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6
  feastNamePt: string | null
  feastNameAr: string | null
  feastNameEn: string | null
  saintSlug: string | null
  epistleRef: string | null
  gospelRef: string | null
  epistleTextPt: string | null
  gospelTextPt: string | null
  troparionSlug: string | null
  kontakionSlug: string | null
  enrichment: DayEnrichment | null
  source: 'antiochian' | 'orthocal' | 'dcs' | 'manual-override'
  status: 'pending' | 'approved' | 'published'
  scrapedAt: string
  approvedAt: string | null
  approvedBy: string | null
}

export interface DayEnrichment {
  saintBioPt: string | null
  saintBioAr: string | null
  patristicQuotePt: string | null
  patristicSource: string | null
  patristicQuoteAr: string | null
  homilySummaryPt: string | null
  reviewFlags: string[]
}

export interface ServiceText {
  slug: string
  titlePt: string
  titleAr: string | null
  titleArTransliterated: string | null
  category: ServiceCategory
  subcategory: string | null
  sections: VerseBlock[]
  status: 'pending' | 'approved' | 'published'
  version: number
  sourceBookletPages: number[] | null
  updatedAt: string
  approvedAt: string | null
  approvedBy: string | null
}

export type ServiceCategory =
  | 'liturgia'
  | 'completas'
  | 'horas'
  | 'ortros'
  | 'vesperas'
  | 'akathistos'
  | 'semana-santa'
  | 'oracoes'
  | 'sacramentos'
  | 'paraklesis'
  | 'preparacao'

export type SectionType = 'heading' | 'rubric' | 'verse' | 'note' | 'dynamic-slot'

export interface VerseBlock {
  id: string
  type: SectionType
  verseNumber: number | null
  speakerPt: string | null
  speakerAr: string | null
  textPt: string | null
  textAr: string | null
  textArTransliterated: string | null
  source: 'api' | 'weekday-variant' | null
  apiKey: string | null
  variants: Record<string, VerseBlock> | null
  fallbackPt: string | null
  fallbackAr: string | null
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  body: string
  author: string
  category: 'catechesis' | 'liturgical' | 'parish-news' | 'patristic'
  tags: string[]
  featuredImage: string | null
  status: 'draft' | 'published'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CatechesisUnit {
  slug: string
  title: string
  description: string
  orderIndex: number
  lessons: CatechesisLesson[]
}

export interface CatechesisLesson {
  slug: string
  unitSlug: string
  title: string
  orderIndex: number
  body: string
  status: 'draft' | 'published'
}

export interface Bulletin {
  id: string
  title: string
  body: string
  category: 'announcement' | 'event' | 'pastoral'
  publishDate: string
  expiresDate: string | null
  status: 'pending' | 'published'
}

export interface PodcastEpisode {
  guid: string
  title: string
  description: string
  publishedAt: string
  durationSec: number
  spotifyUrl: string | null
  buzzsproutUrl: string | null
}
