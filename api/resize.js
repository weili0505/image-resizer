// api/resize.js
const sharp = require('sharp');
const axios = require('axios');

export default async function handler(req, res) {
  const { url, w = 400, q = 80 } = req.query;

  if (!url) return res.status(400).send('Missing image URL');

  try {
    // 1. Fetch the original image from the Gov API
    const response = await axios({
      url: decodeURIComponent(url),
      responseType: 'arraybuffer',
    });

    // 2. Use Sharp to resize and convert to WebP (faster/smaller than PNG)
    const optimizedBuffer = await sharp(response.data)
      .resize({ width: parseInt(w) })
      .webp({ quality: parseInt(q) })
      .toBuffer();

    // 3. Set headers so the app knows it's an image and caches it
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    
    return res.send(optimizedBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error resizing image');
  }
}