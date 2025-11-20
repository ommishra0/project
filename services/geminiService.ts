import { GoogleGenAI } from "@google/genai";

// Helper to convert File to Base64 string (stripping the data URL prefix)
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}; 

export const analyzeImageWithGemini = async (
  file: File, 
  prompt: string
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not defined in the environment.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Convert image to compatible format
    const base64Data = await fileToGenerativePart(file);

    // Prepare the request
    // Using gemini-2.5-flash as it is efficient for multimodal tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: prompt || "Describe this image in detail."
          }
        ]
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response text received from Gemini.");
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred while analyzing the image.");
  }
};