import { GetData } from "./Data"

export interface ServerComponent {
    name : string
    ip : string
}

export function FindServerByID(id : number) : ServerComponent {
    return serversList[id - 1]
}

export function FindServerByName(name : string) : ServerComponent {
    for (const server of serversList) {
        if (server.name.toLowerCase() === name.toLowerCase()) {
            return server
        }
    }
}

var serversList : ServerComponent[] = GetData("servers")

export default serversList