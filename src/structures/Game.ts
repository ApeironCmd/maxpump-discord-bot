import { Client, Collection, ForumChannel, Guild, Message, TextChannel, ThreadChannel } from "discord.js"
import { GetData, SetData, Vars } from "./Data"
import { GameCharacterComponent } from "./GameCharacters"

export interface UserComponent {
    tag : string
    id : string
    steam_id : string
    status? : number // 1 - ожидается, 2 - принят, 3 - запас, 4 - отказ
    character? : string
    characters? : string[]
    messageID? : string
    avatarURL? : string
    time? : string
    needHelp_id? : string
    needHelp_message? : string
}

export interface GameMoreComponent {
    title : string
    description : string
}

export interface GameComponent {
    active : boolean
    private : boolean

    title : string
    synopsis_id : string
    specifications_id : string
    additional_id : string
    characters : string
    server : string

    token : string
    game_id : string
    control_channel_id : string
    control_message_id : string

    gamemaster : UserComponent
    admins : Collection<string, UserComponent>
    users : Collection<string, UserComponent>
    gamecharacters : GameCharacterComponent[]
    more : GameMoreComponent[]

    create_time : string

    save : Function
    build : Function
    json : Function
}

export function GetTime() : string {
    const date = new Date()
    const options = {
        month: "long",
        day: "numeric",
        timezone: "UTC",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    } as Intl.DateTimeFormatOptions

    const time = date.toLocaleString("ru", options)

    return time
}

export function FindGameByControlChannelID(id : string) : GameComponent {
    const client : Client = Vars["client"]

    let game : GameComponent = undefined
    client.games.forEach(data => {
        if (data.control_channel_id == id) {
            game = data
        }
    })

    return game
}

export function AppManagementMessageByID(controlChannel : TextChannel, messageID : string) : Promise<Message> {
    return new Promise(async (resolve, reject) => {
        const cache = controlChannel.messages.cache.get(messageID)
        if (cache) {
            resolve(cache)
        } else {
            const appManagementMessage : Message | void = await controlChannel.messages.fetch(messageID).catch((error) => {
                reject()
            })
            if (!appManagementMessage) return reject()

            resolve(appManagementMessage)
        }
    })
}

export function FindControlChannelByID(guild : Guild, controlChannelID : string) : Promise<TextChannel> {
    return new Promise(async (resolve, reject) => {
        const cache = guild.channels.cache.get(controlChannelID) as TextChannel
        if (cache) {
            resolve(cache)
        } else {
            const controlChannel = await guild.channels.fetch(controlChannelID).catch((error) => {
                reject()
            }) as TextChannel
            if (!controlChannel) return reject()

            resolve(controlChannel)
        }
    })
}

export function FindGameApplyForumByID(guild : Guild, game : GameComponent) : Promise<ForumChannel> {
    const id = game.private ? process.env.GAME_APPLY_PRIVATE_ID : process.env.GAME_APPLY_OFFICIAL_ID

    return new Promise(async (resolve, reject) => {
        const cache = guild.channels.cache.get(id) as ForumChannel
        if (cache) {
            resolve(cache)
        } else {
            const gameApplyForum = await guild.channels.fetch(id).catch((error) => {
                reject()
            }) as ForumChannel
            if (!gameApplyForum) return reject()

            resolve(gameApplyForum)
        }
    })
}

export function FindGameThreadByID(gameApplyForum : ForumChannel, gameID : string) : Promise<ThreadChannel> {
    return new Promise(async (resolve, reject) => {
        const cache : ThreadChannel = gameApplyForum.threads.cache.get(gameID)
        if (cache) {
            resolve(cache)
        } else {
            const gameThread : ThreadChannel | void = await gameApplyForum.threads.fetch(gameID).catch((error) => {
                reject()
            })
            if (!gameThread) return reject()

            resolve(gameThread)
        }
    })
}

export function FindThreadMessageByID(gameThread : ThreadChannel, gameID : string) : Promise<Message> {
    return new Promise(async (resolve, reject) => {
        const cache = gameThread.messages.cache.get(gameID)
        if (cache) {
            resolve(cache)
        } else {
            const threadMessage : Message | void = await gameThread.messages.fetch(gameID).catch((error) => {
                reject()
            })
            if (!threadMessage) return reject()

            resolve(threadMessage)
        }
    })
}

export function FindControlMessageByID(controlChannel : TextChannel, controlMessageID : string) : Promise<Message> {
    return new Promise(async (resolve, reject) => {
        const cache = controlChannel.messages.cache.get(controlMessageID)
        if (cache) {
            resolve(cache)
        } else {
            const controlMessage : Message | void = await controlChannel.messages.fetch(controlMessageID).catch((error) => {
                reject()
            })
            if (!controlMessage) return reject()

            resolve(controlMessage)
        }
    })
}

export function gameBuild(client : Client) {
    client.games = new Collection<string, GameComponent>()

    const games = GetData("games", {})
    Object.keys(games).forEach(key => {
        const data : GameComponent = games[key]

        //if (data.active) {
            const game = new Game()
                game.active = data.active
                game.private = data.private

                game.title = data.title
                game.synopsis_id = data.synopsis_id
                game.specifications_id = data.specifications_id
                game.additional_id = data.additional_id
                game.characters = data.characters
                game.server = data.server

                game.token = data.token
                game.game_id = data.game_id
                game.control_channel_id = data.control_channel_id
                game.control_message_id = data.control_message_id

                game.create_time = data.create_time

                game.gamemaster = data.gamemaster
                game.admins = new Collection<string, UserComponent>()
                game.users = new Collection<string, UserComponent>()
                game.gamecharacters = data.gamecharacters
                game.more = data.more

                Object.keys(data.admins).forEach(key => {
                    const value : UserComponent = data.admins[key]
                    game.admins.set(key, value)
                })

                Object.keys(data.users).forEach(key => {
                    const value : UserComponent = data.users[key]
                    game.users.set(key, value)
                })
            game.build(client)
        //}
    })
}

export default class Game implements GameComponent {
    public active : boolean = true!
    public private : boolean = false!

    public title : string = undefined!
    public synopsis_id : string = undefined!
    public specifications_id : string = undefined!
    public additional_id : string = undefined!
    public characters : string = undefined!
    public server : string = undefined!

    public token : string = undefined!
    public game_id : string = undefined!
    public control_channel_id : string = undefined!
    public control_message_id : string = undefined!

    public create_time : string = undefined!

    public gamemaster : UserComponent = undefined!
    public admins : Collection<string, UserComponent> = new Collection<string, UserComponent>()!
    public users : Collection<string, UserComponent> = new Collection<string, UserComponent>()!
    public gamecharacters : GameCharacterComponent[] = []!
    public more : GameMoreComponent[] = []!

    public json() : any {
        let obj = {
            active: this.active,
            private: this.private,

            title: this.title,
            synopsis_id: this.synopsis_id,
            specifications_id: this.specifications_id,
            additional_id: this.additional_id,
            characters: this.characters,
            server: this.server,

            token: this.token,
            game_id: this.game_id,
            control_channel_id: this.control_channel_id,
            control_message_id: this.control_message_id,

            create_time: this.create_time,

            gamemaster: this.gamemaster,
            admins: {},
            users: {},
            gamecharacters: this.gamecharacters,
            more: this.more
        }

        this.admins.forEach(v => {
            obj.admins[v.id] = v
        })

        this.users.forEach(v => {
            obj.users[v.id] = v
        })

        return obj
    }

    public save() {
        let games : GameComponent = GetData("games", {})
        games[this.game_id] = this.json()

        SetData("games", games)
    }

    public build(client : Client) {
        client.games.set(this.game_id, this)
    }
}