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

const CATEGORY_ID = process.env.TICKET_CATEGORY_ID!
const NOTIFY_CHANNEL_ID = process.env.TICKET_NOTIFY_CHANNEL_ID!

const modal: Modal = {
    customId: "ticket.create.appeal.server",
    execute: async (interaction: ModalSubmitInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const nick = interaction.fields.getTextInputValue("adminNick")
        const date = interaction.fields.getTextInputValue("dateInput")
        const steam = interaction.fields.getTextInputValue("steamInput")
        const reason = interaction.fields.getTextInputValue("reasonInput")
        const details = interaction.fields.getTextInputValue("detailInput")

        const channelName = `сервер_апелляция-${interaction.user.username.toLowerCase().slice(0, 15)}`

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
            return interaction.editReply({ content: "❌ Не удалось создать канал." })
        }

        await ticketChannel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle("🎮 Апелляция на сервере")
                    .setColor("Blue")
                    .addFields(
                        { name: "Ник наказавшего", value: nick },
                        { name: "Дата произошедшего", value: date },
                        { name: "Steam ID", value: steam },
                        { name: "Причины пересмотра", value: reason },
                        { name: "Подробности", value: details },
                        {
                            name: "Доказательства",
                            value: "📎 Прикрепите файлы или ссылки в этом чате."
                        }
                    )
                    .setFooter({ text: "Пожалуйста, ожидайте ответа от модераторов." })
            ]
        })

        const notifyEmbed = new EmbedBuilder()
            .setTitle("📥 Новая апелляция (сервер)")
            .setColor("Blue")
            .addFields(
                { name: "Пользователь", value: `<@${interaction.user.id}> (\`${interaction.user.id}\`)` },
                { name: "Канал", value: `<#${ticketChannel.id}>` },
                { name: "Ник наказавшего", value: nick, inline: true },
                { name: "Дата произошедшего", value: date, inline: true },
                { name: "Steam ID", value: steam, inline: true },
                { name: "Причины пересмотра", value: reason },
                { name: "Подробности", value: details }
            )
            .setTimestamp()

        const claimButton = new ButtonBuilder()
            .setCustomId(`ticket.claim/${ticketChannel.id}`)
            .setLabel("Откликнуться")
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton)

        const notifyChannel = await interaction.guild?.channels.fetch(NOTIFY_CHANNEL_ID)
        if (notifyChannel?.isTextBased()) {
            await notifyChannel.send({ embeds: [notifyEmbed], components: [row] })
        }

        await interaction.editReply({ content: `✅ Апелляция создана: ${ticketChannel}` })
    }
}

export default modal