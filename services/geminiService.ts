
import { GoogleGenAI } from "@google/genai";
import { EditOptions } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateEditedImage = async (
  annotatedImageBase64: string,
  options: EditOptions
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const base64Data = annotatedImageBase64.split(',')[1];

  const masterPrompt = `
    ROLE: Expert Image Editor & Retoucher.
    TASK: Edit the provided image based on RED MARKINGS (arrows, text notes) and user instructions.

    CRITICAL INSTRUCTIONS:
    1. Read red annotations (what to change).
    2. Execute ONLY the indicated changes.
    3. REMOVE ALL RED ANNOTATIONS from final output (clean, natural photo).
    4. PRESERVE EXACTLY the original lighting, perspective, and unmarked areas (Spatial Consistency, Geometric Fidelity).
    5. Do not introduce new objects or change the fundamental composition unless explicitly requested by an annotation.

    USER TEXT INSTRUCTIONS: ${options.additionalPrompt}
  `;

  const numberOfRequests = Math.max(1, Math.min(4, options.imageCount));
  const promises = [];

  for (let i = 0; i < numberOfRequests; i++) {
    const variationPrompt = numberOfRequests > 1 
      ? `${masterPrompt} \n Edit Variation Seed: ${Math.random()}` 
      : masterPrompt;

    promises.push(
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: variationPrompt }
        ],
        config: {
          imageConfig: {
              aspectRatio: '16:9'
          }
        }
      })
    );
  }

  try {
    const responses = await Promise.all(promises);
    const images: string[] = [];

    for (const response of responses) {
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            images.push(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    }

    if (images.length === 0) {
      throw new Error("No image data generated in response.");
    }

    return images;

  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};
