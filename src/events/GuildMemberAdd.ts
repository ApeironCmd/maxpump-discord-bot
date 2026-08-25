import { Client, EmbedBuilder, Events, GuildTextBasedChannel, Invite, Guild } from "discord.js"
import { GetData, SetData } from "../structures/Data"

const invitesCache = new Map<string, Map<string, number>>()
const invitesCount = GetData("invites_count", {})

interface InviteData {
    name: string;
    timestamp: number;
    inviteCode: string;
}

interface PreviousInvite {
    inviterId: string;
    timestamp: number;
    inviteCode: string;
}

module.exports = (client: Client) => {
    client.once(Events.ClientReady, async () => {
        for (const [guildId, guild] of client.guilds.cache) {
            const invites = await guild.invites.fetch().catch(() => null)
            if (invites) {
                const inviteUses = new Map<string, number>(invites.map(inv => [inv.code, inv.uses || 0]))
                invitesCache.set(guildId, inviteUses)
            }
        }
    })

    client.on(Events.InviteCreate, async (invite) => {
        const guildId = invite.guild.id
        const invites = await (invite.guild as Guild).invites.fetch().catch(() => null)
        if (invites) {
            const inviteUses: Map<string, number> = new Map<string, number>(invites.map((inv: Invite) => [inv.code, inv.uses || 0]))
            invitesCache.set(guildId, inviteUses)
        }
    })

    client.on(Events.GuildMemberAdd, async (member) => {
        try {
            const guild = member.guild
            const channel = await guild.channels.fetch("1423372281358585998") as GuildTextBasedChannel
            if (!channel || !channel.isTextBased()) return

            const oldInvites = invitesCache.get(guild.id) || new Map<string, number>()
            const newInvites = await guild.invites.fetch().catch(() => null)
            if (!newInvites) return

            let usedInvite: Invite | null = null
            for (const invite of newInvites.values()) {
                const oldUses = oldInvites.get(invite.code) || 0
                if ((invite.uses || 0) > oldUses) {
                    usedInvite = invite
                    break
                }
            }

            const updatedInviteUses: Map<string, number> = new Map<string, number>(newInvites.map((inv: Invite) => [inv.code, inv.uses || 0]))
            invitesCache.set(guild.id, updatedInviteUses)

            const registrationDate = Math.floor(member.user.createdAt.getTime() / 1000)

            let inviteInfo = "**Инвайт не определен**"
            let inviterMention = "Неизвестно"
            let inviterId = ""
            let inviteCreationDate = 0

            let previousInvites: PreviousInvite[] = []
            let isReturningUser = false

            Object.entries(invitesCount).forEach(([userId, userInvites]) => {
                const invitesObject = userInvites as { [key: string]: InviteData }
                if (invitesObject[member.id]) {
                    previousInvites.push({
                        inviterId: userId,
                        timestamp: invitesObject[member.id].timestamp,
                        inviteCode: invitesObject[member.id].inviteCode
                    })
                }
            })

            if (previousInvites.length > 0) {
                isReturningUser = true
            }

            if (usedInvite) {
                inviterMention = usedInvite.inviter ? (`${usedInvite.inviter.username} (${usedInvite.inviter.toString()})`) : "Неизвестно"
                inviterId = usedInvite.inviter?.id || ""
                inviteCreationDate = usedInvite.createdAt ? Math.floor(usedInvite.createdAt.getTime() / 1000) : 0

                if (inviterId) {
                    if (!invitesCount[inviterId]) {
                        invitesCount[inviterId] = {}
                    }
                    
                    const inviterInvites = invitesCount[inviterId] as { [key: string]: InviteData }
                    
                    if (!inviterInvites[member.id]) {
                        inviterInvites[member.id] = {
                            name: member.user.username,
                            timestamp: Date.now(),
                            inviteCode: usedInvite.code
                        }
                        
                        SetData("invites_count", invitesCount)
                    }
                }

                const inviterInvites = invitesCount[inviterId] as { [key: string]: InviteData }
                const inviteCountText = inviterId 
                    ? `**Всего приглашено:** ${Object.keys(inviterInvites).length}` 
                    : "Нет данных о количестве приглашенных."

                inviteInfo = `**Инвайт:** \`${usedInvite.code}\`  
                **Создан:** <t:${inviteCreationDate}:F> (<t:${inviteCreationDate}:R>)  
                **Пригласил:** ${inviterMention}  
                ${inviteCountText}`
            }

            const embed = new EmbedBuilder()
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp()

            if (isReturningUser) {
                embed.setColor("#FFA500")
                    .setDescription(`🔄 Пользователь ${member.user.username} (${member.user.toString()}) **вернулся** на сервер!`)
                    .addFields(
                        { name: "**Дата регистрации**", value: `<t:${registrationDate}:F> (<t:${registrationDate}:R>)` },
                        { name: "**Информация о приглашении**", value: inviteInfo }
                    )

                let previousInvitesInfo = "**История подключений:**\n"
                previousInvites.forEach((invite, index) => {
                    const inviter = client.users.cache.get(invite.inviterId)
                    const inviterName = inviter ? `${inviter.username} (${inviter.toString()})` : `Неизвестный пользователь (${invite.inviterId})`
                    previousInvitesInfo += `${index + 1}. <t:${Math.floor(invite.timestamp / 1000)}:F> - ${inviterName} (инвайт: \`${invite.inviteCode}\`)\n`
                })

                embed.addFields({
                    name: "**Предыдущие подключения**",
                    value: previousInvitesInfo
                })
            } else {
                embed.setColor("#78F937")
                    .setDescription(`✅ Пользователь ${member.user.username} (${member.user.toString()}) **впервые** присоединился к серверу!`)
                    .addFields(
                        { name: "**Дата регистрации**", value: `<t:${registrationDate}:F> (<t:${registrationDate}:R>)` },
                        { name: "**Информация о приглашении**", value: inviteInfo }
                    )
            }

            await channel.send({content: "<@&1423339137468989545>", embeds: [embed] })
        } catch (error) {
            console.error("❌ Ошибка при обработке нового участника:", error)
        }
    })
}