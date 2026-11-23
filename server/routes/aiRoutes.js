import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import healthGuidance from "../data/healthGuidance.js";

const router = express.Router();

// Find relevant health information using the user's question.
const findRelevantGuidance = (message) => {
  const question = message.toLowerCase();

  return Object.entries(healthGuidance)
    .filter(([, condition]) =>
      condition.localTerms.some((term) =>
        question.includes(term.toLowerCase()),
      ),
    )
    .slice(0, 2)
    .map(([, condition]) => ({
      condition: condition.name,
      commonSymptoms: condition.commonSymptoms,
      redFlags: condition.redFlags,
      homeCare: condition.homeCare,
      otcMedicineInformation: condition.otcMedicineInformation,
    }));
};

// Send the original question and relevant guidance to Cloudflare AI.
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, image } = req.body || {};

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid health question (maximum 3000 characters).",
      });
    }

    if (image) {
      return res.status(400).json({
        success: false,
        message:
          "Image analysis is not available yet. Please describe your symptoms in text.",
      });
    }

    const workerUrl = process.env.CLOUDFLARE_AI_URL;
    const workerSecret = process.env.AI_WORKER_SECRET;

    if (!workerUrl || !workerSecret) {
      console.error("Cloudflare AI environment variables are missing.");

      return res.status(500).json({
        success: false,
        message: "AI service configuration is incomplete.",
      });
    }

    const userQuestion = message.trim();
    const relevantGuidance = findRelevantGuidance(userQuestion);

    console.log(
      "Sending original question and health guidance to Cloudflare AI...",
    );

    const startTime = Date.now();

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerSecret}`,
      },
      body: JSON.stringify({
        message: userQuestion,
        guidance: relevantGuidance,
      }),
      signal: AbortSignal.timeout(120000),
    });

    const responseText = await response.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error(
        "Cloudflare returned invalid JSON:",
        responseText.slice(0, 500),
      );

      return res.status(502).json({
        success: false,
        message: "AI service returned an invalid response.",
      });
    }

    console.log(`Cloudflare AI responded in ${Date.now() - startTime} ms`);

    if (!response.ok || !result.success || !result.answer) {
      console.error("Cloudflare AI request failed:", {
        status: response.status,
        message: result.message,
      });

      return res.status(502).json({
        success: false,
        message: result.message || "AI service is temporarily unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      reply: result.answer,
      guidanceMatched: relevantGuidance.map((item) => item.condition),
    });
  } catch (error) {
    console.error("AAYUSHMAN AI Assistant Error:", error);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "AI response is taking too long. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "AI service is temporarily unavailable. Please try again.",
    });
  }
});

export default router;
