import { Client, Collection } from "discord.js";
import { SelectMenu } from "../types";
import { readdirSync } from "fs";
import { join } from "path";

module.exports = (client: Client) => {
    client.select_menus = new Collection<string, SelectMenu>()

    const selectMenusDir = join(__dirname,"../select_menus")

    readdirSync(selectMenusDir).forEach(file => {
        const selectMenu : SelectMenu = require(`${selectMenusDir}/${file}`).default
        client.select_menus.set(selectMenu.customId, selectMenu)

        console.log(`Successfully loaded Modal: "${file}"`)
    })
}