import { Client, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

module.exports = (client: Client) => {
    client.once(Events.ClientReady, async () => {
        try {
            const channelId = "1432033222048350299"
            const messageId = "1438203310778876017"
            
            const channel = await client.channels.fetch(channelId)
            if (!channel?.isTextBased()) return

            const message = await channel.messages.fetch(messageId)
            
            const content = `# Добро пожаловать на сервер MAX-PUMP

Здесь вы можете воспользоваться навигацией по серверу, ознакомиться с документацией, посмотреть свой игровой профиль.`

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("navigation.main")
                        .setLabel("Навигация сервера")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId("navigation.profile")
                        .setLabel("Игровой профиль")
                        .setStyle(ButtonStyle.Secondary)
                )

            await message.edit({ content, components: [row] })
            console.log("Навигационное сообщение успешно обновлено")
        } catch (error) {
            console.error("Ошибка при обновлении навигационного сообщения:", error)
        }
    })
}