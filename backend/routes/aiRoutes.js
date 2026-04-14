// backend/routes/aiRoutes.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch"; // install node-fetch if Node < 18
import cors from "cors";

dotenv.config();
const router = express.Router();

// allow JSON bodies for this router
router.use(express.json());

// CORS middleware (simple, configurable)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
router.use(cors({ origin: ALLOWED_ORIGIN }));

// CONFIG - from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3";

/* Helper: fetch with timeout using AbortController */
async function fetchWithTimeout(url, opts = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw new Error(`Fetch error for ${url}: ${err.message || err}`);
  }
}

/* Safely parse response as JSON when possible; otherwise return text */
async function safeParseResponse(resp) {
  const text = await resp.text().catch(() => "");
  try {
    return { ok: resp.ok, status: resp.status, data: text ? JSON.parse(text) : null, raw: text };
  } catch {
    return { ok: resp.ok, status: resp.status, data: null, raw: text };
  }
}

/* Call Gemini (Generative Language API) */
async function callGemini(question) {
  if (!GEMINI_API_KEY) throw new Error("No GEMINI_API_KEY configured on server.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent`;

  const payload = { contents: [{ parts: [{ text: question }] }] };

  const resp = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(payload),
    },
    20000
  );

  const parsed = await safeParseResponse(resp);

  if (!parsed.ok) {
    const message =
      parsed.data?.error?.message ??
      parsed.data?.message ??
      parsed.raw ??
      `status ${parsed.status}`;
    throw new Error(`Gemini API error: ${message}`);
  }

  const candidateText =
    parsed.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    parsed.data?.candidates?.[0]?.content ??
    parsed.data?.candidates?.[0]?.output ??
    null;

  if (candidateText) return String(candidateText);
  return parsed.raw || JSON.stringify(parsed.data || {});
}

/* Call local Ollama instance */
async function callOllama(question) {
  const url = `${OLLAMA_URL.replace(/\/+$/, "")}/api/generate`;
  const body = { model: OLLAMA_MODEL, prompt: question, stream: false };

  const resp = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    15000
  );

  const parsed = await safeParseResponse(resp);

  if (!parsed.ok) {
    const msg = parsed.data ?? parsed.raw ?? `status ${parsed.status}`;
    throw new Error(`Ollama error: ${JSON.stringify(msg)}`);
  }

  if (parsed.data?.response) return parsed.data.response;
  if (parsed.raw) return parsed.raw;
  return JSON.stringify(parsed.data || {});
}

/* Quick probe if Ollama is reachable */
async function isOllamaAvailable() {
  try {
    const healthUrl = `${OLLAMA_URL.replace(/\/+$/, "")}/api/health`;
    const resp = await fetchWithTimeout(healthUrl, { method: "GET" }, 3000).catch(() => null);
    if (resp && resp.ok) return true;
    const rootResp = await fetchWithTimeout(OLLAMA_URL, { method: "GET" }, 3000).catch(() => null);
    return !!rootResp;
  } catch {
    return false;
  }
}

/* Router-level health check */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    gemini_configured: !!GEMINI_API_KEY,
    ollama_url: OLLAMA_URL,
  });
});

/* POST /api/ai/ask */
router.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question || !String(question).trim()) {
    return res.status(400).json({ error: "Question is required." });
  }

  // 1) Try Gemini if configured
  if (GEMINI_API_KEY) {
    try {
      const answer = await callGemini(question);
      return res.json({ answer });
    } catch (err) {
      console.warn("Gemini call failed:", err.message || err);
      // fall through to fallback
    }
  } else {
    console.warn("GEMINI_API_KEY not configured; skipping Gemini.");
  }

  // 2) Try Ollama fallback (if reachable)
  try {
    const avail = await isOllamaAvailable();
    if (avail) {
      try {
        const answer = await callOllama(question);
        return res.json({ answer });
      } catch (ollErr) {
        console.warn("Ollama call failed:", ollErr.message || ollErr);
      }
    } else {
      console.warn("Ollama not reachable at", OLLAMA_URL);
    }
  } catch (probeErr) {
    console.warn("Ollama probe error:", probeErr.message || probeErr);
  }

  // 3) All failed
  return res.status(502).json({
    error: "AI backend failed. Configure GEMINI_API_KEY or run Ollama locally.",
    guidance: [
      "Check server logs for detailed errors (server must not expose API key).",
      "Ensure GEMINI_API_KEY is valid and set in environment variables.",
      `If using Ollama fallback, ensure it's reachable at ${OLLAMA_URL}.`,
    ],
  });
});

export default router;
