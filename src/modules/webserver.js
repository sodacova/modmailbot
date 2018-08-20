const express = require('express');
const cookieParser = require('cookie-parser');
const mime = require('mime');
const fs = require('fs');
const path = require('path');
const superagent = require('superagent');
const config = require('../config');
const oauth2 = require('../oauth2');
const threads = require('../data/threads');
const attachments = require('../data/attachments');
const knex = require('../knex');

function notfound(res) {
  res.status(404);
  res.send('Page Not Found');
}

async function getLogs (threadId) {
  if (threadId.match(/^[0-9a-f\-]+$/) === null)
    return;

  const thread = await threads.findById(threadId);
  if (! thread) return;
  
  return await thread.getThreadMessages();
}

function getAttachment (id, desiredFilename) {
  if (! /^\d+$/.test(id))
    return;
  if (desiredFilename.match(/^[0-9a-z._-]+$/i) === null)
    return;

  const attachmentPath = attachments.getPath(id);
  if (! fs.existsSync(attachmentPath))
    return;

  const filenameParts = desiredFilename.split('.');
  const ext = (filenameParts.length > 1 ? filenameParts[filenameParts.length - 1] : 'bin');
  return [mime.lookup(ext), fs.readFileSync(attachmentPath)];
}

module.exports = (bot, sse) => {
  const app = express();
  
  app.use(cookieParser());

  if (config.dashAuthRoles) {
    app.get(config.redirectPath, oauth2.login);
    app.use(oauth2.checkAuth);
  }

  app.use(express.static(path.join(__dirname, '../dashboard/')));
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
  })

  app.get('/threads', async (req, res) => {
    let threads = await knex('threads').select('*');
    let c = {}
    for (let thread of threads) {
      if (thread.user_id in c)
        thread.dm_channel_id = c[thread.user_id]
      else
        thread.dm_channel_id = c[thread.user_id] = (await bot.getDMChannel(thread.user_id)).id;
    }
    res.send(threads);
  });
  app.get('/logs/:id', async (req, res) => {
    let logs = await getLogs(req.params.id);
    if (! logs)
      return notfound(res);

    res.send(logs);
  });
  app.get('/attachments/:id/:name', async (req, res) => {
    let [mime, attachment] = getAttachment(req.params.id, req.params.name) || [];
    
    if (! attachment)
      return notfound(res);

    res.set('Content-Type', mime);
    res.send(attachment);
  });
  app.get('/avatars/:id', async (req, res) => {
    superagent.get(`https://discordapp.com/api/users/${req.params.id}`)
    .set('Authorization', bot.token)
    .end((error, response) => {
      if (error) {
        if (error.status === 404) {
          res.status(400);
          res.send('<pre>400 Bad Request</pre>');
        } else {
          res.status(500);
          console.log(error)  
          res.send(`<pre>500 Server Error: ${error}</pre>`);
        }
      } else {
        res.set('Cache-Control', 'max-age=3600');
        let user = response.body;
        if (user.avatar) {
          let format = req.query.format || 'png'
          if (format === 'gif' && ! user.avatar.startsWith('a_'))
            format = 'png'
          res.redirect(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}`);
        } else {
          let defaultAvatars = [
            '6debd47ed13483642cf09e832ed0bc1b',
            '322c936a8c8be1b803cd94861bdfa868',
            'dd4dbc0016779df1378e7812eabaa04d',
            '0e291f67c9274a1abdddeb3fd919cbaa',
            '1cbd08c76f8af6dddce02c5138971129'
          ];
          let avatar = defaultAvatars[user.discriminator % defaultAvatars.length];
          res.redirect(`https://discordapp.com/assets/${avatar}.png`);
        }
      }
    }); 
  });
  app.get('/stream', sse.init);

  app.listen(config.port);
};
