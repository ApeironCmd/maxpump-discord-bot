import { Client } from "discord.js"

module.exports = (client: Client) => {
    client.gamecharacters = require("../structures/GameCharacters").default
}