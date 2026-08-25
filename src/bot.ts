import { Client, GatewayIntentBits, Collection } from "discord.js"
import {} from "./types"
import { gameBuild } from "./structures/Game"
import { hookBuild } from "./structures/Hook"
import { config } from "dotenv";
import { readdirSync } from "fs"
import { join } from "path"
import { Vars } from "./structures/Data";

const client = new Client({intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent
]})

Vars["client"] = client

config()
hookBuild()
gameBuild(client)

client.cooldowns = new Collection<string, number>()

const handlersDir = join(__dirname, "./handlers")
readdirSync(handlersDir).forEach(handler => {
    const info = require(`${handlersDir}/${handler}`)

    if (typeof(info) === "object") {
        info.Initialize(client)
    } else {
        info(client)
    }
})

client.login(process.env.TOKEN).then(() => {
    require("./events/ServerStatus")(client)
    require("./events/NavigationInit")(client)
})