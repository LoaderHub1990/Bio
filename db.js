// Minimal JSON-file "database". Fine for a starter project / small user base.
// Swap this out for real Postgres/SQLite/Mongo when you go to production.
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getUser(discordId) {
    const db = readDB();
    return db.users[discordId] || null;
}

function getUserByUsername(username) {
    const db = readDB();
    return Object.values(db.users).find(
        (u) => u.customUsername && u.customUsername.toLowerCase() === username.toLowerCase()
    ) || null;
}

function upsertUser(discordId, patch) {
    const db = readDB();
    const existing = db.users[discordId] || {};
    db.users[discordId] = { ...existing, ...patch, discordId };
    writeDB(db);
    return db.users[discordId];
}

module.exports = { getUser, getUserByUsername, upsertUser };
