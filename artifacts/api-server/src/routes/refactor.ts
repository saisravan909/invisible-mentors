import { Router } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { ai } from "@workspace/integrations-gemini-ai";

const refactorRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SYSTEM_PROMPT = readFileSync(
  resolve(__dirname, "../../../..", "mentor_persona.txt"),
  "utf-8"
);

refactorRouter.post("/refactor", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "Please provide some text to refactor." });
    return;
  }

  const userPrompt = `Here is the text to review:\n\n${text.trim()}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 8192,
    },
  });

  const raw = response.text ?? "";

  const analysisMatch = raw.match(/#+\s*Analysis[\s\S]*?\n([\s\S]*?)(?=#+\s*Refactored Version|$)/i);
  const refactoredMatch = raw.match(/#+\s*Refactored Version[\s\S]*?\n([\s\S]*?)$/i);

  const analysis = analysisMatch ? analysisMatch[1].trim() : "";
  const rewritten = refactoredMatch ? refactoredMatch[1].trim() : raw.trim();

  res.json({ analysis, rewritten, raw });
});

export default refactorRouter;
