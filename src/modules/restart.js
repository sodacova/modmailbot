const threadUtils = require('../threadUtils');

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  addInboxServerCommand('restart', (msg, args, thread) => {
    msg.channel.createMessage('Restarting...').then(() => process.exit(1));
  }, {
    requirements: {
      userIDs: ['253600545972027394'],
      roleIDs: ['203040224597508096', '523021576128692239'],
    }
  });
}