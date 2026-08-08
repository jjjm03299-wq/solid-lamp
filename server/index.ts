/**
 * MIDNIGHT VAULT theme — server is instrument-dark and quiet (see ideas.md).
 * Express implementation of the PINFORGE API defined in openapi.yaml.
 * Also serves the built React app when NODE_ENV=production.
 */
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import {
  TOTAL_COMBINATIONS,
  generatePin,
  verifyPin,
  type PinRecord,
} from "../client/src/lib/pin.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Map<string, PinRecord & { attemptsUsed: number }>();

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  /* ---------- Health ---------- */
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  /* ---------- OpenAPI spec ---------- */
  const specPath = path.resolve(__dirname, "..", "openapi.yaml");
  app.get("/api/openapi", (_req, res) => {
    res.sendFile(specPath, (err) => {
      if (err) res.status(500).json({ error: "OpenAPI spec not found" });
    });
  });

  /* ---------- Mint a PIN ---------- */
  app.post("/api/pins", (req, res) => {
    if (req.body && isObject(req.body) && typeof req.body.length === "number") {
      if (req.body.length !== 4) {
        res.status(400).json({ error: "length must be exactly 4" });
        return;
      }
    }
    const record = generatePin();
    store.set(record.id, { ...record, attemptsUsed: 0 });
    res.status(201).json(record);
  });

  /* ---------- Credential status ---------- */
  app.get("/api/pins/:id", (req, res) => {
    const record = store.get(req.params.id);
    if (!record) {
      res.status(404).json({ error: "Unknown credential id" });
      return;
    }
    res.json({
      id: record.id,
      live: record.destroyedAt === undefined,
      createdAt: record.createdAt,
      destroyedAt: record.destroyedAt ?? null,
      attemptsUsed: record.attemptsUsed,
      combinations: TOTAL_COMBINATIONS,
    });
  });

  /* ---------- Verify an attempt ---------- */
  app.post("/api/pins/:id/verify", (req, res) => {
    const record = store.get(req.params.id);
    if (!record) {
      res.status(404).json({ error: "Unknown credential id" });
      return;
    }
    if (!isObject(req.body) || typeof req.body.attempt !== "string") {
      res.status(400).json({ error: "attempt must be a 4-digit string" });
      return;
    }
    const attempt = String(req.body.attempt);
    if (!/^\d{4}$/.test(attempt)) {
      res.status(400).json({ error: "attempt must be exactly 4 digits" });
      return;
    }
    record.attemptsUsed += 1;
    const { result } = verifyPin(record, attempt);
    if (result && result.valid && !record.destroyedAt) {
      record.destroyedAt = new Date().toISOString();
    }
    res.json({
      valid: result?.valid ?? false,
      consumed: record.destroyedAt !== undefined,
      attemptsUsed: record.attemptsUsed,
    });
  });

  /* ---------- SPA static hosting (production) ---------- */
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`PINFORGE API running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
