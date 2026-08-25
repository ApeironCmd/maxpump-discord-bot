import { Client, Events } from "discord.js"
import { ServerStatusManager } from "../structures/ServerStatus"

module.exports = (client: Client) => {
    const serverManager = new ServerStatusManager(client)
    
    client.once(Events.ClientReady, () => {
        serverManager.startUpdating()
    })
}