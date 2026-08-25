import { Client, Events, ActivityType } from "discord.js";

module.exports = (client: Client) => {
    client.once(Events.ClientReady, c => {
        console.log(`Ready! Logged in as ${c.user.tag}`)

        client.user.setPresence({
            status: "online",
            activities: [{name: "MAX-PUMP", type: ActivityType.Watching, url: "https://max-pump.games"}]
        })
    })

    require("../Logs")(client)
}