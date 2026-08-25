import { Client, Collection } from "discord.js";
import { Modal } from "../types";
import { readdirSync } from "fs";
import { join } from "path";

module.exports = (client: Client) => {
    client.modals = new Collection<string, Modal>()

    const modalsDir = join(__dirname,"../modals")

    readdirSync(modalsDir).forEach(file => {
        const modal : Modal = require(`${modalsDir}/${file}`).default
        client.modals.set(modal.customId, modal)

        console.log(`Successfully loaded Modal: "${file}"`)
    })
}