const Eris = require("eris");
const threadUtils = require("../threadUtils");
const superagent = require("superagent");

const VALIDATE_IMG = /^http(s)?:\/\/[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+\.(?:png|jpg|gif|webp)$/;

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  threadUtils.addInboxServerCommand(bot, "setavatar", async (msg, args) => {
    let url = args[0];
    if (! VALIDATE_IMG.test(url)) return msg.channel.createMessage("<:dynoError:696561633425621078> Invalid image URL");
    let response;
    try {
      response = await superagent.get(url).accept("image/*").responseType("arraybuffer");
    } catch (error) {
      if (error.response) { // Server responded with error
        return msg.channel.createMessage(`<:dynoError:696561633425621078> Server responded with: ${error.status} ${error.message}\n${error.response.text || ""}`);
      } // Something happened with request
      return msg.channel.createMessage("<:dynoError:696561633425621078> Unable to send request: " + error.message);
    }
    const newav = `data:${response.headers["content-type"]};base64,${response.data.toString("base64")}`;
    return bot.editSelf({ avatar: newav }).then(
      () => msg.channel.createMessage("<:dynoSuccess:696561641227288639> Successfully changed avatar"),
      (e) => msg.channel.createMessage("<:dynoError:696561633425621078> Unable to change avatar: " + e)
    );
  }, {
    requirements: {
      custom: (msg) => msg.member.roles.some((r) => ["203040224597508096", "523021576128692239"].includes(r))
    }
  });
  bot.registerCommandAlias("setav", "setavatar");
};
