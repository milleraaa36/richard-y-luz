export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, imageBase64, day, isVideo } = req.body;

  // Contraseña se compara con variable de entorno (nunca visible en el código)
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Firma para subida segura
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId  = isVideo ? 'richard_luz/video_boda' : `richard_luz/dia_${day}`;

  const crypto = await import('crypto');
  const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(str).digest('hex');

  const formData = new URLSearchParams();
  formData.append('file', imageBase64);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('public_id', publicId);
  formData.append('signature', signature);

  const resourceType = isVideo ? 'video' : 'image';
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  );

  const data = await uploadRes.json();
  if (data.secure_url) {
    return res.status(200).json({ url: data.secure_url });
  } else {
    return res.status(500).json({ error: 'Error subiendo archivo', detail: data });
  }
}
