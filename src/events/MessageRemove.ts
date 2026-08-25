import { Client, Events } from "discord.js"
import { GetVar, SetVar } from "../structures/Data"
import hook = require("../structures/Hook")

module.exports = (client: Client) => {
    client.on(Events.MessageDelete, async (message) => {
        // const timer = GetVar(`crs_timer_${message.channelId}`)
        // if (timer) {
        //     clearInterval(timer)
        //     SetVar(`crs_timer_${message.channelId}`, undefined)
        // }

        // hook.Run("MessageDelete", message)
    })
}