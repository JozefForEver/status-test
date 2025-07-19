import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { ip, port } = req.query;

  if (!ip || !port) {
    return res.status(400).json({ error: 'Missing ip or port parameter' });
  }

  try {
    const response = await fetch(`https://api.gamemonitors.com/samp/${ip}:${port}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch server data', details: err.message });
  }
}
