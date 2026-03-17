import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'
import { TEAM_ROLES } from '~~/server/utils/teamRoles'

type TeamRow = Database['public']['Tables']['Team']['Row']

type TeamPayload = Pick<TeamRow, 'name' | 'role' | 'image_url'>

export default defineEventHandler(async (event) => {
    await requireUser(event)

    const normalizeValue = (value?: string | null) => {
        if (value === undefined || value === null) return null
        const trimmed = value.toString().trim()
        return trimmed === '' ? null : trimmed
    }

    const parsePayload = async () => {
        const contentType = getHeader(event, 'content-type') ?? ''

        if (contentType.includes('multipart/form-data')) {
            const parts = await readMultipartFormData(event)
            const body: Record<string, string> = {}
            let imagePart: { data: Buffer; filename?: string; type?: string } | null = null

            if (parts) {
                for (const part of parts) {
                    if (!part.name) continue
                    if (part.name === 'image') {
                        imagePart = {
                            data: part.data,
                            filename: part.filename,
                            type: part.type
                        }
                        continue
                    }
                    body[part.name] = part.data.toString()
                }
            }

            return { body, imagePart }
        }

        const body = await readBody<Record<string, string | null | undefined>>(event)
        return { body: body ?? {}, imagePart: null }
    }

    const { body, imagePart } = await parsePayload()

    if (!body.name || !body.role) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Name and role are required'
        })
    }

    if (!(TEAM_ROLES as readonly string[]).includes(body.role)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid role. Must be one of: ${TEAM_ROLES.join(', ')}`
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    let imagePath = normalizeValue(body.image_url ?? null)
    if (imagePart) {
        const extension = imagePart.filename?.split('.').pop() || 'jpg'
        const fileId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`
        const filename = `${fileId}.${extension}`
        imagePath = `team/${filename}`

        const { error: uploadError } = await supabase
            .storage
            .from('images')
            .upload(imagePath, imagePart.data, {
                cacheControl: '3600',
                upsert: false,
                contentType: imagePart.type ?? 'application/octet-stream'
            })

        if (uploadError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Error uploading image',
                message: uploadError.message
            })
        }
    }

    const payload: TeamPayload = {
        name: body.name,
        role: body.role,
        image_url: imagePath
    }

    const { error } = await supabase.from('Team').insert(payload)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating team member',
            message: error.message
        })
    }

    return { message: 'Team member created successfully' }
})
