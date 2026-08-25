import {
    TextChannel,
    ChannelType,
    EmbedBuilder
} from "discord.js"
import { SubCommand } from "../types"

const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID!
const TICKET_NOTIFY_CHANNEL_ID = process.env.TICKET_NOTIFY_CHANNEL_ID!
const TICKET_LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL_ID!

const command: SubCommand = {
    id: "ticket.adduser",
    execute: async (interaction) => {
        if (!interaction.guild || !interaction.channel) return

        const ticketChannel = interaction.channel as TextChannel

        if (ticketChannel.type !== ChannelType.GuildText) {
            return interaction.reply({
                content: "Команда может быть использована только в текстовом канале.",
                ephemeral: true
            })
        }

        if (ticketChannel.parentId !== TICKET_CATEGORY_ID || ticketChannel.id === TICKET_NOTIFY_CHANNEL_ID || ticketChannel.id === TICKET_LOG_CHANNEL_ID) {
            return interaction.reply({
                content: "Вы не можете добавлять пользователей в этот канал.",
                ephemeral: true
            })
        }

        const messages = await ticketChannel.messages.fetch({ limit: 1, after: "0" })
        const firstMessage = messages.first()

        const mentionedUser = firstMessage?.mentions.users.first()
        if (mentionedUser?.id === interaction.user.id) {
            return interaction.reply({
                content: "Создателю тикета нельзя добавлять пользователей.",
                ephemeral: true
            })
        }

        const userToAdd = interaction.options.getUser("user")
        if (!userToAdd) {
            return interaction.reply({
                content: "Пожалуйста, укажите пользователя, которого вы хотите добавить.",
                ephemeral: true
            })
        }

        if (userToAdd.id === interaction.user.id) {
            return interaction.reply({
                content: "Вы не можете добавить себя в тикет.",
                ephemeral: true
            })
        }

        await ticketChannel.permissionOverwrites.create(userToAdd.id, {
            ViewChannel: true,
            SendMessages: true,
            AttachFiles: true
        })

        await ticketChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("👤 Новый участник добавлен")
                    .setDescription(`Пользователь <@${userToAdd.id}> был добавлен в тикет <@${interaction.user.id}>.`)
                    .setColor(0x2ecc71)
                    .setTimestamp()
            ]
        })

        await interaction.reply({
            content: `Пользователь ${userToAdd.tag} успешно добавлен в тикет!`,
            ephemeral: true
        })
    }
}

export default command