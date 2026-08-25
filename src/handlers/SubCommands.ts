import { Client, Collection } from "discord.js"
import { SubCommand } from "../types"
import { readdirSync } from "fs"
import { join } from "path"

module.exports = (client: Client) => {
    client.subcommands = new Collection<string, SubCommand>()

    const subCommandsDir = join(__dirname,"../subcommands")

    readdirSync(subCommandsDir).forEach(file => {
        const command : SubCommand = require(`${subCommandsDir}/${file}`).default
        client.subcommands.set(command.id, command)

        console.log(`Successfully loaded SubCommand: "${file}"`)
    })
}