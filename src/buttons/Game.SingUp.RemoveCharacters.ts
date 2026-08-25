import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js"
import { Button } from "../types"
import { FindCharacterByID } from "../structures/GameCharacters"

const button : Button = {
    customId: "game.signup.removecharacters",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const game = interaction.client.games.get(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true}).catch((error) => {})

        const user = game.users.get(userID)
        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true}).catch((error) => {})

        if (user.character) return interaction.reply({content: "Упс... что-то пошло не так. (У вас уже выбран основной персонаж)", ephemeral: true}).catch((error) => {})

        if (user.characters.length <= 1) return interaction.reply({content: "Упс... что-то пошло не так. (У вас достигнуто минимальное количество персонажей)", ephemeral: true}).catch((error) => {})

        await interaction.deferUpdate()

        let options = []
        for (const charID of user.characters) {
            const character = FindCharacterByID(charID, game)

            options.push({
                label: character.name,
                description: character.title,
                value: character.uniqueID,
                emoji: character.emoji ? character.emoji : undefined
            })
        }

        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription("Выберите персонажей в списке ниже, которых вы хотите удалить")

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("game.signup.removecharacters")
                    .setPlaceholder("Персонажи")
                    .setMinValues(1)
                    .setMaxValues(user.characters.length - 1)
                    .addOptions(...options)
            )

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`game.singup/${true}`)
                    .setLabel("Назад")
                    .setStyle(ButtonStyle.Secondary)
            )


        await interaction.editReply({components: [row1, row2], embeds: [embed], files: []}).catch((error) => {})
    }
}

export default button