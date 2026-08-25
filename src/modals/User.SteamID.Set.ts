import { Modal } from "../types"
import { GetData, SetData } from "../structures/Data"
import hook = require("../structures/Hook")
import { SteamIDTo64 } from "../structures/SteamID"

const modal : Modal = {
    customId: "user.steamid.set",
    execute: async (interaction) => {
        const userID = interaction.user.id

        const steamIDInput = interaction.fields.getTextInputValue("steamID")

        const steamid64 = SteamIDTo64(steamIDInput)
        if (steamid64 == "0" || steamIDInput.search("STEAM_") == -1) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: "Вы указали неверный SteamID! Формат: STEAM_0:0:123456789" })
            } else {
                await interaction.reply({ content: "Вы указали неверный SteamID! Формат: STEAM_0:0:123456789", ephemeral: true })
            }
            return
        }

        let data = GetData("users_steamid", {})

        if (data[userID] == steamIDInput) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: "У вас уже установлен данный SteamID!" })
            } else {
                await interaction.reply({ content: "У вас уже установлен данный SteamID!", ephemeral: true })
            }
            return
        }

        let find = false
        Object.values(data).forEach((steamid : string) => {
            if (steamid == steamIDInput) {
                find = true
            }
        })
        if (find) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: "Данный SteamID уже привязан к аккаунту Discord-а! Если это ваш аккаунт, то напишите техническому администратору." })
            } else {
                await interaction.reply({ content: "Данный SteamID уже привязан к аккаунту Discord-а! Если это ваш аккаунт, то напишите техническому администратору.", ephemeral: true })
            }
            return
        }

        data[userID] = steamIDInput
        SetData("users_steamid", data)

        interaction.client.games.forEach(game => {
            if (game.gamemaster.id == userID) {
                game.gamemaster.steam_id = steamIDInput
            }

            const admin = game.admins.get(userID)
            if (admin) {
                admin.steam_id = steamIDInput
            }

            const user = game.users.get(userID)
            if (user) {
                user.steam_id = steamIDInput
            }

            game.save()
        })

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: `Ваш SteamID успешно изменен на: ${steamIDInput}` })
        } else {
            await interaction.reply({ content: `Ваш SteamID успешно изменен на: ${steamIDInput}`, ephemeral: true })
        }

        hook.Run("OnEditableSteamID", interaction, steamIDInput)
    }
}

export default modal