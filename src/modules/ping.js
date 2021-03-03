const Eris = require("eris");
const utils = require("../utils");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  bot.registerCommand("ping", async (msg) => {
    if (! (await utils.messageIsOnInboxServer(msg))) return;
    if (! utils.isStaff(msg.member)) return;
    msg.channel.createMessage("Pong!").then(m => m.edit(`Pong! \`${m.createdAt - msg.createdAt}ms\``));
  });
};
