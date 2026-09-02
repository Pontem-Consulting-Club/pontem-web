import type { Database } from './database.types'

type TeamCoordination = Database['public']['Enums']['ClubCoordination']

export interface EventRecord {
    id: number
    title: string
    subtitle?: string | null
    description?: string | null
    date: string
    image_url?: string | null
    location?: string | null
    link?: string | null
}

export interface ProjectRecord {
    id: number
    title: string
    subtitle?: string | null
    description?: string | null
    image_url?: string | null
    link?: string | null
    link_text?: string | null
    is_active?: boolean
    semester?: string | null
}

export interface NewsRecord {
    id: number
    title: string
    subtitle?: string | null
    type?: string | null
    image_url?: string | null
    author?: string | null
    published_date: string
    content?: string | null
    link?: string | null
}

export interface TeamRecord {
    id: number
    name: string
    coordination: TeamCoordination
}

export interface TeamCoordinationRecord {
    coordination: TeamCoordination
    image_url: string | null
    created_at: string
}

export interface HeroSlideRecord {
    id: number
    title: string
    subtitle?: string | null
    button_text?: string | null
    image_url?: string | null
    link?: string | null
    position: number
}

type CaseCategory = Database['public']['Enums']['CaseCategory']
type CaseDifficulty = Database['public']['Enums']['CaseDifficulty']
type CaseResourceKind = Database['public']['Enums']['CaseResourceKind']

export interface CaseStudyRecord {
    id: number
    title: string
    company?: string | null
    company_logo_url?: string | null
    category: CaseCategory
    difficulty?: CaseDifficulty | null
    duration_minutes?: number | null
    case_type?: string | null
    summary?: string | null
    problem_statement?: string | null
    document_url?: string | null
    document_name?: string | null
    document_size_bytes?: number | null
    published_date?: string | null
    created_at?: string
}

export interface CaseStudyResourceRecord {
    id: number
    case_study_id: number
    kind: CaseResourceKind
    title: string
    link?: string | null
    document_url?: string | null
    position: number
    created_at?: string
}

export interface CaseStudyDetail extends CaseStudyRecord {
    resources: CaseStudyResourceRecord[]
}
