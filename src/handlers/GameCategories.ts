import { Client } from "discord.js"

module.exports = (client: Client) => {
    client.gamecategories = require("../structures/GameCategory").default
}