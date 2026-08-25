import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

module.exports = (client: Client) => {
    const eventsDir = join(__dirname, "../events")

    readdirSync(eventsDir).forEach(file => {
        const path : string = `${eventsDir}/${file}`

        require(path)(client)
        console.log(`Successfully loaded Event: "${file}"`)
    })
}