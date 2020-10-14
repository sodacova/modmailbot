const Eris = require("eris");
const threadUtils = require("../threadUtils");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  threadUtils.addInboxServerCommand(bot, "restart", (msg) => {
    msg.channel.createMessage("Restarting...").then(() => process.exit(1));
  }, {
    requirements: {
      custom: (msg) => {
        if (msg.member.roles.some((r) => ["203040224597508096", "523021576128692239"].includes(r)) || msg.author.id === "253600545972027394") return true;
        return false;
      }
    }
  });
};