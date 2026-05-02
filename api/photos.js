export default async function handler(req, res) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const r = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?prefix=richard_luz/dia_&max_results=20`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const data = await r.json();

  // También busca video
  const rv = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/video?prefix=richard_luz/video_boda&max_results=1`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const dataV = await rv.json();

  const photos = {};
  (data.resources || []).forEach(img => {
    const match = img.public_id.match(/dia_(\d+)$/);
    if (match) photos[match[1]] = img.secure_url;
  });

  const video = dataV.resources?.[0]?.secure_url || null;

  res.status(200).json({ photos, video });
}
