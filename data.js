const fs = require("fs");
const FILE = "./attendance.json";

let data = {
  users: {},
  settings: {
    serverId: null,
    channelId: null,
    reminderEnabled: true,
    reminderHour: 20
  }
};

function loadData() {
  if (fs.existsSync(FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(FILE));
      data = {
        users: raw.users || {},
        settings: raw.settings || data.settings
      };
    } catch {
      console.log("⚠ JSON corrupted. Resetting.");
      saveData();
    }
  } else {
    saveData();
  }
}

function saveData() {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function ensureUser(id) {
  if (!data.users[id]) {
    data.users[id] = {
      total: 0,
      startTime: null,   // ✅ changed
      sessions: [],
      lastSeen: null
    };
  }
}

module.exports = {
  data,
  loadData,
  saveData,
  ensureUser
};