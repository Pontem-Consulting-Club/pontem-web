import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'
import { isValidTeamCoordination, TEAM_COORDINATIONS } from '~~/server/utils/teamRoles'

type TeamRow = Database['public']['Tables']['Team']['Row']

type TeamPayload = Pick<TeamRow, 'name' | 'coordination'>

export default defineEventHandler(async (event) => {
    await requireCan(event, 'content.edit')

    const body = await readBody<Record<string, string | null | undefined>>(event)

    if (!body?.name || !body?.coordination) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Name and coordination are required'
        })
    }

    if (!isValidTeamCoordination(body.coordination.toString().trim())) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid team coordination. Allowed values: ${TEAM_COORDINATIONS.join(', ')}`
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const payload: TeamPayload = {
        name: body.name.toString().trim(),
        coordination: body.coordination.toString().trim() as TeamPayload['coordination'],
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
