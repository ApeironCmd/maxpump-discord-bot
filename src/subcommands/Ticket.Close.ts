import {
    ChannelType,
    Collection,
    EmbedBuilder,
    Message,
    OverwriteType,
    PermissionsBitField,
    TextChannel,
    User,
} from "discord.js"
import { SubCommand } from "../types"
import fs from "fs"
import path from "path"
import { UserCacheHelper } from "../structures/UserCacheHelper"

const LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL_ID!
const NOTIFY_CHANNEL_ID = process.env.TICKET_NOTIFY_CHANNEL_ID!
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID!

async function fetchAllMessages(channel: TextChannel): Promise<Map<string, Message>> {
    const messages = new Map<string, Message>()
    let lastId: string | undefined = undefined

    while (true) {
        const options: { limit: number, before?: string } = { limit: 100 }
        if (lastId) options.before = lastId

        const fetched: Collection<string, Message> = await channel.messages.fetch(options)
        if (fetched.size === 0) break

        for (const [id, msg] of fetched) {
            messages.set(id, msg)
        }

        lastId = fetched.last()?.id
    }

    return new Map([...messages.entries()].reverse())
}

const command: SubCommand = {
    id: "ticket.close",
    execute: async (interaction) => {
        if (!interaction.guild || !interaction.channel) return

        const ticketChannel = interaction.channel as TextChannel

        if (ticketChannel.type !== ChannelType.GuildText) {
            return interaction.reply({
                content: "Команда может быть использована только в текстовом канале.",
                ephemeral: true
            })
        }

        if (ticketChannel.parentId !== TICKET_CATEGORY_ID) {
            return interaction.reply({
                content: "Эта команда может быть использована только в канале тикета.",
                ephemeral: true
            })
        }

        const permissions = ticketChannel.permissionOverwrites.cache.get(interaction.user.id)
        if (!permissions || !permissions.allow.has(PermissionsBitField.Flags.ViewChannel)) {
            return interaction.reply({
                content: "Вы не имеете доступа к этому тикету.",
                ephemeral: true
            })
        }

        await interaction.deferReply({ ephemeral: true })

        const allMessages = await fetchAllMessages(ticketChannel)

        let content = `Тикет: ${ticketChannel.name}\nТип: ${ticketChannel.name.split("-")[0]}\nЗакрыл: ${interaction.user.tag} (${interaction.user.id})\nДата закрытия: ${new Date().toLocaleString("ru-RU")}\n\n`

        for (const msg of allMessages.values()) {
            const time = new Date(msg.createdTimestamp).toLocaleString("ru-RU")
            const author = `${msg.author.tag} (${msg.author.id})`
            const msgContent = msg.content || "[вложение/эмбед/пусто]"
            content += `[${time}] ${author}:\n${msgContent}\n\n`
        }

        const fileName = `${new Date().toISOString().replace(/[:.]/g, "-")}_${ticketChannel.name}.txt`
        const dir = path.join(__dirname, "../../logs")
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        const filePath = path.join(dir, fileName)
        fs.writeFileSync(filePath, content)

        const membersWithAccess = ticketChannel.permissionOverwrites.cache
            .filter(overwrite =>
                overwrite.type === OverwriteType.Member &&
                overwrite.allow.has(PermissionsBitField.Flags.ViewChannel)
            )

        const logEmbed = new EmbedBuilder()
            .setTitle("📁 Лог закрытого тикета")
            .addFields(
                { name: "Канал", value: `${ticketChannel.name} (<#${ticketChannel.id}>)`, inline: false },
                { name: "Тип", value: `тип:` + ticketChannel.name.split("-")[0], inline: true },
                { name: "ID канала", value: ticketChannel.id, inline: true },
                { name: "Создан", value: `<t:${Math.floor(ticketChannel.createdTimestamp / 1000)}:f>`, inline: false },
                { name: "Сообщений в тикете", value: `${allMessages.size}`, inline: true },
                { name: "Закрыл", value: `<@${interaction.user.id}> (\`${interaction.user.tag}\`)`, inline: false },
                {
                    name: "Участники",
                    value: membersWithAccess.map(o => `<@${o.id}> (\`${o.id}\`)`).join("\n") || "Нет участников",
                    inline: false
                }
            )
            .setTimestamp()
            .setColor(0xffcc00)

        const logChannel = await interaction.guild.channels.fetch(LOG_CHANNEL_ID) as TextChannel
        await logChannel.send({
            embeds: [logEmbed],
            files: [filePath]
        })

        const notifyChannel = await interaction.guild.channels.fetch(NOTIFY_CHANNEL_ID) as TextChannel
        const notifyEmbed = new EmbedBuilder()
            .setTitle("🛑 Тикет закрыт")
            .setDescription(`Тикет **${ticketChannel.name}** был закрыт пользователем <@${interaction.user.id}>.`)
            .addFields(
                { name: "Тип", value: ticketChannel.name.split("-")[0], inline: true },
                { name: "Канал", value: `<#${ticketChannel.id}>`, inline: true },
                { name: "Создан", value: `<t:${Math.floor(ticketChannel.createdTimestamp / 1000)}:R>`, inline: false },
                { name: "Сообщений", value: `${allMessages.size}`, inline: true },
                {
                    name: "Участники тикета",
                    value: membersWithAccess.map(o => `<@${o.id}>`).join(", ") || "Нет",
                    inline: false
                }
            )
            .setColor(0xe74c3c)
            .setTimestamp()

        await notifyChannel.send({ embeds: [notifyEmbed] })

        const dmEmbed = new EmbedBuilder()
            .setTitle("📪 Ваш тикет был закрыт")
            .setDescription(
                `Благодарим за обращение в поддержку!\n` +
                `Ваш тикет **${ticketChannel.name}** был закрыт модератором <@${interaction.user.id}>.`
            )
            .addFields(
                { name: "Тип", value: ticketChannel.name.split("-")[0], inline: true },
                { name: "Канал", value: `<#${ticketChannel.id}>`, inline: true },
                { name: "Создан", value: `<t:${Math.floor(ticketChannel.createdTimestamp / 1000)}:f>`, inline: false },
                { name: "Сообщений", value: `${allMessages.size}`, inline: true },
                {
                    name: "Участники:",
                    value: membersWithAccess.map(o => `<@${o.id}>`).join(", ") || "Нет",
                    inline: false
                }
            )
            .setFooter({ text: "Если у вас остались вопросы, создайте новый тикет." })
            .setColor(0x5865f2)
            .setTimestamp()

        for (const [id] of membersWithAccess) {
            try {
                const user = await UserCacheHelper.getUser(interaction.client, id)
                await user.send({ embeds: [dmEmbed] })
            } catch (err) {
                console.warn(`Не удалось отправить DM пользователю ${id}:`, err)
            }
        }

        await interaction.editReply({ content: "Тикет успешно закрыт, лог сохранён, пользователи уведомлены." })

        setTimeout(() => {
            ticketChannel.delete().catch(() => null)
        }, 3000)
    }
}

export default command