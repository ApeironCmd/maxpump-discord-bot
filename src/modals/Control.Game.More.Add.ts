import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { FindGameApplyForumByID, FindGameByControlChannelID, FindGameThreadByID } from "../structures/Game"
import { Modal } from "../types"

const modal : Modal = {
    customId: "control.game.more.add",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const titleInput = interaction.fields.getTextInputValue("titleInput") || ""
        const descriptionInput = interaction.fields.getTextInputValue("descriptionInput")

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.more.length >= 5) return interaction.reply({content: "Упс... что-то пошло не так. (more limited [5])", ephemeral: true})

        game.more.push({
            title: titleInput,
            description: descriptionInput
        })
        game.save()

        const gameApplyForum = await FindGameApplyForumByID(interaction.guild, game).catch((error) => {})
        if (!gameApplyForum) return interaction.editReply({content: "Упс... что-то пошло не так. (gameApplyForum is undefined)"})

        const gameThread = await FindGameThreadByID(gameApplyForum, game.game_id).catch((error) => {})
        if (!gameThread) return interaction.editReply({content: "Упс... что-то пошло не так. (gameThread is undefined)"})

        const message = await gameThread.messages.fetch(game.additional_id)
        if (message) {
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
                        .setDisabled(game.more.length <= 0)
                )

            message.edit({components: [gameRow]})
        }

        interaction.reply({content: "Готово!", ephemeral: true})
    }
}

export default modal