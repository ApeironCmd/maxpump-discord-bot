import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js"
import { Button } from "../types"
import { FindGameByControlChannelID } from "../structures/Game"

const button : Button = {
    customId: "control.game.characters.edit",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const array = game.gamecharacters

        let options = []
        if (array.length > 0) {
            for (const character of array) {
                options.push({label: `${character.name} (${character.uniqueID})`, description: character.title, value: character.uniqueID})
            }
        } else {
            options = [
                {label: "nothing", value: "nothing"}
            ]
        }

        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription("Выберите персонажа в списке ниже, которого вы хотите изменить")

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("control.game.characters.edit")
                    .setPlaceholder("Ничего не выбрано")
                    .setDisabled(array.length <= 0)
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(...options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`control.game.characters/${true}`)
                    .setLabel("Назад")
                    .setStyle(ButtonStyle.Secondary)
            )

        await interaction.update({embeds: [embed], components: [row1, row2]})
    }
}

export default button