const session = require("express-session");
const db = require("../config/db");

class MySQLSessionStore extends session.Store {
  get(sessionId, callback) {
    db.execute("SELECT data, expires_at FROM sessions WHERE session_id = ?", [sessionId])
      .then(([rows]) => {
        if (rows.length === 0) {
          callback(null, null);
          return;
        }

        const sessionRow = rows[0];
        if (new Date(sessionRow.expires_at).getTime() <= Date.now()) {
          this.destroy(sessionId, () => callback(null, null));
          return;
        }

        callback(null, JSON.parse(sessionRow.data));
      })
      .catch((err) => callback(err));
  }

  set(sessionId, sessionData, callback) {
    const expiresAt = getExpiry(sessionData);

    db.execute(
      "INSERT INTO sessions (session_id, data, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), expires_at = VALUES(expires_at)",
      [sessionId, JSON.stringify(sessionData), expiresAt]
    )
      .then(() => callback(null))
      .catch((err) => callback(err));
  }

  destroy(sessionId, callback) {
    db.execute("DELETE FROM sessions WHERE session_id = ?", [sessionId])
      .then(() => callback(null))
      .catch((err) => callback(err));
  }

  touch(sessionId, sessionData, callback) {
    const expiresAt = getExpiry(sessionData);

    db.execute("UPDATE sessions SET expires_at = ? WHERE session_id = ?", [expiresAt, sessionId])
      .then(() => callback(null))
      .catch((err) => callback(err));
  }
}

function getExpiry(sessionData) {
  const expires = sessionData.cookie && sessionData.cookie.expires;

  if (expires) {
    return new Date(expires);
  }

  return new Date(Date.now() + 1000 * 60 * 60);
}

module.exports = MySQLSessionStore;
