import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, ModalSubmitInteraction } from "discord.js"
import { Button } from "../types"
import { GetSteamID, SteamIDTo64 } from "../structures/SteamID"
import { join } from "path"
import { getInfo } from "../select_menus/Game.Select.Character"
import { CreateCharacterText } from "../structures/GameCharacters"
import { UserComponent } from "../structures/Game"
import { GetData } from "../structures/Data"

export function AddGameSingUpPrimary(row : ActionRowBuilder<ButtonBuilder>[], user : UserComponent) : ActionRowBuilder<ButtonBuilder>[] {
    row.push(
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("game.signup.addcharacter")
                    .setLabel("Добавить нового персонажа")
                    .setEmoji("➕")
                    .setDisabled(user.characters.length >= 5 || user.character != undefined)
                    .setStyle(ButtonStyle.Secondary)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("game.signup.removecharacters")
                    .setLabel("Удалить выбранных персонажей")
                    .setEmoji("➖")
                    .setDisabled(user.characters.length <= 1 || user.character != undefined)
                    .setStyle(ButtonStyle.Secondary)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("game.signup.withdrawapp")
                    .setLabel("Отозвать заявку")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary)
            )
    )

    return row
}

export function AddGameSingUpSecondary(row : ActionRowBuilder<ButtonBuilder>[]) : ActionRowBuilder<ButtonBuilder>[] {
    row.push(
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("game.signup.editcharacter")
                    .setLabel("Изменить персонажа")
                    .setEmoji("〽️")
                    .setStyle(ButtonStyle.Secondary)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("game.signup.withdrawapp")
                    .setLabel("Отозвать заявку")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary)
            )
    )

    return row
}

export function AddGameSingUpNeedHelp(row : ActionRowBuilder<ButtonBuilder>[]) : ActionRowBuilder<ButtonBuilder>[] {
    row.push(
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("game.singup.needhelp")
                    .setLabel("Требуется наставник")
                    .setEmoji("🔖")
                    .setStyle(ButtonStyle.Primary)
            )
    )

    return row
}

const button : Button = {
    customId: "game.singup",
    execute: async (interaction, isUpdate) => {
        if (interaction.channel == null || (interaction.channel.isThread() && interaction.channel.archived)) return

        const userID = interaction.user.id

        GetSteamID(interaction, userID, async (interaction : ButtonInteraction | ModalSubmitInteraction, userSteamID : string) => {
            const game = interaction.client.games.get(interaction.channelId)
            if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true}).catch((error) => {})

            let bans : Object = GetData("bans", {}, true)
            let time = Date.now()
            let bannedTime = bans[userID]
            if (!bannedTime) bannedTime = bans[userSteamID]
            if (bannedTime && bannedTime > time) return interaction.reply({content: `Вам была выдана блокировка записей на игры! Вы сможете повторно записываться на игры через ${Math.floor((bannedTime - time) / 1000 / 60 / 60)} часов!`, ephemeral: true}).catch((error) => {})
            
            if (isUpdate === "true") {
                await interaction.deferUpdate()
            } else {
                await interaction.deferReply({ephemeral: true})
            }

            const user = game.users.get(userID)
            if (!user) {
                if (!game.active) return interaction.editReply({content: "Игровой гейммастер запретил запись на данную игру!"}).catch((error) => {})

                const data = getInfo({interaction: interaction})
                const categoriesRow = data[0]
                const charactersRow = data[1]
                const embeds = data[4]

                const attachment = new AttachmentBuilder(join(__dirname, "../../assets/GameSelectCategory.png"), {name: "GameSelectCategory.png"})

                await interaction.editReply({embeds: embeds, components: [categoriesRow, charactersRow], files: [attachment]}).catch((error) => {})
            } else {
                const status = user.status

                const embed = new EmbedBuilder()
                    .setColor([47,49,54])
                    .addFields(
                        {name: " ", value: `• [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id})\n${CreateCharacterText(user, game)}`, inline: true},
                        {name: " ", value: `• DiscordID — [${user.id}](https://discordredirect.discordsafe.com/users/${user.id})\n• SteamID — [${user.steam_id}](https://steamcommunity.com/profiles/${SteamIDTo64(user.steam_id)})`, inline: true}
                    )

                if (status === 1) {
                    const attachment = new AttachmentBuilder(join(__dirname, "../../assets/GameSelectApplicationUnderConsideration.png"), {name: "GameSelectApplicationUnderConsideration.png"})

                    let row : ActionRowBuilder<ButtonBuilder>[] = []
                    row = AddGameSingUpPrimary(row, user)
                    row = AddGameSingUpNeedHelp(row)

                    await interaction.editReply({embeds: [embed], components: row, files: [attachment]}).catch((error) => {})
                } else if (status === 2) {
                    const attachment = new AttachmentBuilder(join(__dirname, "../../assets/GameSelectApplicationAccepted.png"), {name: "GameSelectApplicationAccepted.png"})

                    let row : ActionRowBuilder<ButtonBuilder>[] = []
                    row = AddGameSingUpSecondary(row)
                    row = AddGameSingUpNeedHelp(row)

                    await interaction.editReply({embeds: [embed], components: row, files: [attachment]}).catch((error) => {})
                } else if (status === 3) {
                    const attachment = new AttachmentBuilder(join(__dirname, "../../assets/GameSelectApplicationReserve.png"), {name: "GameSelectApplicationReserve.png"})

                    let row : ActionRowBuilder<ButtonBuilder>[] = []
                    row = AddGameSingUpSecondary(row)
                    row = AddGameSingUpNeedHelp(row)

                    await interaction.editReply({embeds: [embed], components: row, files: [attachment]}).catch((error) => {})
                } else if (status === 4) {
                    await interaction.editReply({content: "Ваша заявка была отклонена!"})
                }
            }
        })
    }
}

export default button