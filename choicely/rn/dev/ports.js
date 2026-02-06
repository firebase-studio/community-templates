const {loadEnv} = require('./env')

function assertPortRange(n, min = 1, max = 65535) {
  return Number.isInteger(n) && n >= min && n <= max
}

function requireEnv(name) {
  const value = process.env[name]
  if (value === undefined || value === '') {
    throw new Error(`${name} is not set. Define it in \`.env\`, \`default.env\`, or export it.`)
  }
  return value
}

function parsePort(name, {min = 1, max = 65535} = {}) {
  const raw = requireEnv(name)
  const num = Number(raw)
  if (!assertPortRange(num, min, max)) {
    throw new Error(`${name} invalid: "${raw}". Must be an integer between ${min} and ${max}.`)
  }
  return num
}

function parseOptionalPort(name, {min = 1, max = 65535} = {}) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return null

  const num = Number(raw)
  if (!assertPortRange(num, min, max)) {
    throw new Error(`${name} invalid: "${raw}". Must be an integer between ${min} and ${max}.`)
  }
  return num
}

function getPorts(rootDir) {
  loadEnv(rootDir)

  const metroPort = parseOptionalPort('RCT_METRO_PORT') // number | null
  const webPort = parsePort('WEB_PORT')                 // number (required)

  return {metroPort, webPort}
}

module.exports = {getPorts}
