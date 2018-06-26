// Imports
const config = require('../config')
import { join } from 'path'
import { Storage } from './storage'
import { Client, Events } from '@tanuki/discord-bot-base'

// Storage
const storage = new Storage({
    dialect: 'sqlite',
    storage: join(__dirname, '../db.sqlite')
});

// Discord BOT (Commando Framework)
const client = new Client(config.client);

client.shared.set('storage', storage);
client.shared.set('config', config);

// Register events
client.dispatcher
    .on(Events.ERROR, console.error);

// Async executions
(async () => {
    // Initialisation
    await Promise.all([
        client.logIn(),
        storage.logIn(),
        client.registry.command.registerDefaults(),
        ...config.commands.map(command => client.registry.command.register(require.resolve('./command/' + command)))
    ])
    client.registry.command.get('eval').settings.ownerOnly = false
    // await storage.regenDefaultTables()
})()
.then(() => console.log('Application finished'))
.catch(console.error);
