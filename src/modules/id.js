const threadUtils = require("../threadUtils");

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  addInboxServerCommand("id", async (msg, args, thread) => {
    if(! thread) return;
    let dmchannel = await bot.getDMChannel(thread.user_id);
    msg.channel.createMessage(`User ID: ${thread.user_id}\nChannel ID: ${dmchannel.id}`);
  });
};