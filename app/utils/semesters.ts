/**
 * Semestres del club, con el formato que ya usa la tabla Projects: "2026 — S2".
 *
 * El primer semestre de la UC va de marzo a julio y el segundo de agosto a
 * diciembre; enero y febrero cuentan como el S1 que viene. El dia se toma en
 * Chile (ver clubDates.ts), no en la zona del servidor ni del navegador.
 */
const SEMESTER_PATTERN = /^(\d{4}) — S([12])$/

export const formatSemester = (year: number, half: 1 | 2): string => `${year} — S${half}`

/** Semestre en curso, en Chile. */
export const currentSemester = (): string => {
    const [year = 0, month = 1] = todayInClub().split('-').map(Number)
    return formatSemester(year, month >= 8 ? 2 : 1)
}

/**
 * Opciones para elegir semestre: el siguiente, el actual y los `back` anteriores,
 * del mas nuevo al mas viejo. Si `keep` no calza en esa lista (un valor antiguo o
 * escrito a mano) se agrega al final para no perderlo al guardar.
 */
export const semesterOptions = (keep?: string | null, back = 10): string[] => {
    const match = SEMESTER_PATTERN.exec(currentSemester())
    let year = Number(match?.[1])
    let half = Number(match?.[2]) as 1 | 2

    // Arranca un semestre adelante.
    if (half === 1) half = 2
    else { year += 1; half = 1 }

    const options: string[] = []
    for (let i = 0; i < back + 2; i++) {
        options.push(formatSemester(year, half))
        if (half === 2) half = 1
        else { year -= 1; half = 2 }
    }

    if (keep && !options.includes(keep)) options.push(keep)
    return options
}

/** El semestre mas reciente de la lista (el formato ordena bien como texto). */
export const latestSemester = (semesters: (string | null | undefined)[]): string | null =>
    semesters.filter((value): value is string => !!value).sort().at(-1) ?? null
