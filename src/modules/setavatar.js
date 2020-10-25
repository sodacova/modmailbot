const Eris = require("eris");
const threadUtils = require("../threadUtils");
const axios = require("axios");

const validate_img = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/;

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
    bot.registerCommandAlias("setav");
    threadUtils.addInboxServerCommand(bot, "setavatar", async (msg, args) => {

    let url = args[0];

    if (! validate_img.test(url)) return msg.channel.createMessage("<:dynoError:696561633425621078> No image found.");
    try {
			const response = await axios.get(url, {
				headers: { Accept: 'image/*' },
				responseType: 'arraybuffer'
      });
      var newav = `data:${response.headers['content-type']};base64,${response.data.toString('base64')}`;

    } catch (err) {
        console.log(err);
    }

    return bot.editSelf({ avatar: newav })
        .then(() => msg.channel.createMessage("<:dynoSuccess:696561641227288639> Successfully changed avatar."))
        .catch(() => msg.channel.createMessage("<:dynoError:696561633425621078> Couldn\'t change avatar."));
}, {
    requirements: {
        roleIDs: ["203040224597508096", "523021576128692239"],
    }
  });
};
