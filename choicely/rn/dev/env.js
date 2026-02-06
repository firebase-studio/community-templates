const fs = require('node:fs')
const path = require('node:path')

const dotenv = require('dotenv')

function parseIfExists(p) {
  try {
    return fs.existsSync(p) ? dotenv.parse(fs.readFileSync(p, 'utf8')) : {}
  } catch {
    return {}
  }
}

/**
 * Load default.env and .env into process.env without overwriting existing
 * shell-provided variables. Idempotent.
 */
function loadEnv(root = process.cwd()) {
  const defaults = parseIfExists(path.join(root, 'default.env'))
  const local = parseIfExists(path.join(root, '.env'))
  const merged = {...defaults, ...local}

  for (const [k, v] of Object.entries(merged)) {
    if (process.env[k] === undefined && typeof v === 'string') process.env[k] = v
  }
}

module.exports = {loadEnv}
