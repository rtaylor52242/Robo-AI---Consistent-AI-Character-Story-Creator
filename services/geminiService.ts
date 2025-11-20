import { GoogleGenAI } from "@google/genai";
import { Character, AspectRatio } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
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

interface GenerateImageParams {
  prompt: string;
  selectedCharacters: Character[];
  aspectRatio: AspectRatio;
  customAspectRatio?: string;
  apiKey: string;
}

export const generateImageWithGemini = async ({
  prompt,
  selectedCharacters,
  aspectRatio,
  customAspectRatio,
  apiKey
}: GenerateImageParams): Promise<string> => {
  
  // Initialize client with the user's key (or env key passed in)
  const ai = new GoogleGenAI({ apiKey });

  // 1. Prepare Content Parts (Images first for context, then text)
  const parts: any[] = [];

  // Add selected character references
  for (const char of selectedCharacters) {
    if (char.file) {
      const imagePart = await fileToGenerativePart(char.file);
      parts.push(imagePart);
    }
  }

  // Add the text prompt
  // We explicitly mention the characters in the prompt to ensure consistency
  const characterNames = selectedCharacters.map(c => c.name).join(', ');
  const finalPrompt = `Using the attached character references (${characterNames}), generate an image: ${prompt}. High quality, consistent style.`;
  
  parts.push({ text: finalPrompt });

  // 2. Determine Aspect Ratio
  let ratio = aspectRatio === AspectRatio.CUSTOM ? (customAspectRatio || "1:1") : aspectRatio;
  // Validate ratio against supported values for safety, fallback to 1:1 if invalid
  const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  if (!validRatios.includes(ratio)) {
    console.warn(`Ratio ${ratio} might not be supported. Defaulting to 1:1 for safety.`);
    ratio = "1:1"; 
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana (Standard)
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: ratio,
          // imageSize is not supported in gemini-2.5-flash-image
        }
      },
    });

    // 3. Extract Image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        if (content && content.parts) {
             for (const part of content.parts) {
                 if (part.inlineData && part.inlineData.data) {
                     return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                 }
             }
        }
    }
    
    throw new Error("No image data found in response");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    let detailedMsg = error.message || "Failed to generate image";
    
    if (error.error && typeof error.error === 'object') {
        const { code, message, status } = error.error;
        detailedMsg = message || detailedMsg;
        if (code) detailedMsg += ` (Code: ${code})`;
        if (status) detailedMsg += ` [${status}]`;
    }
    
    throw new Error(detailedMsg);
  }
};