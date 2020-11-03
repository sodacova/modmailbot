const Eris = require("eris");
const threadUtils = require("../threadUtils");
const axios = require("axios");
const utils = require('../utils')

const validate_img = /^http(s)?:\/\/[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+\.(?:png|jpg|gif|webp)$/;

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
    threadUtils.addInboxServerCommand(bot, "setavatar", async (msg, args) => {

    let url = args[0];

    if (! validate_img.test(url)) return msg.channel.createMessage("<:dynoError:696561633425621078> No image found.");
    try {
			const response = await axios.get(url, {
				headers: { Accept: 'image/*' },
				responseType: 'arraybuffer'
      });

      let newav = `data:${response.headers['content-type']};base64,${response.data.toString('base64')}`;

      return bot.editSelf({ avatar: newav })
        .then(() => msg.channel.createMessage("<:dynoSuccess:696561641227288639> Successfully changed avatar."))
        .catch((err) => new Error(err));

      } catch (err) {
        new Error(err);
      }
    })
    bot.registerCommandAlias("setav", "setavatar"), {
    requirements: {
      roleIDs: ["203040224597508096", "523021576128692239"],
    }
  }
};
