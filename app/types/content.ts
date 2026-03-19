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
    image_url?: string | null
}
