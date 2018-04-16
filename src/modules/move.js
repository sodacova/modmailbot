const config = require('../config');
const Eris = require('eris');
const threadUtils = require('../threadUtils');
const transliterate = require("transliteration");

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  async function clearThreadOverwrites(channel) {
    const overwrites = channel.permissionOverwrites;
    if (! overwrites) return;
    let promises = [];
    for (let o of overwrites.values()) {
      promises.push(channel.deletePermission(o.id, 'Moving modmail thread.'));
    }

    return await Promise.all(promises);
  }

  function syncThreadChannel(channel, category) {
    const overwrites = category.permissionOverwrites;
    if (! overwrites) return;
    for (let o of overwrites.values()) {
      channel.editPermission(o.id, o.allow || null, o.deny || null, o.type, 'Moving modmail thread.');
    }
  }

  addInboxServerCommand('move', async (msg, args, thread) => {
    if (! config.allowMove) return;

    if (! thread) return;

    const searchStr = args[0];
    if (! searchStr || searchStr.trim() === '') return;

    const normalizedSearchStr = transliterate.slugify(searchStr);

    const categories = msg.channel.guild.channels.filter(c => {
      // Filter to categories that are not the thread's current parent category
      return (c instanceof Eris.CategoryChannel) && (c.id !== msg.channel.parentID);
    });

    if (categories.length === 0) return;

    // See if any category name contains a part of the search string
    const containsRankings = categories.map(cat => {
      const normalizedCatName = transliterate.slugify(cat.name);

      let i;
      for (i = 1; i < normalizedSearchStr.length; i++) {
        if (! normalizedCatName.includes(normalizedSearchStr.slice(0, i))) {
          i--;
          break;
        }
      }

      return [cat, i];
    });

    // Sort by best match
    containsRankings.sort((a, b) => {
      return a[1] > b[1] ? -1 : 1;
    });

    if (containsRankings[0][1] === 0) {
      thread.postSystemMessage('No matching category');
      return;
    }

    const targetCategory = containsRankings[0][0];
    const threadChannel = msg.channel.guild.channels.get(thread.channel_id);

    await clearThreadOverwrites(threadChannel);

    bot.editChannel(thread.channel_id, {
      parentID: targetCategory.id
    }).then(channel => syncThreadChannel(threadChannel, targetCategory));

    thread.postSystemMessage(`Thread moved to ${targetCategory.name.toUpperCase()}`);
  });

  bot.registerCommandAlias('m', 'move');
};
