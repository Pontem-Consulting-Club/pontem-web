/**
 * Fechas en la zona horaria del club.
 *
 * Un evento "del 15 de octubre" es el 15 en Chile, lo abra quien lo abra y lo
 * pinte el servidor (UTC en Vercel) o el navegador. Antes, el formulario guardaba
 * el dia elegido como medianoche UTC, que en Chile es el dia anterior a las 21:00:
 * la tarjeta mostraba un dia menos y el servidor y el navegador no coincidian.
 */
export const CLUB_TIME_ZONE = 'America/Santiago'

// Columnas `date` (sin hora) llegan como YYYY-MM-DD; las `timestamptz`, con hora.
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

const pad = (value: number) => String(value).padStart(2, '0')

const partsInClub = (instant: Date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: CLUB_TIME_ZONE,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).formatToParts(instant)
    const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value)

    return {
        year: get('year'),
        month: get('month'),
        day: get('day'),
        hour: get('hour'),
        minute: get('minute'),
        second: get('second')
    }
}

/** Instante en que el reloj de Chile marca esa hora de ese dia (con su horario de verano). */
const instantInClub = (day: string, hour: number, minute: number, second: number): string => {
    const [year = 0, month = 1, date = 1] = day.split('-').map(Number)
    const wall = Date.UTC(year, month - 1, date, hour, minute, second)
    const offsetAt = (instant: number) => {
        const p = partsInClub(new Date(instant))
        return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - instant
    }
    // Dos pasadas: el desfase puede cambiar justo entre la hora de pared y el instante.
    const first = wall - offsetAt(wall)
    return new Date(wall - offsetAt(first)).toISOString()
}

/** Dia calendario (YYYY-MM-DD) en Chile de una fecha guardada. */
export const clubDay = (value: string | Date): string => {
    if (typeof value === 'string' && DATE_ONLY.test(value)) return value
    const { year, month, day } = partsInClub(new Date(value))
    return `${year}-${pad(month)}-${pad(day)}`
}

/** Hoy, en Chile. */
export const todayInClub = (): string => clubDay(new Date())

/**
 * Pone una fecha guardada en otro dia de Chile sin tocar su hora. Sin hora previa
 * (un borrador nuevo) queda al final del dia, asi un evento sigue como proximo, y
 * con inscripcion abierta, durante todo su dia.
 */
export const setClubDay = (day: string, previous?: string | null): string => {
    if (previous && !DATE_ONLY.test(previous)) {
        const time = partsInClub(new Date(previous))
        if (!Number.isNaN(time.hour)) return instantInClub(day, time.hour, time.minute, time.second)
    }
    return instantInClub(day, 23, 59, 0)
}

/** Formatea en espanol el dia de Chile de una fecha guardada. */
export const formatClubDate = (value: string, options: Intl.DateTimeFormatOptions): string => {
    if (DATE_ONLY.test(value)) {
        // Un dia sin hora no se mueve de zona: se formatea tal cual.
        return new Date(`${value}T12:00:00Z`).toLocaleDateString('es-ES', { ...options, timeZone: 'UTC' })
    }
    return new Date(value).toLocaleDateString('es-ES', { ...options, timeZone: CLUB_TIME_ZONE })
}
