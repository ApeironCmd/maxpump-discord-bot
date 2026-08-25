import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js"
import { Button } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"

const button : Button = {
    customId: "control.game.permissions.adminremove",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        if (game.gamemaster.id != userID) return interaction.reply({content: "Вы не являетесь Гейммастером данной игры!", ephemeral: true})

        let options = []
        if (game.admins.size > 0) {
            game.admins.forEach(admin => {
                options.push({label: admin.tag, value: admin.id})
            })
        } else {
            options = [
                {label: "nothing", value: "nothing"}
            ]
        }

        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription("Выберите администраторов в списке ниже, с которых вы хотите снять права")

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("control.game.permissions.adminremove")
                    .setPlaceholder("Ничего не выбрано")
                    .setDisabled(game.admins.size <= 0)
                    .setMinValues(1)
                    .setMaxValues(game.admins.size > 0 ? game.admins.size : 1)
                    .addOptions(...options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`control.game.permissions/${true}`)
                    .setLabel("Назад")
                    .setStyle(ButtonStyle.Secondary)
            )

        await interaction.update({embeds: [embed], components: [row1, row2]})
    }
}

export default button