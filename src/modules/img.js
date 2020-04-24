const threadUtils = require("../threadUtils");
const { getSelfUrl } = require('../utils');

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  addInboxServerCommand('img', async (msg, args, thread) => {
    if (! thread) return;
    const dmChannel = await bot.getDMChannel(thread.user_id);
    if (! dmChannel) return;

    if (! (args.length && ! args[0].startsWith(await getSelfUrl('attachments/')))) return msg.channel.createMessage('<:dynoError:696561633425621078> Provide an attachment URL');
    const url = args[0].replace(await getSelfUrl('attachments/'), `https://cdn.discordapp.com/attachments/${dmChannel.id}/`);
    msg.channel.createMessage(url);
  });
};