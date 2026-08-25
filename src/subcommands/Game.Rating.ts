import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { SubCommand } from "../types"

const command : SubCommand = {
    id: "game.rating",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = interaction.client.games.get(channelID)
        if (!game) return interaction.reply({content: "Данную команду можно использовать только в канале с игрой!", ephemeral: true})

        if (game.gamemaster.id != userID) return interaction.reply({content: "Вы не являетесь игровым мастером данной игры!", ephemeral: true})

        const embed = new EmbedBuilder()
            .setTitle(`<:Activity:1441500857869795470> Оценка игроков: ${game.title}`)
            .setDescription("Нажмите кнопку ниже, чтобы оценить других игроков за участие в этой игре.\n\nКаждый участник может поставить лайки игрокам, которые хорошо проявили себя.")
            .setColor([47, 49, 54])
            .setFooter({ text: "Оцените игроков, которые хорошо проявили себя в игре" })

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`game.rating.start/${game.game_id}`)
                    .setLabel("Оценить")
                    .setStyle(ButtonStyle.Success)
            )

        await interaction.reply({ embeds: [embed], components: [row] })
    }
}

export default command