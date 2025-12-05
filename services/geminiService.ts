
import { Attachment, Language } from '../types';

export const streamGeminiResponse = async function* (
  modelId: string,
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  attachment?: Attachment,
  language: Language = 'id' // Default ID
) {
  try {
    // --- SANITIZER LOGIC ---
    let processedHistory = history;

    if (modelId !== 'gemini-2.5-flash') {
      processedHistory = history.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({
          text: part.text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim()
        }))
      }));
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId,
        prompt,
        history: processedHistory,
        attachment,
        language // Kirim preferensi bahasa
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; 

      for (const line of lines) {
        if (line.trim() !== "") {
          try {
            const parsed = JSON.parse(line);
            yield {
              text: () => parsed.text || "",
              candidates: parsed.groundingMetadata ? [{ groundingMetadata: parsed.groundingMetadata }] : []
            };
          } catch (e) {
            console.warn("Error parsing chunk", e);
          }
        }
      }
    }

  } catch (error) {
    console.error("Error calling Chat API:", error);
    throw error;
  }
};

// --- FUNGSI BARU UNTUK HUGGING FACE IMAGE ---
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.details || response.statusText);
    }

    const data = await response.json();
    if (data.image) {
      return data.image; // Base64 string
    } else {
      throw new Error("No image data returned");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
