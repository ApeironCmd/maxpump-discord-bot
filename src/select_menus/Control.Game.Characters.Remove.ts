import { SelectMenu } from "../types"
import { AppManagementMessageByID, FindControlChannelByID, FindGameByControlChannelID } from "../structures/Game"
import { GetData } from "../structures/Data"
import { FindCharacterByID, GameCharacterComponent } from "../structures/GameCharacters"
import { RemoveInteractionArgs } from "../structures/InteractionsArguments"

export function arrayRemove(arr : any[], value : any) { 
    return arr.filter(ele => {
        return ele != value
    })
}

const selectMenu : SelectMenu = {
    customId: "control.game.characters.remove",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        await interaction.deferUpdate()

        const controlChannel = await FindControlChannelByID(interaction.guild, game.control_channel_id).catch((error) => {})
        if (!controlChannel) return interaction.editReply({content: "Упс... что-то пошло не так. (controlChannel is undefined)"})

        let array = []
        for (const character of game.gamecharacters) {
            if (character.uniqueID) {
                array.push(character.uniqueID)
            }
        }

        for (const uniqueID of interaction.values) {
            array = arrayRemove(array, uniqueID)
        }

        let characters : GameCharacterComponent[] = []
        for (const uniqueID of array) {
            const character = FindCharacterByID(uniqueID, game)

            if (character && character.category == "oc") {
                characters.push(character)
            }
        }

        game.gamecharacters = characters

        game.users.forEach(async user => {
            const character = FindCharacterByID(user.character, game)

            if (!character) {
                const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {})
                if (!appManagementMessage) return interaction.editReply({content: "Упс... что-то пошло не так. (appManagementMessage is undefined)"})

                const data = GetData("interactionsargs", {})
                if (typeof(data) === "object") {
                    Object.keys(data).forEach(async (key) => {
                        const element = data[key]
    
                        if (element.gameID == game.game_id && element.userID == user.id) {
                            RemoveInteractionArgs(key)
    
                            const interactionMessage = await controlChannel.messages.fetch(key).catch((error) => {})
                            if (interactionMessage) {
                                await interactionMessage.delete().catch((error) => {})
                            }
                        }
                    })
                }
    
                if (user.needHelp_id) {
                    const needHelpMessage = await controlChannel.messages.fetch(user.needHelp_id).catch((error) => {})
                    if (needHelpMessage) {
                        await needHelpMessage.delete().catch((error) => {})
                    }
                }
    
                await appManagementMessage.delete().catch((error) => {})

                game.users.delete(user.id)
                game.save()
            }
        })
        game.save()

        await interaction.editReply({content: "Вы успешно удалили выбранных персонажей", embeds: [], components: []})
    }
}

export default selectMenu