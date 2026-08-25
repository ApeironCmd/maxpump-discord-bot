import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js"
import { Button } from "../types"
import { CreateCharacterText } from "../structures/GameCharacters"
import { SteamIDTo64 } from "../structures/SteamID"
import { FindGameByControlChannelID } from "../structures/Game"

const MAX_FIELD_LENGTH = 1024 * 1.9 // 1024
const MAX_EMBED_LENGTH = 3800 // 6000
const MAX_PAGE_LENGTH = 5800 // 3000
const stList = {
    2: 0,
    3: 1,
    1: 2,
    4: 3
}

const stName = {
    0: "Одобрено",
    1: "Запас",
    2: "На рассмотрении",
    3: "Отказ"
}

function divideArray1(originalArray: string[], limit : number): string[][] {
    const arrays: string[][] = []
    let currentArray: string[] = []

    originalArray.forEach((item) => {
        if (currentArray.join("").length + item.length > limit) {
            arrays.push(currentArray)
            currentArray = []
        }

        currentArray.push(item)
    })

    if (currentArray.length > 0) {
        arrays.push(currentArray)
    }

    return arrays
}

function divideArray2(originalArray: string[][], limit : number): string[][][] {
    let currentLength = 0
    let currentSubArray: string[][] = []
    const result: string[][][] = []

    for (let i = 0; i < originalArray.length; i++) {
        const subArray = originalArray[i]

        const subArrayLength = subArray.reduce((acc, curr) => acc + curr.length, 0)

        if (currentLength + subArrayLength > limit) {
            result.push(currentSubArray)
            currentSubArray = []
            currentLength = 0
        }

        currentSubArray.push(subArray);
        currentLength += subArrayLength;
    }

    result.push(currentSubArray)
    return result
}

function splitArray(arr: string[][], limit: number): string[][][] {
    const chunks: string[][][] = [[[], [], [], []]]

    let limited = 0
    for (let k = 1; k <= arr.length; k++) {
        const v = arr[k - 1]

        for (let k2 = 1; k2 <= v.length; k2++) {
            const v2 = v[k2 - 1]

            if (limited + v2.length < limit) {
                chunks[chunks.length - 1][k - 1][k2 - 1] = v2
            } else {
                chunks.push([[], [], [], []])
                limited = 0

                chunks[chunks.length - 1][k - 1][k2 - 1] = v2
            }

            limited = limited + v2.length
        }
    }

    return chunks
}

function CreateEmbeds(list : Array<string>, count : number, name : string) {
    const split = divideArray1(list, MAX_FIELD_LENGTH)
    const divide = divideArray2(split, MAX_EMBED_LENGTH)

    let setDescription = name

    let embeds = []
    for (let i1 = 0; i1 < divide.length; i1++) {
        for (let i2 = 0; i2 < divide[i1].length; i2++) {
            let fields = [" ", " ", " "]

            let i = 0
            for (const text of divide[i1][i2]) {
                if (i >= 3) i = 0

                fields[i] += text

                i++
            }

            const embed = new EmbedBuilder()
                .setColor([47,49,54])
                .addFields([
                    {name: " ", value: fields[0], inline: true},
                    {name: " ", value: fields[1], inline: true},
                    {name: " ", value: fields[2], inline: true},
                ])

            if (setDescription) {
                embed.setDescription(`**${count} ${name}**`)
                setDescription = undefined
            }

            embeds.push(embed)
        }
    }

    return embeds
}

export function LoadPage(interaction : ButtonInteraction, page : number, isFull : boolean, isUpdate? : boolean) {
    const channelID = interaction.channel.id

    let game = interaction.client.games.get(channelID)
    if (!game) {
        game = FindGameByControlChannelID(channelID)
    }
    if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

    let usersInfo = [[], [], [], []]
    let countList = [0, 0, 0, 0]

    // for (let i = 0; i < 80; i++) {
        game.users.forEach(user => {
            if (user.status < (isFull ? 10 : 4)) {
                let text = `• [\`${user.tag}\`](https://discordredirect.discordsafe.com/users/${user.id})\n`

                if (isFull) {
                    text += `• [\`${user.steam_id}\`](https://steamcommunity.com/profiles/${SteamIDTo64(user.steam_id)})\n`
                }

                text += CreateCharacterText(user, game)
                text += "\n"

                usersInfo[stList[user.status]].push(text)
                countList[stList[user.status]]++
            }
        })
    // }

    const array = splitArray(usersInfo, MAX_PAGE_LENGTH)
    const info = array[page]
    if (!info) return interaction.reply({content: "Упс... что-то пошло не так. (info is undefined)", ephemeral: true})

    const embeds = []
    for (let i = 0; i < info.length; i++) {
        const chunks = CreateEmbeds(info[i], countList[i], stName[i])

        for (const embed of chunks) {
            embeds.push(embed)
        }
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`game.playerslist.page/${page - 1}/${isFull}`)
                .setLabel("Предыдущая страница")
                .setEmoji("⬅️")
                .setDisabled(page <= 0)
                .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`game.playerslist.page/${page + 1}/${isFull}`)
                .setLabel("Следующая страница")
                .setEmoji("➡️")
                .setDisabled(page >= array.length - 1)
                .setStyle(ButtonStyle.Secondary)
        )
    
    if (isUpdate) {
        interaction.update({embeds: embeds, components: [row]})
    } else {
        interaction.reply({embeds: embeds, ephemeral: true, components: [row]})
    }
}

const button : Button = {
    customId: "game.playerslist",
    execute: async (interaction) => {
        if (interaction.channel == null || (interaction.channel.isThread() && interaction.channel.archived)) return

        const game = interaction.client.games.get(interaction.channelId)
        if (!game) return interaction.reply({content: "Упс... что-то пошло не так. (game is undefined)", ephemeral: true})

        LoadPage(interaction, 0, false, undefined)
    }
}

export default button