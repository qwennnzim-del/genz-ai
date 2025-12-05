import { Buffer } from 'buffer';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    console.log("--- START GENERATE IMAGE (Pollinations Flux) ---");
    console.log("Prompt:", prompt);

    // Menggunakan Pollinations.ai (Gratis, Unlimited, No Key)
    // Model: Flux (Default pollinations model is robust)
    // seed: random agar hasil beda setiap request
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true`;

    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(`Pollinations Error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    console.log("--- SUCCESS: Image generated (Flux) ---");
    res.status(200).json({ image: base64Image });

  } catch (error: any) {
    console.error('--- ERROR GENERATE IMAGE ---', error);
    res.status(500).json({ error: "Gagal membuat gambar.", details: error.message });
  }
}