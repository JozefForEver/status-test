// api/status.js

export default async function handler(req, res) {
  const { ip, port } = req.query;
  const server = `${ip}:${port}`;
  const url = `https://tsarvar.com/api/v1/server/samp/${server}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json({
      online: data?.online || false,
      players: data?.players || 0,
      max_players: data?.max_players || 0,
      hostname: data?.hostname || "",
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      online: false,
      players: 0,
      max_players: 0,
      hostname: "",
      error: "Failed to fetch server status",
      last_updated: new Date().toISOString()
    });
  }
}
