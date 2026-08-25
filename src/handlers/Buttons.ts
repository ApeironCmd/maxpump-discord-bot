import { Client, Collection } from "discord.js";
import { Button } from "../types";
import { readdirSync } from "fs";
import { join } from "path";

module.exports = (client: Client) => {
    client.buttons = new Collection<string, Button>()

    const buttonsDir = join(__dirname,"../buttons")

    readdirSync(buttonsDir).forEach(file => {
        const button : Button = require(`${buttonsDir}/${file}`).default
        client.buttons.set(button.customId, button)

        console.log(`Successfully loaded Button: "${file}"`)
    })
}