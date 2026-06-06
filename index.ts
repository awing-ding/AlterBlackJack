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

import {Collection, REST, Routes, Client, GatewayIntentBits, MessageFlags} from 'discord.js';
import dotenv from 'dotenv';
import * as blackjack from './blackjack'

dotenv.config();

interface ClientWithCommands extends Client {
    commands: Collection<string, any>
}

const intents = [
    GatewayIntentBits.GuildMessages,
]

const client = new Client({intents: intents, allowedMentions: { parse: ['users'], repliedUser: true}}) as ClientWithCommands;
client.commands = new Collection();
client.commands.set(blackjack.data.name, blackjack);

const clientID = process.env.CLIENT_ID;
const token = process.env.TOKEN;
const testServer = process.env.GUILD_ID;

if (!token || !clientID ) {
    console.error("Missing token or client ID in environment variables");
    process.exit(1);
}


const rest = new REST().setToken(token);
(async () => {
    try {
        console.log('refreshing application commands.');
        await rest.put(
            Routes.applicationCommands(clientID),
            { body : [blackjack.data.toJSON()] }
        )
        if (testServer) {
            await rest.put(
                Routes.applicationGuildCommands(clientID, testServer),
                {body: [blackjack.data.toJSON()]}
            )
        }
        console.log('Successfully updated application commands.');
    } catch (err) {
        console.error(err);
    }
})();

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()){
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await blackjack.execute(interaction);
        } catch (err) {
            console.error(err);
            return interaction.reply({content: "Il y a eu une erreur !", flags: MessageFlags.Ephemeral});
        }
    }
})

client.login(process.env.TOKEN).then(r => console.log("Bot connecté !")).catch(err => console.error(err));