import { GoogleGenAI } from "@google/genai";

export const MODELS = {
  TEXT: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
  IMAGE: "gemini-3.1-flash-image-preview",
  TTS: "gemini-2.5-flash-preview-tts"
};

/**
 * Creates a new GoogleGenAI instance using the current API key.
 * For gemini-3.1-flash-image-preview, it's important to create a new instance 
 * right before the call to ensure it uses the key selected in the dialog.
 */
export const getAI = (providedKey?: string) => {
  const customKey = providedKey || localStorage.getItem('GEMINI_CUSTOM_API_KEY');
  const apiKey = customKey || import.meta.env.VITE_GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

/**
 * Validates the API Key by making a simple metadata request.
 */
export const validateApiKey = async (apiKey: string) => {
  try {
    const genAI = getAI(apiKey);
    const model = (genAI as any).getGenerativeModel({ model: MODELS.TEXT });
    // Try to list the model or do a simple empty prompt - 
    // but the most reliable way without spending tokens is searching for a token count or similar metadata call.
    // However, for simplicity and compatibility with library versions, we'll do a minimal token count check.
    await model.countTokens("test");
    return { valid: true };
  } catch (error: any) {
    console.error("API Key Validation Failed:", error);
    
    // Check if it's a definitive invalid key error
    const isActuallyInvalid = error.message?.includes("API_KEY_INVALID") || error.status === 401;
    
    if (isActuallyInvalid) {
      return { 
        valid: false, 
        message: "API Key Tidak Valid! Pastikan Anda menyalin dengan benar." 
      };
    } else {
      // It might be a valid key but failing due to experimental model issues in Google Cloud
      return {
        valid: "warning",
        message: "Key mungkin valid, tapi model experimental seringkali sibuk atau dibatasi. Anda tetap bisa mencoba menyimpannya."
      };
    }
  }
};

// Keep the static instance for non-image tasks if needed, 
// but getAI() is safer for image generation.
export const ai = getAI();
