#!/usr/bin/env node
import path from 'node:path'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import express from 'express'
import compression from 'compression'

const execFileAsync = promisify(execFile);

const [, , rootArg, portArg] = process.argv

if (!rootArg || !portArg) {
  console.error('Usage: serve-compressed.mjs PATH PORT')
  process.exit(1)
}

const root = path.resolve(rootArg)

if (!/^\d+$/.test(String(portArg))) {
  console.error('ERROR: PORT must be a number')
  process.exit(1)
}
const port = Number(portArg)

const logPath = path.resolve(process.cwd(), 'tmp', 'preview.log')

function ensureLogDir() {
  fs.mkdirSync(path.dirname(logPath), { recursive: true })
}

function logLine(msg) {
  ensureLogDir()
  const ts = new Date().toISOString()
  fs.appendFileSync(logPath, `[${ts}] ${msg}\n`, 'utf8')
}

function safeHeaders(req) {
  const h = { ...req.headers }
  // Don’t leak secrets
  if (h['x-preview-token']) h['x-preview-token'] = '[redacted]'
  if (h['authorization']) h['authorization'] = '[redacted]'
  if (h['cookie']) h['cookie'] = '[redacted]'
  return h
}

const HOST = '127.0.0.1'
const app = express()

const shouldCompress = (req, res) => {
  return !req.headers['x-no-compression']
}

function writeCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Preview-Token");
  res.setHeader("Access-Control-Max-Age", "86400");
}

app.use((req, res, next) => {
  writeCors(res);
  if (req.method === "OPTIONS") {
    // CORS preflight
    res.status(204).end();
    return;
  }
  next();
});

function send(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function requirePreviewToken(req, res, next) {
  logLine(`REQ ${req.method} ${req.originalUrl} ip=${req.ip} headers=${JSON.stringify(safeHeaders(req))}`)

  if (req.method === 'OPTIONS') return next()

  const expected = process.env.PREVIEW_TOKEN
  if (!expected) {
    logLine('ERROR PREVIEW_TOKEN is not set')
    return send(res, 500, 'ERROR: PREVIEW_TOKEN is not set\n')
  }

  const got = req.header('x-preview-token')
  if (!got || got !== expected) {
    logLine('AUTH Unauthorized (token missing or mismatch)')
    return send(res, 401, 'Unauthorized\n')
  }

  logLine('AUTH OK')
  return next()
}

function runRelease(res) {
  const cmd = 'source ~/.bashrc && ./scripts/release.sh'
  logLine(`RELEASE start cmd="${cmd}"`)

  const child = spawn('bash', ['-lc', cmd], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })

  child.stdout.on('data', (d) => {
    const s = d.toString()
    logLine(`RELEASE stdout: ${s.replace(/\n$/, '')}`)
  })

  child.stderr.on('data', (d) => {
    const s = d.toString()
    logLine(`RELEASE stderr: ${s.replace(/\n$/, '')}`)
  })

  child.on('error', (e) => {
    logLine(`RELEASE spawn error: ${String(e && e.stack ? e.stack : e)}`)
    send(res, 500, `FAILED (spawn error)\n\n${String(e)}\n`)
  })

  child.on('close', (code, signal) => {
    logLine(`RELEASE done code=${code} signal=${signal || ''}`)
    if (code === 0) return send(res, 200, 'OK\n')
    send(res, 500, `FAILED (exit ${code})\n`)
  })
}

/**
 * Non-static endpoint(s)
 * Auth: x-preview-token must match PREVIEW_TOKEN
 */
app.use('/__release', requirePreviewToken)

app.options('/__release', (req, res) => {
  send(res, 204, '')
})

app.post('/__release', (req, res) => {
  runRelease(res)
})

app.all('/__release', (req, res) => {
  send(res, 405, 'Method not allowed\n')
})

app.get("/env.js", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const { stdout, stderr } = await execFileAsync(
      "bash",
      ["-ic", 'source ~/.bashrc >/dev/null 2>&1; printf "%s" "$HOST_TUNNEL_WEB"'],
      {
        encoding: "utf8",
        timeout: 3000,
        maxBuffer: 1024 * 1024,
      },
    );
    const value = String(stdout ?? "").trim();
    if (stderr && String(stderr).trim()) {
      logLine(`env.js bash stderr: ${String(stderr).trim()}`);
    }
    res.type("application/javascript").send(
      `window.__COMPONENTS_SERVER__=${JSON.stringify(value)};\n`,
    );
  } catch (e) {
    logLine(`env.js error: ${String(e && e.stack ? e.stack : e)}`);
    res.status(500).type("text/plain").send("ERROR: failed to load env from bash\n");
  }
});

app.use(
  compression({
    threshold: 0, // compress all sizes
    filter: shouldCompress,
  }),
)

app.use(
  express.static(root, {
    etag: true,
    lastModified: true,
    maxAge: 60 * 60 * 1000,
    fallthrough: false,
  }),
)

app.listen(port, HOST, () => {
  logLine(`SERVER start root=${root} host=${HOST} port=${port}`)
  console.log(`Serving ${root} at http://${HOST}:${port}`)
})
