import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { Button } from "../types"

const button : Button = {
    customId: "game.singup.needhelp",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = interaction.client.games.get(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const user = game.users.get(userID)
        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true})

        const modal = new ModalBuilder()
            .setCustomId("game.singup.needhelp")
            .setTitle("Запрос наставника")

        const descriptionInput = new TextInputBuilder()
            .setCustomId("descriptionInput")
            .setLabel("Описание вашего запроса")
            .setPlaceholder(`Расспишите все, с чем вам требуется помощь, чтобы наши помощники могли помочь вам!`)
            .setMinLength(10)
            .setMaxLength(1500)
            .setStyle(TextInputStyle.Paragraph)

        if (user.needHelp_id) {
            descriptionInput
                .setValue(user.needHelp_message)
        }

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
        )

        await interaction.showModal(modal)
    }
}

export default button