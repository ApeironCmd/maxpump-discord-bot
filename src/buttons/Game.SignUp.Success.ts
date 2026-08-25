import { ActionRowBuilder, AttachmentBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, Interaction, CommandInteraction } from "discord.js"
import { GetData } from "../structures/Data"
import { Button } from "../types"
import { join } from "path"
import { CreateCharacterText, FindCharacterByID } from "../structures/GameCharacters"
import { AppManagementMessageByID, FindControlChannelByID, GameComponent, GetTime, UserComponent } from "../structures/Game"
import { GetStatusByID } from "../structures/GameStatus"
import { AddInteractionArgs, RemoveInteractionArgs } from "../structures/InteractionsArguments"
import { FindSteamID, SteamIDTo64 } from "../structures/SteamID"
import { AddGameSingUpPrimary, AddGameSingUpNeedHelp } from "./Game.SingUp"
import { UserCacheHelper } from "../structures/UserCacheHelper"

function format(str : string, arr : any[]): string {
    return str.replace(/{(\d+)}/g, function (match, number) {
        return typeof arr[number] != 'undefined' ? arr[number] : match;
    })
}

// const statusList = {
//     underconsideration: 1,
//     accept: 2,
//     reserve: 3,
//     reject: 4
// }

const statusList = [
    {name: "На рассмотрении", id: "underconsideration"},
    {name: "Одобрить", id: "accept"},
    {name: "Запас", id: "reserve"},
    {name: "Отклонить", id: "reject"}
]

export function buildElements(user : UserComponent, game : GameComponent) : Object {
    const status = GetStatusByID(user.status)
    const description = format(status.description, [status.roleID ? `<@&${status.roleID}>` : status.title])

    const embed = new EmbedBuilder()
        .setColor([47,49,54])
        .setTitle(`Заявка на игру «${game.title}»`)
        .setDescription(description)
        .setFooter({text: `Заявка создана ${user.time}`, iconURL: user.avatarURL})
        .addFields(
            {name: " ", value: `• [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id})\n${CreateCharacterText(user, game)}`, inline: true},
            {name: " ", value: `• DiscordID — [${user.id}](https://discordredirect.discordsafe.com/users/${user.id})\n• SteamID — [${user.steam_id}](https://steamcommunity.com/profiles/${SteamIDTo64(user.steam_id)})`, inline: true}
        )

    let row1options = []
    for (const status of statusList) {
        const st = user.status - 1

        row1options.push({
            label: status.name,
            value: status.id,
            default: statusList[st].id == status.id
        })
    }

    const row1 = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`control.app.managestatus/${user.id}`)
                .setPlaceholder("Управление заявкой")
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(...row1options)
        )

    let row2options = []
    for (const charID of user.characters) {
        const character = FindCharacterByID(charID, game)

        if (character) {
            row2options.push({
                label: character.name,
                description: character.title,
                value: character.uniqueID,
                default: (user.character ? (user.character == character.uniqueID) : false),
                emoji: character.emoji ? character.emoji : undefined
            })
        }
    }

    const row2 = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`control.app.managemaincharacter/${user.id}`)
                .setPlaceholder("Основной персонаж")
                .setMinValues(0)
                .setMaxValues(1)
                .addOptions(...row2options)
        )

    return [embed, row1, row2]
}


export async function dmMessage(interaction : Interaction | CommandInteraction, user : UserComponent, game : GameComponent, title? : string) {
    const member = await UserCacheHelper.getUser(interaction.client, user.id)
    if (!member) return

    const status = GetStatusByID(user.status)
    const dmMessage = status.dmMessage
    if (dmMessage) {
        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setTitle(`Заявка на игру «${game.title}»`)
            .setDescription(dmMessage)
            .setFooter({text: interaction.user.tag, iconURL: interaction.user.avatarURL()})
            .addFields(
                {name: " ", value: `• [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id})\n${CreateCharacterText(user, game, true)}`, inline: true},
                {name: " ", value: `• DiscordID — [${user.id}](https://discordredirect.discordsafe.com/users/${user.id})\n• SteamID — [${user.steam_id}](https://steamcommunity.com/profiles/${SteamIDTo64(user.steam_id)})`, inline: true}
            )

        await member.send({embeds: [embed]}).catch((error) => {})
    }
}

const button : Button = {
    customId: "game.signup.success",
    execute: async (interaction, character_id) => {
        const avatarURL = interaction.user.avatarURL()
        const userID = interaction.user.id

        if (!character_id) return interaction.reply({content: "Упс... что-то пошло не так. (character_id is undefined)", ephemeral: true})

        const steamID = FindSteamID(userID)
        if (!steamID) return interaction.reply({content: "Упс... что-то пошло не так. (steamID is undefined)", ephemeral: true})

        const game = interaction.client.games.get(interaction.channelId)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const character = FindCharacterByID(character_id, game)
        if (!character) return interaction.reply({content: "Упс... что-то пошло не так. (character is undefined)", ephemeral: true})

        let bans : Object = GetData("bans", {}, true)
        let time = Date.now()
        let bannedTime = bans[userID]
        if (!bannedTime) bannedTime = bans[steamID]
        if (bannedTime && bannedTime > time) return interaction.reply({content: `Вам была выдана блокировка записей на игры! Вы сможете повторно записываться на игры через ${Math.floor((bannedTime - time) / 1000 / 60 / 60)} часов!`, ephemeral: true}).catch((error) => {})

        await interaction.deferUpdate()

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        let find = false
        game.users.forEach(user => {
            const character = FindCharacterByID(user.character, game)
            
            if ((user.status == 2 || user.status == 3) && character && character.category != "oc" && character.uniqueID === character_id) {
                find = true
            }
        })

        if (find) return interaction.editReply({content: "Упс... что-то пошло не так. (character_id already selected)"})

        let user = game.users.get(userID)
        if (user) {
            const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {})
            if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

            if (user.status === 1) {
                if (user.character) return interaction.editReply({content: "Упс... что-то пошло не так. (У вас уже выбран основной персонаж)", embeds: [], components: [], files: []}).catch((error) => {})

                if (user.characters.length >= 5) return interaction.editReply({content: "Упс... что-то пошло не так. (У вас выбрано максимальное количество персонажей)", embeds: [], components: [], files: []}).catch((error) => {})

                let find = false
                for (const charID of user.characters) {
                    if (charID == character_id) {
                        find = true
                    }
                }
                if (find) return interaction.editReply({content: "Упс... что-то пошло не так. (У вас уже есть данный персонаж в списке предложенных персонажей)", embeds: [], components: [], files: []})

                user.characters.push(character_id)

                game.save()

                const data = buildElements(user, game)
                const embed = data[0]
                const row1 = data[1]
                const row2 = data[2]

                await appManagementMessage.edit({embeds: [embed], components: [row1, row2]})

                dmMessage(interaction, user, game)
            } else if (user.status === 2 || user.status === 3) {
                if (!user.character) return interaction.editReply({content: "Упс... что-то пошло не так. (У вас отсутствует основной персонаж)", embeds: [], components: [], files: []}).catch((error) => {})

                const oldCharacter = FindCharacterByID(user.character, game)
                const newCharacter = FindCharacterByID(character_id, game)
                
                const oldEmoji = oldCharacter.emoji ? `<:${oldCharacter.emoji}>` : ""
                const newEmoji = newCharacter.emoji ? `<:${newCharacter.emoji}>` : ""

                const embed = new EmbedBuilder()
                    .setColor([47,49,54])
                    .setDescription(`• [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id}) запрашивает смену персонажа для игры:\n${oldEmoji} ${(oldCharacter.roleID ? `<@&${oldCharacter.roleID}>` : oldCharacter.name)} — ${newEmoji} ${(newCharacter.roleID ? `<@&${newCharacter.roleID}>` : newCharacter.name)}`)
                    .setTitle(`Смена персонажа на игре «${game.title}»`)
                    .setFooter({text: `Заявка создана ${GetTime()}`, iconURL: user.avatarURL})
                    
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`control.changecharacter.accept/${userID}/${character_id}`)
                            .setLabel("Одобрить")
                            .setEmoji("✅")
                            .setStyle(ButtonStyle.Secondary),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`control.changecharacter.deny/${userID}`)
                            .setLabel("Отказать")
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Secondary),
                    )

                const data = GetData("interactionsargs", {})
                if (typeof(data) === "object") {
                    Object.keys(data).forEach(async (key) => {
                        const element = data[key]

                        if (element.gameID == game.game_id && element.userID == userID) {
                            RemoveInteractionArgs(key)

                            const interactionMessage = await controlChannel.messages.fetch(key).catch((error) => {})
                            if (interactionMessage) {
                                await interactionMessage.delete().catch((error) => {})
                            }
                        }
                    })
                }

                const message = await controlChannel.send({content: `<@!${game.gamemaster.id}>`, embeds: [embed], components: [row]})
                AddInteractionArgs(message.id, {gameID: game.game_id, userID: userID, character: character_id})
            } else {
                return await interaction.editReply({content: "Упс... что-то пошло не так. (user.status === 0)"})
            }
        } else {
            if (!game.active) return interaction.editReply({content: "Игровой гейммастер запретил запись на данную игру!", files: [], embeds: [], components: []})

            game.users.set(userID, {
                tag: interaction.user.tag,
                id: userID,
                steam_id: steamID,
                status: 1,
                characters: [character_id]
            })
            game.save()
            user = game.users.get(userID)

            user.avatarURL = avatarURL
            user.time = GetTime()

            const data = buildElements(user, game)
            const embed = data[0]
            const row1 = data[1]
            const row2 = data[2]
            
            const message = await controlChannel.send({embeds: [embed], components: [row1, row2]})
            user.messageID = message.id
            game.save()

            dmMessage(interaction, user, game)
        }

        let row : ActionRowBuilder<ButtonBuilder>[] = []
        row = AddGameSingUpPrimary(row, user)
        row = AddGameSingUpNeedHelp(row)
        
        const attachment = new AttachmentBuilder(join(__dirname, "../../assets/GameSelectApplicationSuccess.png"), {name: "GameSelectApplicationSuccess.png"})
        await interaction.editReply({files: [attachment], components: row})

        const ping = await interaction.channel.send({content: `<@!${userID}>`})
        await ping.delete()
    }
}

export default button