import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js"
import { Button } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"

const button : Button = {
    customId: "control.game.more.remove",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const array = game.more

        let options = []
        if (array.length > 0) {
            for (let i = 0; i < array.length; i++) {                
                options.push({label: `Страница №${i + 1}`, value: String(i)})
            }
        } else {
            options = [
                {label: "nothing", value: "nothing"}
            ]
        }

        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription("Выберите страницы в списке ниже, которые вы хотите удалить")

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("control.game.more.remove")
                    .setPlaceholder("Ничего не выбрано")
                    .setDisabled(array.length <= 0)
                    .setMinValues(1)
                    .setMaxValues(array.length > 0 ? array.length : 1)
                    .addOptions(...options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`control.game.more/${true}`)
                    .setLabel("Назад")
                    .setStyle(ButtonStyle.Secondary)
            )

        await interaction.update({embeds: [embed], components: [row1, row2]})
    }
}

export default button