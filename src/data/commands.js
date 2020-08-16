const db = require("../dynodb");

async function getCommand(name) {
	return await db.models.Command.findOne({ _state: 42, name }).lean();
}

module.exports = {
	getCommand,
};
