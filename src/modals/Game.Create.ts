import { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ChannelType, PermissionFlagsBits, ModalSubmitInteraction } from "discord.js"
import Game, { GameComponent, GetTime } from "../structures/Game"
import { FindSteamID } from "../structures/SteamID"
import { Modal } from "../types"
import { Vars } from "../structures/Data"

export function buildEmbeds(interaction : ModalSubmitInteraction, charactersInput : string, serverInput : string, game? : GameComponent) {
    let gameMasterTag = interaction.user.tag
    let avatarURL = interaction.user.avatarURL()
    if (game) {
        gameMasterTag = game.gamemaster.tag
        avatarURL = game.gamemaster.avatarURL
    }

    let message = ""
    const charactersOfStrings = charactersInput.split(", ")
    charactersOfStrings.forEach(element => {        
        interaction.client.gamecharacters.forEach(character => {
            const emoji = character.emoji ? `<:${character.emoji}>` : ""

            if (character.name.toLowerCase() == element.toLowerCase()) {
                message += `${emoji} ${(character.roleID ? `<@&${character.roleID}>` : character.name)}\n`
            }
        })

        interaction.client.gamecategories.forEach(category => {
            const emoji = category.emoji ? `<:${category.emoji}>` : ""

            if (category.title.toLowerCase() == element.toLowerCase()) {
                message += `${emoji} ${(category.roleID ? `<@&${category.roleID}>` : category.title)}\n`
            }
        })
    })

    const secondEmbed = new EmbedBuilder()
        .setColor([47,49,54])
        .setDescription(`• **Запрещённые персонажи:**\n${message}`)
        .setFooter({text: `Игровой мастер ${gameMasterTag} ·  Сервер ${serverInput}`, iconURL: avatarURL})

    return secondEmbed
}

function randomstring(length : number) {
    let result = ""

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const charactersLength = characters.length

    let counter = 0
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
        counter += 1
    }

    return result
}

export function createControlRow(game? : GameComponent) {
    return [
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.editinfo")
                    .setLabel("Изменить информационное сообщение")
                    .setEmoji("⚙️")
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.editactive")
                    .setLabel(game ? (game.active ? "Закрыть запись" : "Открыть запись") : "Открыть запись")
                    .setEmoji("📌")
                    .setStyle(game ? (game.active ? ButtonStyle.Danger : ButtonStyle.Success) : ButtonStyle.Success),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.playerslist")
                    .setLabel("Список участников")
                    .setEmoji("📊")
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.characters")
                    .setLabel("Редактор персонажей")
                    .setEmoji("✳️")
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.permissions")
                    .setLabel("Изменить права")
                    .setEmoji("💠")
                    .setStyle(ButtonStyle.Secondary),
            ),
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.more")
                    .setLabel("Изменить кнопку подробнее")
                    .setEmoji("📑")
                    .setStyle(ButtonStyle.Secondary),
            )
    ]
}

const modal : Modal = {
    customId: "game.create",
    execute: async (interaction) => {
        const userID = interaction.user.id

        if (!interaction.channel.isThread()) return

        if (interaction.client.games.get(interaction.channelId)) return interaction.reply({content: "Игра в данном канале уже создана!", ephemeral: true})

        Vars[`thread_command_message_${userID}`]?.delete()
        Vars[`thread_command_message_${userID}`] = undefined

        const synopsisInput = interaction.fields.getTextInputValue("synopsisInput")
        const specificationsInput = interaction.fields.getTextInputValue("specificationsInput")
        const additionalInput = interaction.fields.getTextInputValue("additionalInput")
        const charactersInput = interaction.fields.getTextInputValue("charactersInput") || ""

        const userSteamID = FindSteamID(userID)
        if (!userSteamID) return interaction.reply({content: "Упс... что-то пошло не так. (userSteamID is undefined)", ephemeral: true})

        await interaction.deferReply({ephemeral: true})

        const isPrivate = interaction.channel.parentId == process.env.GAME_APPLY_PRIVATE_ID

        const contolChannel = await interaction.guild.channels.create({
            name: interaction.channel.name,
            type: ChannelType.GuildText,
            parent: isPrivate ? process.env.GAME_CONTROL_CATEGORY_PRIVATE_ID : process.env.GAME_CONTROL_CATEGORY_OFFICIAL_ID,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ManageChannels
                    ]
                },
                {
                    id: interaction.user,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ManageChannels
                    ]
                }
            ]
        })

        const controlChannelID = contolChannel.id

        const controlMessage = await contolChannel.send({
            embeds: [buildEmbeds(interaction, charactersInput, "Aether")],
            components: createControlRow()
        })

        const token = randomstring(20)
        const embedToken = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription(`Ваш уникальный токен игры: ||\`${token}\`||`)

        await contolChannel.send({embeds: [embedToken]})

        const gameRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`game.singup`)
                        .setLabel("Записаться на игру")
                        .setEmoji("📌")
                        .setStyle(ButtonStyle.Secondary)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`game.playerslist`)
                        .setLabel("Список игроков")
                        .setEmoji("📖")
                        .setStyle(ButtonStyle.Secondary)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`game.more`)
                        .setLabel("Подробнее")
                        .setEmoji("📑")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                )

        const synopsisID = (await interaction.channel.send({files: [synopsisInput]})).id
        const specificationsID = (await interaction.channel.send({files: [specificationsInput]})).id
        const additionalID = (await interaction.channel.send({files: [additionalInput], components: [gameRow]})).id

        let game = new Game()
            game.active = false
            game.private = isPrivate

            game.title = interaction.channel.name
            game.synopsis_id = synopsisID
            game.specifications_id = specificationsID
            game.additional_id = additionalID
            game.characters = charactersInput
            game.server = "Aether"

            game.token = token
            game.game_id = interaction.channelId
            game.control_channel_id = controlChannelID
            game.control_message_id = controlMessage.id

            game.create_time = GetTime()

            game.gamemaster = {
                tag: interaction.user.tag,
                id: userID,
                steam_id: userSteamID,
                avatarURL: interaction.user.avatarURL()
            }
            game.save()
        game.build(interaction.client)

        interaction.deleteReply()
    }
}

export default modal