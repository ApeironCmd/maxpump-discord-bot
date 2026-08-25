import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { Button } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"

const button : Button = {
    customId: "control.game.permissions.adminadd",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.gamemaster.id != userID) return interaction.reply({content: "Вы не являетесь Гейммастером данной игры!", ephemeral: true})

        const modal = new ModalBuilder()
            .setCustomId("control.game.permissions.adminadd")
            .setTitle("Добавить администратора")

        const userIDInput = new TextInputBuilder()
            .setCustomId("userIDInput")
            .setLabel("DiscordID пользователя")
            .setMinLength(15)
            .setMaxLength(20)
            .setPlaceholder("000000000000000000")
            .setStyle(TextInputStyle.Short)

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(userIDInput)
        )

        await interaction.showModal(modal)
    }
}

export default button