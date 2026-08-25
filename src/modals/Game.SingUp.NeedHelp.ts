import { Modal } from "../types"
import { EmbedBuilder } from "@discordjs/builders"
import { FindControlChannelByID, GetTime } from "../structures/Game"
import { TextChannel } from "discord.js"
import { Vars } from "../structures/Data"

const modal : Modal = {
    customId: "game.singup.needhelp",
    execute: async (interaction) => {
        const channelID = interaction.channel.id
        const userID = interaction.user.id

        const descriptionInput = interaction.fields.getTextInputValue("descriptionInput")

        const game = interaction.client.games.get(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        const user = game.users.get(userID)
        if (!user) return interaction.reply({content: "Упс... что-то пошло не так. (user is undefined)", ephemeral: true})

        let cooldown = Vars["client"].cooldowns.get(`game.singup.needhelp-${userID}`) || 0
        if (Date.now() < cooldown) {
            const time = Math.floor(Math.abs(Date.now() - cooldown) / 1000)
            interaction.reply({content: `Подождите еще ${time} секунд прежде чем запросить наставника еще раз!`, ephemeral: true})
            return
        }
        Vars["client"].cooldowns.set(`game.singup.needhelp-${userID}`, Date.now() + 300 * 1000)

        await interaction.deferReply({ephemeral: true})

        if (user.needHelp_id) {
            const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {}) as TextChannel
            if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

            const needHelpMessage = await controlChannel.messages.fetch(user.needHelp_id).catch((error) => {})
            if (needHelpMessage) {
                await needHelpMessage.delete().catch((error) => {})
            }
        }

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setTitle(`Запрос помощи на игру «${game.title}»`)
            .setDescription(`Пользователь [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id}) запрашивает помощь в наставничестве на предстоящей игре!\n\n**Описание запроса**\n\`\`\`${descriptionInput}\`\`\``)
            .setFooter({text: `Заявка создана ${GetTime()}`, iconURL: interaction.user.avatarURL()})

        const message = await controlChannel.send({content: `<@!${game.gamemaster.id}>`, embeds: [embed]})

        user.needHelp_id = message.id
        user.needHelp_message = descriptionInput
        game.save()

        await interaction.editReply({content: "Ваша заявка помощи на игре была успешно отправлена!"})
    }
}

export default modal