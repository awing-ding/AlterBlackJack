/*
 AlterBlackJack
 Copyright (C) 2026 Awing

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
    ChatInputCommandInteraction, range, SlashCommandBuilder, AttachmentBuilder, MediaGalleryBuilder,
    BufferResolvable, Component, Attachment, MessageFlags, ContainerBuilder, ButtonBuilder, ButtonStyle, Interaction,
    ComponentType
} from "discord.js";
import fs from "fs/promises";
import {createCanvas, loadImage} from "canvas";
import * as http from "node:http";


//We have 52 cards in a standard game
//13 in each color
//We can represent them as numbers, such as 0-12 for hearts, 13-25 for diamonds, 26-38 for clubs and 39-51 for spades
//We do this by taking the 13 modulo we then get 0-12 range, and the euclidian division quotient being the color
//e.g. 48 % 13 = 9, 48 // 13 = 3, it's then the 10 of spades
const colors = ["H", "D", "C", "S"]
const faces = ["J", "Q", "K"]

type t_card = {
    value: number,
    color: string,
}

type t_score = {
    player: number,
    dealer: number
}

async function getHandValue(hand: number[]) {
    let handValue = 0;
    let asCount = 0;
    for (const i of hand) {
        const j = i % 13 + 2;
        if (j == 1 || j == 14) asCount++;
        else if (j > 9) handValue += 10;
        else handValue += j;
    }
    //configuration possible with aces:
    //0 : 0
    //1 : 1 or 11
    //2 : 2, 12
    //3 : 3, 14
    //4 : 4, 15
    let combination: number[] = [0];
    switch (asCount) {
        case 1:
            combination = [1, 11];
            break;
        case 2:
            combination = [2, 12];
            break;
        case 3:
            combination = [3, 13];
            break;
    }
    let max: number | undefined = undefined;
    let min = 200;
    for (const i of combination) {
        const j = handValue + i;
        if (j > (max ?? 0) && j <= 21) max = j;
        if (j < min) min = j;
    }
    if (!max) return min;
    return max;

}

function getColor(i: number): t_card | undefined {
    if (i < 0 || i >= 52) {
        console.error("Invalid card index");
        return;
    }
    const value = i % 13 + 1
    const q = Math.floor(i / 13);
    const color = colors[q];
    return {value: value, color: color};
}

function getCardName(card: t_card) {
    let v = card.value % 13
    if (v > 9) {
        return `${card.color}${faces[v - 10]}`
    }else {
        return `${card.color}${v + 1}`
    }
}

async function generateSvgLayout(dealerDeck: number[], playerDeck: number[], show_all = false) {
    let dealerDeckCards = dealerDeck.map((card) => getColor(card)!).slice(show_all ? 0 : 1);
    let dealerDeckCardsId = dealerDeckCards.map((card) => getCardName(card));

    let playerDeckCards = playerDeck.map((card) => getColor(card)!);
    let playerDeckCardsId = playerDeckCards.map((card) => getCardName(card));

    const CARD_WIDTH = 69;
    const CARD_HEIGHT = 93;

    const width = CARD_WIDTH * Math.max(dealerDeckCardsId.length, playerDeckCardsId.length) + 20;
    const SEPARATOR = 50;
    const height = CARD_HEIGHT * 2 + SEPARATOR;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (ctx == null) return console.error("Can't find canvas context");
    ctx.fillStyle = "#009900";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = (canvas.width - ((dealerDeckCardsId.length + (show_all ? 0 : 1)) * CARD_WIDTH)) / 2;
    if (!show_all){
        try {
            const file = await fs.readFile(`${process.cwd()}/assets/_R.png`);
            const png = await loadImage(file);
            ctx.drawImage(png, x, 5);
        } catch (err) {
            console.error(err);
            return;
        } x+= CARD_WIDTH;
    }
    for (const card of dealerDeckCardsId) {
        const path = `${process.cwd()}/assets/${card}.png`;
        try {
            const file = await fs.readFile(path);
            const png = await loadImage(file);
            ctx.drawImage(png, x, 5);
        } catch (err) {
            console.error(err);
            return;
        }
        x += CARD_WIDTH;
    }
    x = (canvas.width - (playerDeckCardsId.length * CARD_WIDTH)) / 2;
    for (const card of playerDeckCardsId) {
        const path = `${process.cwd()}/assets/${card}.png`;
        try {
            const file = await fs.readFile(path)
            const png = await loadImage(file);
            ctx.drawImage(png, x, CARD_HEIGHT + SEPARATOR - 5);
        } catch (err) {
            console.error(err);
            return;
        }
        x += CARD_WIDTH;
    }

    return canvas;
}

async function shuffle(array: number[]) {
    let i = array.length, j, temp;
    while (i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[j];
        array[j] = array[i];
        array[i] = temp;
    }
    return array;
}

async function buildDisplayComponent(image: AttachmentBuilder, userId: string, index: number, actionLog: string[], scores: t_score, disable_all = false, lost = 0) {

    const container = new ContainerBuilder()
        .setAccentColor(lost == 1 ? 0X990000 : lost == 0 ? 0x009900 : 0x555555)
        .addTextDisplayComponents((text) =>
            text.setContent(
                (index == 0 ? `<@${userId}> It's gambling time !\n` : "" ) +
                `Player score : ${scores.player}, Dealer score : ${scores.dealer}\n` +
                (actionLog.length > 0 ? `Précédemment:\n${actionLog.join("\n")}` : "")
            )
        ).addSeparatorComponents()
        .addMediaGalleryComponents((gallery) =>
            gallery.addItems(
                (item) =>
                    item.setDescription("Le tapis de jeu")
                        .setURL(`attachment://${image.name}`)
            )
        ).addActionRowComponents((row =>
                row.setComponents(
                    new ButtonBuilder().setCustomId("hit").setLabel("Hit").setStyle(ButtonStyle.Primary).setDisabled(disable_all),
                    new ButtonBuilder().setCustomId("stand").setLabel("Stand").setStyle(ButtonStyle.Secondary).setDisabled(disable_all),
                    new ButtonBuilder().setCustomId("double").setLabel("Double").setStyle(ButtonStyle.Success).setDisabled(index != 0 || disable_all)
                )
        ));


    return [container]
}

export let data = new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Jouez au blackjack contre le bot !")
    .addSubcommand(subcommand =>
        subcommand.setName("play")
            .setDescription("Jouer une partie de blackjack contre le bot")
            .addUserOption(option =>
            option.setName("joueur")
                .setDescription("Le joueur qui va jouer")
            ).addIntegerOption(option =>
            option.setName("seuil")
                .setDescription("Le seuil de la banque (entre 1 et 21)")
                .setMinValue(1)
                .setMaxValue(21)
        )
    ).addSubcommand(subcommand =>
        subcommand.setName("stats")
            .setDescription("Affichez vos statistiques !")
        );

export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.options.getSubcommand() == "stats"){
        const stats = await fetch(`http://backend:3497/user/stats/${interaction.user.id}`)
        const result = await stats.json();
        await interaction.reply({content:
                `# Statistiques\n`+
                `**Score minimal** : ${result.min_score}\n`+
                `**Score maximum** : ${result.max_score}\n`+
                `**Score moyen** : ${result.avg_score}\n`+
                `**Nombre de parties** : ${(1*result.total_games).toFixed(2)}\n`+
                `**Nombre de BlackJack** : ${result.nb_blackjack}\n`+
                `**Nombre de parties gagnées** : ${result.nb_gagne}\n`+
                `**Ratio de parties gagnées** : ${(100*result.percent_gagne).toFixed(1)}%\n`
        })
    } else if (interaction.options.getSubcommand() == "play") {
        const joueur = interaction.options.getUser("joueur") ?? interaction.user;
        const seuil = interaction.options.getInteger("seuil") ?? 17;
        let deck = range(52).toArray();
        deck = await shuffle(deck);
        let playerHand = [deck.pop()!, deck.pop()!];
        let dealerHand = [deck.pop()!, deck.pop()!];
        let actionLog: string[] = [];
        let index = 0;
        let playerSore = await getHandValue(playerHand);
        if (playerSore == 21) {
            actionLog.push("Blackjack ! Player wins !");
        }

        const displayScores = {
            player: playerSore,
            dealer: playerSore >= 21 ? await getHandValue(dealerHand) : await getHandValue(dealerHand.slice(1))
        }

        const tapisBuffer = (await generateSvgLayout(dealerHand, playerHand))?.toBuffer()!;
        const tapis = new AttachmentBuilder(tapisBuffer).setName("tapis.png");
        const response = await buildDisplayComponent(tapis, joueur.id, index, actionLog, displayScores, playerSore >= 21);

        let responseInteraction = await interaction.reply({
            components: response,
            files: [tapis],
            flags: MessageFlags.IsComponentsV2,
            withResponse: true,
        })

        if (playerSore >= 21) return;

        const collector = responseInteraction.resource?.message?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300_000
        })!;

        collector.on('collect', async (i) => {
            if (i.user.id !== joueur.id) {
                await i.reply({content: "Ce n'est pas à vous de jouer !", flags: MessageFlags.Ephemeral});
                return;
            }
            if (!i) {
                await interaction.editReply({
                    content: "Failed to parse Interaction !",
                    components: []
                });
                return;
            }

            if (i.customId === "hit") {
                playerHand.push(deck.pop()!);
                actionLog.push("Player hits");
                if ((await getHandValue(playerHand)) > 21) {
                    actionLog.push("Player busts");
                }
            } else if (i.customId === "stand") {
                actionLog.push("Player stands");
                while ((await getHandValue(dealerHand)) < seuil) {
                    dealerHand.push(deck.pop()!);
                    actionLog.push("Dealer hits");
                }
            } else if (i.customId === "double") {
                if (index != 0) console.error(`Double should not be possible in turn ${index}, ${i.id}`)
                playerHand.push(deck.pop()!);
                actionLog.push("Player double");
                while ((await getHandValue(dealerHand)) < seuil) {
                    dealerHand.push(deck.pop()!);
                    actionLog.push("Dealer hits");
                }
            }
            let disable_all = false;
            let playerScore = await getHandValue(playerHand);
            let dealerScore = await getHandValue(dealerHand);
            if (playerScore > 21 || dealerScore > 21 || i.customId === "stand" || i.customId === "double") disable_all = true;
            let lost = 0;
            if (disable_all) {
                if (playerScore > 21) {
                    actionLog.push("Player busts, dealer wins !");
                    lost = 1;
                } else if (dealerScore > 21) actionLog.push("Dealer busts, player wins !");
                else if (playerScore > dealerScore) actionLog.push("Player wins !");
                else if (playerScore < dealerScore) {
                    actionLog.push("Dealer wins !");
                    lost = 1;
                } else {
                    actionLog.push("It's a tie !");
                    lost = -1;
                }
                actionLog.push();
            }
            index++;
            const displayScores = {
                player: playerScore,
                dealer: disable_all ? dealerScore : await getHandValue(dealerHand.slice(1))
            }
            const tapisBuffer_local = (await generateSvgLayout(dealerHand, playerHand, disable_all))?.toBuffer()!;
            const tapis_local = new AttachmentBuilder(tapisBuffer_local).setName("tapis.png");
            const response_local = await buildDisplayComponent(tapis_local, joueur.id, index, actionLog, displayScores, disable_all, lost);

            if (disable_all) {

                const body = JSON.stringify({
                    dealer_score: dealerScore,
                    nb_player: 1,
                    players: [
                        {
                            user_id: joueur.id,
                            won: lost == 0,
                            blackjack: playerScore == 21 && playerHand.length == 2,
                            player_score: playerScore
                        },
                    ]
                })

                await fetch("http://backend:3497/game/", {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    body: body
                })
            }

            await i.update({
                components: response_local,
                files: [tapis_local],
                flags: MessageFlags.IsComponentsV2,
            })
        })
    }
}