export default async function handler(req, res) {
  const ip = req.query.ip || "5.252.103.70";
  const port = req.query.port || "8888";
  const url = `https://tsarvar.com/en/servers/gta-samp/${ip}:${port}`;
  
  try {
    const response = await fetch(url);
    const html = await response.text();

    const playersMatch = html.match(/(\d+)\s*\/\s*(\d+)\s*Players/);
    const titleMatch = html.match(/<title>(.*?) - GTA SAMP server/);

    const players = playersMatch ? parseInt(playersMatch[1]) : 0;
    const maxPlayers = playersMatch ? parseInt(playersMatch[2]) : 0;
    const hostname = titleMatch ? titleMatch[1].trim() : "";

    res.status(200).json({
      online: players > 0,
      players,
      max_players: maxPlayers,
      hostname,
      last_updated: new Date().toISOString()
    });
  } catch (e) {
    res.status(200).json({
      online: false,
      players: 0,
      max_players: 0,
      hostname: "",
      last_updated: new Date().toISOString()
    });
  }
}
