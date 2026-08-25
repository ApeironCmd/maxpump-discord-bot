import {
    ButtonInteraction,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js"
import { Button } from "../types"

const button: Button = {
    customId: "ticket.claim",
    execute: async (interaction: ButtonInteraction, channelIdArg?: string) => {
        const channelId = channelIdArg
        if (!channelId) {
            return interaction.reply({ content: "Не передан ID канала.", ephemeral: true })
        }

        const guild = interaction.guild
        if (!guild) {
            return interaction.reply({ content: "Гильдия не найдена.", ephemeral: true })
        }

        const ticketChannel = guild.channels.cache.get(channelId)
        if (!ticketChannel || ticketChannel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: "Канал тикета не найден или недоступен.", ephemeral: true })
        }

        const member = interaction.member
        if (!member || !("permissions" in member)) {
            return interaction.reply({ content: "Ошибка доступа к вашему участнику.", ephemeral: true })
        }

        const alreadyHasAccess = ticketChannel.permissionOverwrites.cache.get(interaction.user.id)
        if (alreadyHasAccess) {
            return interaction.reply({
                content: "Вы уже участвуете в этом тикете.",
                ephemeral: true
            })
        }

        await ticketChannel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        })

        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("🔔 Новый отклик по вашей жалобе")
            .setDescription(`Пользователь <@${interaction.user.id}> откликнулся на ваш тикет и теперь участвует в нем.`)
            .setFooter({ text: `ID тикета: ${channelId}` })
            .setTimestamp()

        await ticketChannel.send({
            embeds: [embed]
        })

        const originalMessage = interaction.message

        const updatedEmbed = EmbedBuilder.from(originalMessage.embeds[0])
        updatedEmbed.setDescription(
            `${originalMessage.embeds[0].description || ``}\n\n👤 Сейчас рассматривает тикет: <@${interaction.user.id}>`
        )

        const updatedButton = new ButtonBuilder()
            .setCustomId(`ticket.claim/${channelId}`)
            .setLabel("Откликнуться")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)

        const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(updatedButton)

        await originalMessage.edit({
            embeds: [updatedEmbed],
            components: [updatedRow]
        })

        await interaction.reply({
            content: `Вы успешно добавлены в тикет <#${channelId}>.`,
            ephemeral: true
        })
    }
}

export default button