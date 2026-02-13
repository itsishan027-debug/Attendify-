const fs = require("fs");
const FILE = "./attendance.json";

let data = {};

function loadData() {
  if (fs.existsSync(FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(FILE));
    } catch {
      data = {};
    }
  }
}

function saveData() {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function ensureUser(id) {
  if (!data[id]) {
    data[id] = {
      total: 0,
      start: null,
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
