const attachments = require("../data/attachments");
const config = require('../config');
const threadUtils = require("../threadUtils");

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  addInboxServerCommand('purge', async (msg, args, thread) => {
    if (! thread) return;

    if (! config.inboxAdminRoleId) {
		return;
	}

	if (msg.member.roles && msg.member.roles.includes(config.inboxAdminRoleId)) {
		const channel = await bot.getDMChannel(thread.user_id);
		if (! channel || ! channel.id) {
			return thread.postSystemMessage(`Error getting DM Channel`);
		}

		let messages = await bot.getMessages(channel.id, 100);
		messages = messages.filter(m => m.author.id === bot.user.id).map(m => m.id);
		if (messages && messages.length) {
			try {
				for (let id of messages) {
					bot.deleteMessage(channel.id, id).catch(() => null);
				}
			} catch (err) {
				thread.postSystemMessage(`Error while replying to user: ${e.message}`);
			}
		}
	}
  });

  bot.registerCommandAlias('p', 'purge');
};
