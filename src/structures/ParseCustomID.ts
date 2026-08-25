export function parse_custom_id(custom_id: string) : string[] {
    const [id, ...args] = custom_id.split("/")

    return [id, ...(args || [])]
}