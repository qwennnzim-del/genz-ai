import { Buffer } from 'buffer';

// Kita tidak lagi menggunakan Google untuk gambar, tapi Hugging Face
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
// Model gratis terbaik saat ini: Stable Diffusion XL Base 1.0
const MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"; 

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    console.log("--- START GENERATE IMAGE (Hugging Face SDXL) ---");
    console.log("Prompt:", prompt);

    if (!HF_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY belum disetting di Environment Variable Vercel.");
    }

    // Panggil Hugging Face Inference API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            // Parameter opsional agar gambar lebih bagus
            negative_prompt: "blurry, low quality, bad anatomy, ugly, pixelated",
            num_inference_steps: 25, 
            guidance_scale: 7.5
          } 
        }),
      }
    );

    if (!response.ok) {
        const errText = await response.text();
        console.error("HF Error:", errText);
        
        if (errText.includes("loading")) {
            throw new Error("Model sedang loading (Cold Start). Coba 20 detik lagi.");
        }
        throw new Error(`Hugging Face Error: ${response.statusText}`);
    }

    // Hugging Face mengembalikan Blob (Binary Image)
    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    // Fix: Ensure Buffer is available by importing it
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert ke Base64 agar bisa ditampilkan di Frontend
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    console.log("--- SUCCESS: Image generated (SDXL) ---");
    res.status(200).json({ image: base64Image });

  } catch (error: any) {
    console.error('--- ERROR GENERATE IMAGE ---', error);
    
    let userMessage = "Gagal membuat gambar.";
    const errorMsg = error.message || '';

    if (errorMsg.includes('loading')) {
      userMessage = "Model sedang 'pemanasan'. Silakan coba kirim ulang dalam 30 detik.";
    } else if (errorMsg.includes('HUGGINGFACE_API_KEY')) {
      userMessage = "API Key Hugging Face belum dipasang di server.";
    }

    res.status(500).json({ error: userMessage, details: errorMsg });
  }
}