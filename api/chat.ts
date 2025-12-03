
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { modelId, prompt, history, attachment } = req.body;

    let tools = undefined;
    let systemInstruction = "Anda adalah GenzAI. Jawablah dengan sopan, cerdas, dan menggunakan format Markdown yang rapi. Selalu sertakan identitas 'GenzAI' jika diminta atau relevan.";

    if (modelId === 'gemini-2.5-flash') {
      tools = [{ googleSearch: {} }];
      systemInstruction += `
      \n[SYSTEM NOTICE: CHAIN OF THOUGHT & VISION ENABLED]
      Anda adalah "Genz 2.5 Pro". Anda dapat melihat gambar/file jika user melampirkannya.
      
      ATURAN WAJIB:
      1. JANGAN langsung menjawab pertanyaan user.
      2. MULAI setiap respon Anda dengan blok <thinking> ... </thinking>.
      3. Analisis input (teks maupun gambar) secara mendalam di dalam blok thinking.
      4. Jika pertanyaan membutuhkan informasi terkini, gunakan Google Search.
      `;
      
      // --- ARTIFICIAL DELAY UNTUK VISUALISASI ---
      // Menunggu 4 detik agar animasi "Searching" & Logo Toggle di frontend terlihat oleh user
      await new Promise(resolve => setTimeout(resolve, 4000));
    }

    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction,
      tools: tools,
    });

    // Konstruksi Pesan Saat Ini
    let userParts: any[] = [{ text: prompt }];

    // Jika ada attachment (gambar/file), tambahkan ke parts pesan
    if (attachment && attachment.data && attachment.mimeType) {
      userParts.push({
        inlineData: {
          data: attachment.data,
          mimeType: attachment.mimeType
        }
      });
    }
    
    const chat = model.startChat({
      history: history || [], 
      generationConfig: {
        temperature: 0.7,
      },
    });

    // Kirim pesan (Text + Image Part)
    const result = await chat.sendMessageStream(userParts);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      
      const data = JSON.stringify({
        text: chunkText,
        groundingMetadata: groundingMetadata
      });
      
      res.write(data + "\n");
    }

    res.end();

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
