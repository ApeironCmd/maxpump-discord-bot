import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction } from "discord.js"
import { GetSteamID, FindSteamID } from "../structures/SteamID"
import { Vars } from "../structures/Data"
import { SubCommand } from "../types"

const command : SubCommand = {
    id: "game.create",
    execute: async (interaction) => {
        const userID = interaction.user.id

        if (interaction.guildId != process.env.ACADEMY_SERVER_ID) return interaction.reply({content: "Вы не можете использовать эту команду в данном Дискорд Сервере!", ephemeral: true})

        if (!interaction.channel.isThread()) return interaction.reply({content: "Данную команду можно использовать только в ветках форума!", ephemeral: true})
        if (interaction.channel.parentId != process.env.GAME_APPLY_OFFICIAL_ID && interaction.channel.parentId != process.env.GAME_APPLY_PRIVATE_ID) return interaction.reply({content: "Данную команду можно использовать только в ветках форума!", ephemeral: true})

        if (interaction.channel.ownerId != userID) return interaction.reply({content: "Вы не являетесь владельцем данной ветки!", ephemeral: true})

        if (interaction.client.games.get(interaction.channelId)) return interaction.reply({content: "Игра в данном канале уже создана!", ephemeral: true})

        const userSteamID = FindSteamID(userID)
        if (!userSteamID) {
            GetSteamID(interaction, userID, (interactionNew : ModalSubmitInteraction, userSteamID : string) => {
                interactionNew.reply({content: "Ваш SteamID был успешно записан! Введите команду еще раз: </game create:1081925721741590539>", ephemeral: true}).catch((error) => {})
            })
        } else {
            const modal = new ModalBuilder()
			.setCustomId("game.create")
			.setTitle("Создать игру")

            const synopsisInput = new TextInputBuilder()
                .setCustomId("synopsisInput")
                .setLabel("Ссылка синопсиса")
                .setPlaceholder("https://i.imgur.com/2NHOqgp.png")
                .setStyle(TextInputStyle.Short)

            const specificationsInput = new TextInputBuilder()
                .setCustomId("specificationsInput")
                .setLabel("Ссылка характеристики")
                .setPlaceholder("https://i.imgur.com/2NHOqgp.png")
                .setStyle(TextInputStyle.Short)
            
            const additionalInput = new TextInputBuilder()
                .setCustomId("additionalInput")
                .setLabel("Ссылка доп. информации")
                .setPlaceholder("https://i.imgur.com/2NHOqgp.png")
                .setStyle(TextInputStyle.Short)

            const charactersInput = new TextInputBuilder()
                .setRequired(false)
                .setCustomId("charactersInput")
                .setLabel("Запрещенные персонажи и категории")
                .setPlaceholder("Воины надежды, K1-B0")
                .setStyle(TextInputStyle.Paragraph)

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(synopsisInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(specificationsInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(additionalInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(charactersInput)
            )

            await interaction.showModal(modal).catch((error) => {})
        }
    }
}

export default command