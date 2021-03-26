const fs = require("fs");
const https = require("https");
const config = require("../config");
const {promisify} = require("util");
const Eris = require("eris");

const getUtils = () => require("../utils");

const access = promisify(fs.access);
const readFile = promisify(fs.readFile);

const attachmentDir = config.attachmentDir || `${__dirname}/../../attachments`;

/**
 * @type {{[id: string]: Promise<void>}}
 */
const attachmentSavePromises = {};

/**
 * Returns the filesystem path for the given attachment id
 * @param {String} attachmentId
 * @returns {String}
 */
function getPath(attachmentId) {
  return `${attachmentDir}/${attachmentId}`;
}

/**
 * Attempts to download and save the given attachement
 * @param {Eris.Attachment} attachment
 * @returns {Promise<void>}
 */
async function saveAttachment(attachment) {
  if (attachmentSavePromises[attachment.id]) {
    return attachmentSavePromises[attachment.id];
  }

  const filepath = getPath(attachment.id);
  try {
    // If the file already exists, resolve immediately
    await access(filepath);
    return;
  } catch (e) {}

  attachmentSavePromises[attachment.id] = saveAttachmentInner(attachment);
  attachmentSavePromises[attachment.id]
    .then(
      () => delete attachmentSavePromises[attachment.id],
      () => delete attachmentSavePromises[attachment.id]
    );

  return attachmentSavePromises[attachment.id];
}

/**
 * Attempts to download and save the given attachement
 * @param {Eris.Attachment} attachment
 * @param {Number} [tries=0]
 * @returns {Promise<void>}
 */
function saveAttachmentInner(attachment, tries = 0) {
  return new Promise((resolve, reject) => {
    if (tries > 3) {
      console.error("Attachment download failed after 3 tries:", attachment);
      reject("Attachment download failed after 3 tries");
      return;
    }

    const filepath = getPath(attachment.id);
    const writeStream = fs.createWriteStream(filepath);

    https.get(attachment.url, (res) => {
      res.pipe(writeStream);
      writeStream.on("finish", () => {
        writeStream.end();
        resolve();
      });
    }).on("error", () => {
      fs.unlink(filepath, () => {});
      console.error("Error downloading attachment, retrying");
      resolve(saveAttachmentInner(attachment, tries++));
    });
  });
}

/**
 * Attempts to download and save all attachments in the given message
 * @param {Eris.Message} msg
 * @returns {Promise<void|void[]>}
 */
function saveAttachmentsInMessage(msg) {
  if (! msg.attachments || msg.attachments.length === 0) return Promise.resolve();
  return Promise.all(msg.attachments.map(saveAttachment));
}

/**
 * Returns the self-hosted URL to the given attachment ID
 * @param {String} attachmentId
 * @param {String} [desiredName=null] Custom name for the attachment as a hint for the browser
 * @returns {Promise<String>}
 */
function getUrl(attachmentId, desiredName = null) {
  if (desiredName == null) desiredName = "file.bin";
  return getUtils().getSelfUrl(`attachments/${attachmentId}/${desiredName}`);
}

/**
 * Converts an attachment to a message file
 * @param {Eris.Attachment} attachment
 * @returns {Promise<Eris.MessageFile>}
 */
async function attachmentToFile(attachment) {
  await saveAttachment(attachment);
  const data = await readFile(getPath(attachment.id));
  return {file: data, name: attachment.filename};
}

module.exports = {
  getPath,
  saveAttachment,
  saveAttachmentsInMessage,
  getUrl,
  attachmentToFile
};
