import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { Button } from "../types"

const button : Button = {
    customId: "control.game.characters",
    execute: async (interaction, isUpdate) => {
        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription("Выберите нужный вам параметр из указанных ниже")

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.characters.add")
                    .setLabel("Добавить нового персонажа")
                    .setEmoji("➕")
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.characters.edit")
                    .setLabel("Изменить персонажей")
                    .setEmoji("➗")
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.characters.remove")
                    .setLabel("Удалить персонажей")
                    .setEmoji("➖")
                    .setStyle(ButtonStyle.Secondary),
            )
        
        if (isUpdate === "true") {
            interaction.update({embeds: [embed], components: [row]})
        } else {
            interaction.reply({embeds: [embed], components: [row], ephemeral: true})
        }
    }
}

export default button