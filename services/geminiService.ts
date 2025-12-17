import { GoogleGenAI } from "@google/genai";

// Helper to convert file to base64 for Gemini
const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeOriginalImage = async (originalFile: File): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const imagePart = await fileToPart(originalFile);

  const prompt = `
    Analyze this image and provide a detailed visual description.
    
    Rules:
    - Write in a descriptive, neutral tone.
    - Do NOT use command form (imperative).
    - Focus on the main subjects, setting, lighting, and key details.
    - Start directly with the description.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, { text: prompt }]
      }
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Error analyzing original image:", error);
    throw new Error("Failed to analyze original image.");
  }
};

export const generateEditionInstructions = async (originalFile: File, editionFile: File, editionIndex: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const originalPart = await fileToPart(originalFile);
  const editionPart = await fileToPart(editionFile);

  const prompt = `
    You are an expert image editor creating instructions for an AI.
    Compare the Original Image and the Edition Image.

    Your task is to describe ONLY the modifications made to the Original to create the Edition.

    STRICT RULES:
    - Tone: Imperative (Command) ONLY. Use verbs like "Add", "Remove", "Replace", "Change", "Translate".
    - FOCUS ON THE CHANGE: Describe ONLY what is different. Do not describe the original image or parts that remained the same.
    - NO META TALK: Do NOT write "I added...", "The image shows...", "The difference is...", or "In this edition...".
    - NO UPPERCASE: Do not write instructions in UPPERCASE.
    - NO BULLETS: Provide the instructions as a concise, fluid paragraph or a set of direct commands.
    - DETAIL: Be specific about text content, fonts, colors, styles, and precise positions.

    Example of Good Output:
    "Change the background wall color from white to light peach. Add line art illustrations of coffee items scattered across the wall, with the text 'Coffee Time' in a script font in the center, and 'Espresso' in the top right."
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
            originalPart, 
            { text: "This is the Original Image." },
            editionPart,
            { text: "This is the Edition Image. Identify the modifications." },
            { text: prompt }
        ]
      }
    });

    return response.text || "No instructions generated.";
  } catch (error) {
    console.error(`Error analyzing edition ${editionIndex}:`, error);
    return "Failed to generate instructions for this edition.";
  }
};