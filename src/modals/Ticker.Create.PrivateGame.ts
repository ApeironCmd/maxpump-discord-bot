import {
    ModalSubmitInteraction,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from "discord.js"
import { Modal } from "../types"
import { config } from "dotenv"
config()

const CATEGORY_ID = process.env.TICKET_CATEGORY_ID!
const NOTIFY_CHANNEL_ID = process.env.TICKET_NOTIFY_CHANNEL_ID!

const modal: Modal = {
    customId: "ticket.create.private_game.modal",
    execute: async (interaction: ModalSubmitInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const gameName = interaction.fields.getTextInputValue("gameNameInput")
        const steamId = interaction.fields.getTextInputValue("steamIdInput")
        const description = interaction.fields.getTextInputValue("descriptionInput")
        const date = interaction.fields.getTextInputValue("dateInput")
        const preferences = interaction.fields.getTextInputValue("preferencesInput") || "Нет дополнительных предпочтений."

        const shortened = gameName.toLowerCase().replace(/[^a-zа-я0-9]/gi, "-").slice(0, 20)

        const channelName = `приватная_игра-${shortened}`

        const ticketChannel = await interaction.guild?.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.AttachFiles
                    ]
                }
            ]
        })

        if (!ticketChannel) {
            return interaction.editReply({
                content: "Не удалось создать канал. Обратитесь к администратору.",
            })
        }

        await ticketChannel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle("🎮 Запрос на приватную игру создан")
                    .setColor("Green")
                    .addFields(
                        { name: "Название игры", value: gameName },
                        { name: "Steam ID", value: steamId },
                        { name: "Описание игры", value: description },
                        { name: "Дата проведения", value: date },
                        { name: "Доп. предпочтения", value: preferences }
                    )
                    .setFooter({ text: "Пожалуйста, ожидайте ответа от менеджера приватных игр." })
            ]
        })

        const notifyEmbed = new EmbedBuilder()
            .setTitle("📥 Новый запрос: Приватная игра")
            .addFields(
                { name: "Пользователь", value: `<@${interaction.user.id}> (\`${interaction.user.id}\`)` },
                { name: "Название игры", value: gameName },
                { name: "Steam ID", value: steamId },
                { name: "Описание", value: description },
                { name: "Дата", value: date },
                { name: "Доп. предпочтения", value: preferences },
                { name: "Канал", value: `<#${ticketChannel.id}>` }
            )
            .setTimestamp()
            .setColor("Green")

        const claimButton = new ButtonBuilder()
            .setCustomId(`ticket.claim/${ticketChannel.id}`)
            .setLabel("Откликнуться")
            .setStyle(ButtonStyle.Primary)

        const notifyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton)

        const notifyChannel = await interaction.guild?.channels.fetch(NOTIFY_CHANNEL_ID)
        if (notifyChannel?.isTextBased()) {
            await notifyChannel.send({
                embeds: [notifyEmbed],
                components: [notifyRow]
            })
        }

        await interaction.editReply({
            content: `✅ Запрос на приватную игру создан: ${ticketChannel}`,
        })
    }
}

export default modal