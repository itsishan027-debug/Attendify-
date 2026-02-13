const fs = require("fs");

let data = {
  users: {},
  settings: {
    reminderEnabled: true,
    reminderHour: 21,
    serverId: "1434084048719843420",
    channelId: "1471509183215173664"
  }
};

if (fs.existsSync("./data.json")) {
  data = JSON.parse(fs.readFileSync("./data.json"));
}

function saveData() {
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

function ensureUser(id) {
  if (!data.users[id]) {
    data.users[id] = {
      total: 0,
      sessions: [],
      startTime: null,
      lastSeen: null
    };
  }
}

module.exports = { data, saveData, ensureUser };