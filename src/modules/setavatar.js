const Eris = require("eris");
const threadUtils = require("../threadUtils");
const axios = require("axios");

const VALIDATE_IMG = /^http(s)?:\/\/[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+\.(?:png|jpg|gif|webp)$/;

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
    threadUtils.addInboxServerCommand(bot, "setavatar", async (msg, args) => {
    let url = args[0];
    if (! VALIDATE_IMG.test(url)) return msg.channel.createMessage("<:dynoError:696561633425621078> No image found.");
    let response = await axios.get(url, {
      headers: { Accept: "image/*" },
      responseType: "arraybuffer"
    });
    try {
      const newav = `data:${response.headers["content-type"]};base64,${response.data.toString("base64")}`;
      return bot.editSelf({ avatar: newav })
      .then(() => msg.channel.createMessage("<:dynoSuccess:696561641227288639> Successfully changed avatar."));
      } catch (err) {
      msg.channel.createMessage(err.response);
      }
    }), {
    requirements: {
      custom: (msg) => msg.member.roles.some((r) => ["203040224597508096", "523021576128692239"].includes(r))
    }
    };
  bot.registerCommandAlias("setav", "setavatar");
};
