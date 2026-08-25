import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { Button } from "../types"

const button : Button = {
    customId: "control.game.permissions",
    execute: async (interaction, isUpdate) => {
        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription("Выберите нужный вам параметр из указанных ниже")

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.permissions.givegamemaster")
                    .setLabel("Передать ГМ права")
                    .setEmoji("♾")
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.permissions.adminadd")
                    .setLabel("Добавить администратора")
                    .setEmoji("➕")
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.permissions.adminremove")
                    .setLabel("Удалить администраторов")
                    .setEmoji("➖")
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("control.game.permissions.removegame")
                    .setLabel("Удалить игру")
                    .setEmoji("🛑")
                    .setStyle(ButtonStyle.Danger),
            )
        
        if (isUpdate === "true") {
            interaction.update({embeds: [embed], components: [row]})
        } else {
            interaction.reply({embeds: [embed], components: [row], ephemeral: true})
        }
    }
}

export default button