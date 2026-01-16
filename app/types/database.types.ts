export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            Events: {
                Row: {
                    id: number
                    title: string
                    subtitle: string | null
                    description: string | null
                    date: string
                    image_url: string | null
                    location: string | null
                    link: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: number
                    title: string
                    subtitle?: string | null
                    description?: string | null
                    date: string
                    image_url?: string | null
                    location?: string | null
                    link?: string | null
                    created_at?: string | null
                }
                Update: {
                    title?: string
                    subtitle?: string | null
                    description?: string | null
                    date?: string
                    image_url?: string | null
                    location?: string | null
                    link?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            Projects: {
                Row: {
                    id: number
                    title: string
                    subtitle: string | null
                    description: string | null
                    image_url: string | null
                    link: string | null
                    link_text: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: number
                    title: string
                    subtitle?: string | null
                    description?: string | null
                    image_url?: string | null
                    link?: string | null
                    link_text?: string | null
                    created_at?: string | null
                }
                Update: {
                    title?: string
                    subtitle?: string | null
                    description?: string | null
                    image_url?: string | null
                    link?: string | null
                    link_text?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            News: {
                Row: {
                    id: number
                    title: string
                    subtitle: string | null
                    type: string | null
                    image_url: string | null
                    author: string | null
                    published_date: string
                    content: string | null
                    link: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: number
                    title: string
                    subtitle?: string | null
                    type?: string | null
                    image_url?: string | null
                    author?: string | null
                    published_date: string
                    content?: string | null
                    link?: string | null
                    created_at?: string | null
                }
                Update: {
                    title?: string
                    subtitle?: string | null
                    type?: string | null
                    image_url?: string | null
                    author?: string | null
                    published_date?: string
                    content?: string | null
                    link?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
        }
        Views: never
        Functions: never
        Enums: never
        CompositeTypes: never
    }
}

export type EventRow = Database['public']['Tables']['Events']['Row']
export type ProjectRow = Database['public']['Tables']['Projects']['Row']
export type NewsRow = Database['public']['Tables']['News']['Row']
