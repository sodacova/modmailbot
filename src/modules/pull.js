const childProcess = require('child_process');
const threadUtils = require('../threadUtils');

async function exec(command, options) { // My very elaborate asynchronous streamed execution function, you're welcome
  return new Promise((res, rej) => {
    let output = '';
    const writeFunction = (data) => {
      output += `${data}`; // Buffer.toString()
    };

    const cmd = childProcess.exec(command, options);
    cmd.stdout.on('data', writeFunction);
    cmd.stderr.on('data', writeFunction);
    cmd.on('error', writeFunction);
    cmd.once('close', (code) => {
      cmd.stdout.off('data', writeFunction);
      cmd.stderr.off('data', writeFunction);
      cmd.off('error', writeFunction);
      setTimeout(() => {}, 1000);
      if (code !== 0) rej(new Error(`Command failed: ${command}\n${output}`));
      res(output);
    });
  })
}

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  addInboxServerCommand('pull', async (msg, args, thread) => {
    const message = await msg.channel.createMessage('Pulling...');
    exec('git pull').then(
      (res) => message.edit(`\`\`\`\n${res}\n\`\`\``),
      (rej) => message.edit(`\`\`\`\n${rej.message}\n\`\`\``)
    );
  }, {
    requirements: {
      userIDs: ['253600545972027394'],
      roleIDs: ['203040224597508096', '523021576128692239'],
    }
  })
}