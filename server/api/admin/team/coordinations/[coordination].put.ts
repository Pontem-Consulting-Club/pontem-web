import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'
import { isValidTeamCoordination, TEAM_COORDINATIONS } from '~~/server/utils/teamRoles'

type TeamCoordinationRow = Database['public']['Tables']['TeamCoordination']['Row']
type TeamCoordinationPayload = Pick<TeamCoordinationRow, 'image_url'>

export default defineEventHandler(async (event) => {
    await requireUser(event)

    const coordinationParam = getRouterParam(event, 'coordination')

    if (!isValidTeamCoordination(coordinationParam)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid coordination. Allowed values: ${TEAM_COORDINATIONS.join(', ')}`
        })
    }

    const contentType = getHeader(event, 'content-type') ?? ''

    if (contentType.includes('application/json')) {
        const body = await readBody<{ image_url: string | null }>(event)
        const supabase = await serverSupabaseClient<Database>(event)
        const { error } = await supabase
            .from('TeamCoordination')
            .update({ image_url: body.image_url })
            .eq('coordination', coordinationParam)
        if (error) throw createError({ statusCode: 500, statusMessage: 'Error updating coordination', message: error.message })
        return { message: 'Team coordination updated successfully' }
    }

    const parsePayload = async () => {
        if (contentType.includes('multipart/form-data')) {
            const parts = await readMultipartFormData(event)
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
                    }
                }
            }

            return { imagePart }
        }

        return { imagePart: null }
    }

    const { imagePart } = await parsePayload()

    if (!imagePart) {
        return { message: 'No image provided, nothing to update' }
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const extension = imagePart.filename?.split('.').pop() || 'jpg'
    const fileId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`
    const filename = `${fileId}.${extension}`
    const imagePath = `team/coordinations/${filename}`

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

    const payload: TeamCoordinationPayload = {
        image_url: imagePath
    }

    const { error } = await supabase
        .from('TeamCoordination')
        .update(payload)
        .eq('coordination', coordinationParam)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error updating team coordination',
            message: error.message
        })
    }

    return { message: 'Team coordination updated successfully' }
})
