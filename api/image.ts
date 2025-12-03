import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // DEBUG LOG: Pastikan ini muncul di Log Vercel. Jika tidak, berarti kode lama masih berjalan.
    console.log("--- MENGGUNAKAN MODEL IMAGEN 3 (imagen-3.0-generate-001) ---");
    console.log("Prompt:", prompt);

    // Menggunakan model Imagen 3 standar
    const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Log struktur response untuk debugging jika kosong
    console.log("Response Candidates:", JSON.stringify(response.candidates?.[0]?.content?.parts?.length || 0));

    let base64Image = null;

    // Parsing khusus untuk Imagen 3 (biasanya mengembalikan mimeType image/jpeg atau image/png)
    if (response.candidates && response.candidates.length > 0) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData && part.inlineData.data) {
            base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
         }
       }
    }

    if (base64Image) {
      res.status(200).json({ image: base64Image });
    } else {
      console.error("Gagal: Response valid tapi tidak ada data gambar.");
      res.status(500).json({ error: "Model merespons, tetapi tidak ada gambar yang dihasilkan. Coba prompt yang lebih sederhana." });
    }

  } catch (error: any) {
    console.error('SERVER ERROR (Image Gen):', error);
    
    const errorMsg = error.message || '';

    // Error Handling Khusus 429 / Quota
    if (error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota') || errorMsg.includes('limit')) {
      return res.status(429).json({ 
        error: "Kuota Harian Habis. Akun Google AI Free Tier memiliki batas harian untuk Imagen 3. Silakan coba lagi besok." 
      });
    }

    // Error Handling jika Model tidak ditemukan (biasanya salah region atau API Key tidak support)
    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      return res.status(404).json({
        error: "Model Imagen 3 belum tersedia untuk API Key ini. Pastikan Anda menggunakan API Key dari Google AI Studio yang mendukung Imagen."
      });
    }

    res.status(500).json({ error: error.message || "Gagal membuat gambar." });
  }
}