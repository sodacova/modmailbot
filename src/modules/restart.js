const Eris = require("eris");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  bot.registerCommand("restart", (msg) => {
    msg.channel.createMessage("Restarting...").then(() => process.exit(1));
  }, {
    requirements: {
      custom: (msg) => msg.member.roles.some((r) => ["203040224597508096", "523021576128692239"].includes(r))
    }
  });
};