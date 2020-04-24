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

		if (args.length > 0 && ! isNaN(args[0])) {
			messages = messages.slice(0, parseInt(args[0], 10));
		}

		if (messages && messages.length) {
			try {
				const count = messages.length;
				for (let id of messages) {
					bot.deleteMessage(channel.id, id).catch(() => null);
				}
				thread.postSystemMessage(`Purged ${count} messages.`);
			} catch (err) {
				thread.postSystemMessage(`Error deleting messages: ${e.message}`);
			}
		}
	}
  });

	bot.registerCommandAlias('p', 'purge');
	
	addInboxServerCommand('undo', async (msg, args, thread) => {
		if (! thread) return;

		const channel = await bot.getDMChannel(thread.user_id);
		if (! channel || ! channel.id) {
			return thread.postSystemMessage(`Error getting DM Channel`);
		}

		let message = await bot.getMessages(channel.id, 100);
		message = messages.filter(m => m.author.id === bot.user.id)[0];

		if (message) {
			try {
				await bot.deleteMessage(channel.id, message.id);
				thread.postSystemMessage(`Purged 1 message.`);
			} catch (err) {
				thread.postSystemMessage(`Error deleting messages: ${e.message}`);
			}
		}
	})
};
