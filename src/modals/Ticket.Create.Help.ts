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
    customId: "ticket.create.help.modal",
    execute: async (interaction: ModalSubmitInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const topic = interaction.fields.getTextInputValue("topicInput")
        const details = interaction.fields.getTextInputValue("detailInput")
        const shortened = topic.toLowerCase().replace(/[^a-zа-я0-9]/gi, "-").slice(0, 20)

        const channelName = `помощь-${shortened}`

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
                    .setTitle("💬 Вопрос по помощи создан")
                    .setColor("Blue")
                    .addFields(
                        { name: "Как вам помочь?", value: topic },
                        { name: "Описание", value: details }
                    )
                    .setFooter({ text: "Пожалуйста, ожидайте ответа от модераторов." })
            ]
        })

        const notifyEmbed = new EmbedBuilder()
            .setTitle("📥 Новый запрос: Помощь")
            .addFields(
                { name: "Пользователь", value: `<@${interaction.user.id}> (\`${interaction.user.id}\`)` },
                { name: "Канал", value: `<#${ticketChannel.id}>` },
                { name: "Как вам помочь?", value: topic },
                { name: "Описание", value: details }
            )
            .setTimestamp()
            .setColor("Blue")

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
            content: `✅ Запрос на помощь создан: ${ticketChannel}`,
        })
    }
}

export default modal