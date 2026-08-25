import { EmbedBuilder, TextChannel } from "discord.js"
import { SubCommand } from "../types"
import { FindGameByControlChannelID, AppManagementMessageByID } from "../structures/Game"
import { FindCharacterByID } from "../structures/GameCharacters"
import { arrayRemove } from "../select_menus/Control.Game.Characters.Remove"
import { buildElements, dmMessage } from "../buttons/Game.SignUp.Success"

const command : SubCommand = {
    id: "game.accept",
    execute: async (interaction) => {
        const channelID = interaction.channel.id

        const number_approved : number = Number(interaction.options.get("number_approved").value)
        const number_reserve : number = Number(interaction.options.get("number_reserve") ? interaction.options.get("number_reserve").value : 0)

        const game = FindGameByControlChannelID(channelID)
        if (!game) return interaction.reply({content: "Данную команду можно использовать только в канале с управлением!", ephemeral: true})

        const count = number_approved + number_reserve
        if (count <= 0) return interaction.reply({content: "Вы выбрали число меньше 1!", ephemeral: true})

        let removeChars = []
        game.users.forEach(user => {
            if ((user.status === 1 || user.status === 2 || user.status === 3) && user.character) {
                const character = FindCharacterByID(user.character, game)

                if (character && character.category != "oc") {
                    removeChars.push(user.character)
                }
            }
        })

        let approvedArray = []
        for (let i1 = 0; i1 < 100; i1++) {
            let playersList = []
            game.users.forEach(user => {
                if (user.status == 1 && user.characters) {
                    let characters = []
                    for (const charID of user.characters) {
                        characters.push(charID)
                    }

                    playersList.push([user.id, characters])
                }
            })

            for (const charID of removeChars) {
                playersList.forEach(function callback(playerValue, playerKey : number) {
                    const user = game.users.get(playerValue[0])

                    if (!user.character) {
                        playerValue[1].forEach(function callback(charValue : string, charKey : number) {
                            if (charValue == charID) {
                                playerValue[1].splice(charKey, 1)
                            }
                        })
    
                        if (playerValue[1].length <= 0) {
                            playersList.splice(playerKey, 1)
                        }
                    } else {
                        playersList[playerKey][1] = []
                    }
                })
            }

            let playersAccept = []
            for (let i = 0; i < count; i++) {
                const random = Math.floor(Math.random() * playersList.length)
                const array = playersList[random]

                if (array) {
                    const userID = array[0]

                    const user = game.users.get(userID)
                    if (user && user.character) {
                        playersAccept.push([userID, user.character])
                        playersList.splice(random, 1)
                    } else {
                        const charID = array[1][0]

                        if (charID) {
                            playersAccept.push([userID, charID])
                            playersList.splice(random, 1)

                            playersList.forEach(function callback(playerValue, playerKey : number) {
                                const user = game.users.get(playerValue[0])

                                if (!user.character) {
                                    playerValue[1].forEach(function callback(charValue : string, charKey : number) {
                                        if (charValue == charID) {
                                            playerValue[1].splice(charKey, 1)
                                        }
                                    })
    
                                    if (playerValue[1].length <= 0) {
                                        playersList.splice(playerKey, 1)
                                    }
                                }
                            })
                        }
                    }
                }
            }

            if (playersAccept.length > approvedArray.length) {
                approvedArray = playersAccept
            }
        }

        let playersApprovedList = []
        let playersReserveList = []
        for (var i = 0; i < count; i++) {
            const random = Math.floor(Math.random() * approvedArray.length)
            const id = approvedArray[random]

            if (id) {
                if (playersApprovedList.length < number_approved) {
                    playersApprovedList.push(id)
                } else {
                    playersReserveList.push(id)
                }

                approvedArray = arrayRemove(approvedArray, id)
            }
        }

        await interaction.deferReply({ephemeral: true})

        const controlChannel = interaction.channel as TextChannel

        let strs = ["", ""]
        const array = [playersApprovedList, playersReserveList]
        for (let i = 0; i < array.length; i++) {
            const list = array[i]

            for (const player of list) {
                const userID = player[0]
                const charID = player[1]

                const user = game.users.get(userID)
                if (!user) continue

                const character = FindCharacterByID(charID, game)
                if (!character) continue

                const statusID = i + 2

                const appManagementMessage = await AppManagementMessageByID(controlChannel, user.messageID).catch((error) => {})
                if (!appManagementMessage) continue

                user.status = statusID
                user.character = charID
                game.save()

                const emoji = character.emoji ? `<:${character.emoji}>` : ""
                strs[i] += `[\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id}) — ${emoji} ${(character.roleID ? `<@&${character.roleID}>` : character.name)}\n`

                const data = buildElements(user, game)
                const embed = data[0]
                const row1 = data[1]
                const row2 = data[2]

                await appManagementMessage.edit({embeds: [embed], components: [row1, row2]})
                dmMessage(interaction, user, game)
            }
        }

        const embed = new EmbedBuilder()
            .setColor([47,49,54])
            .setDescription(`**Одобрены:**\n${strs[0]}\n\n**Запасники:**\n${strs[1]}`)

        interaction.editReply({content: "Готово!", embeds: [embed]})
    }
}

export default command