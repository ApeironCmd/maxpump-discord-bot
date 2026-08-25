import { Client, Events, ChannelType } from "discord.js";
import { Vars } from "../structures/Data";

module.exports = (client: Client) => {
    client.on(Events.ThreadCreate, async (thread) => {        
        if (thread.type == ChannelType.PublicThread) {
            if (thread.parentId == process.env.GAME_APPLY_OFFICIAL_ID || thread.parentId == process.env.GAME_APPLY_PRIVATE_ID) {
                setTimeout(async () => {
                    const message = await thread.send({content: `||<@!${thread.ownerId}>|| </game create:1081925721741590539>`})
                    Vars[`thread_command_message_${thread.ownerId}`] = message
                }, 1000)
            }
        }
    })
}