export default async function handler(req, res) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const auth      = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

  const [imgRes, vidRes] = await Promise.all([
    fetch(
      'https://api.cloudinary.com/v1_1/' + cloudName + '/resources/image?prefix=richard_luz/dia_&max_results=20&type=upload',
      { headers: { Authorization: 'Basic ' + auth } }
    ),
    fetch(
      'https://api.cloudinary.com/v1_1/' + cloudName + '/resources/video?prefix=richard_luz/video_boda&max_results=1&type=upload',
      { headers: { Authorization: 'Basic ' + auth } }
    )
  ]);

  const imgData = await imgRes.json();
  const vidData = await vidRes.json();

  const photos = {};
  (imgData.resources || []).forEach(function(img) {
    var match = img.public_id.match(/dia_(\d+)$/);
    if (match) photos[match[1]] = img.secure_url;
  });

  const video = (vidData.resources && vidData.resources[0])
    ? vidData.resources[0].secure_url
    : null;

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return res.status(200).json({ photos: photos, video: video });
}
