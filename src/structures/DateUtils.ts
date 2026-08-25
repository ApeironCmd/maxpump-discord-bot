export class DateUtils {
    private static monthMap: { [key: string]: number } = {
        'января': 0,
        'февраля': 1,
        'марта': 2,
        'апреля': 3,
        'мая': 4,
        'июня': 5,
        'июля': 6,
        'августа': 7,
        'сентября': 8,
        'октября': 9,
        'ноября': 10,
        'декабря': 11
    }

    public static parseCreateTime(createTime: string): number {
        try {
            const parts = createTime.split(' в ')
            if (parts.length !== 2) {
                return Date.now() // fallback
            }

            const datePart = parts[0] // "27 октября"
            const timePart = parts[1] // "08:36:02"

            const dateParts = datePart.split(' ')
            if (dateParts.length !== 2) {
                return Date.now() // fallback
            }

            const day = parseInt(dateParts[0]) // 27
            const monthName = dateParts[1] // "октября"
            const month = this.monthMap[monthName]

            if (isNaN(day) || month === undefined) {
                return Date.now() // fallback
            }

            const timeParts = timePart.split(':')
            if (timeParts.length < 2) {
                return Date.now() // fallback
            }

            const hours = parseInt(timeParts[0]) // 08
            const minutes = parseInt(timeParts[1]) // 36
            const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0 // 02

            const currentYear = new Date().getFullYear()
            const date = new Date(currentYear, month, day, hours, minutes, seconds)

            return date.getTime()
        } catch (error) {
            console.error('Error parsing createTime:', createTime, error)
            return Date.now() // fallback
        }
    }

    public static sortGamesByCreateTime<T extends { create_time?: string }>(games: T[], ascending: boolean = false): T[] {
        return games.sort((a, b) => {
            const timeA = a.create_time ? this.parseCreateTime(a.create_time) : 0
            const timeB = b.create_time ? this.parseCreateTime(b.create_time) : 0
            
            return ascending ? timeA - timeB : timeB - timeA
        })
    }

    public static sortGamesByCreateTimeAsc<T extends { create_time?: string }>(games: T[]): T[] {
        return this.sortGamesByCreateTime(games, true)
    }

    public static sortGamesByCreateTimeDesc<T extends { create_time?: string }>(games: T[]): T[] {
        return this.sortGamesByCreateTime(games, false)
    }
}