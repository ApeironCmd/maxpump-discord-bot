import { Routes, Client, SlashCommandBuilder, Collection } from "discord.js";
import { SlashCommand } from "../types";
import { REST } from "@discordjs/rest"
import { readdirSync } from "fs";
import { join } from "path";

module.exports = (client: Client) => {
    client.commands = new Collection<string, SlashCommand>()

    const slashCommands : SlashCommandBuilder[] = []
    const slashCommandsDir = join(__dirname,"../commands")

    readdirSync(slashCommandsDir).forEach(file => {
        const command : SlashCommand = require(`${slashCommandsDir}/${file}`).default
        client.commands.set(command.command.name, command)

        slashCommands.push(command.command)

        console.log(`Successfully loaded Command: "${file}"`)
    })

    const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

    (async () => {
        try {
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
                body: slashCommands.map(command => command.toJSON())
            }).then((data : any) => {
                console.log(`Successfully loaded ${data.length} command(s)!`)
            }).catch(e => {
                console.log(e)
            })
        } catch (error) {
            console.error(error)
        }
    })()
}