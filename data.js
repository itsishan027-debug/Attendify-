const fs = require("fs");

let data = {
  users: {},
  settings: {
    reminderEnabled: true,
    reminderHour: 21, 
    customSlots: [
      { roleId: null, msg: null },
      { roleId: null, msg: null },
      { roleId: null, msg: null }
    ]
  }
};

if (fs.existsSync("./data.json")) {
  try {
    const fileData = fs.readFileSync("./data.json");
    data = JSON.parse(fileData);
  } catch (e) {
    console.log("Creating new data file...");
  }
}

function saveData() {
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

function ensureUser(id) {
  if (!data.users[id]) {
    data.users[id] = { total: 0, sessions: [], start: null, lastSeen: null };
  }
}

module.exports = { data, saveData, ensureUser };
