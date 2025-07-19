export default async function handler(req, res) {
  const ip = req.query.ip;
  const port = req.query.port;

  if (!ip || !port) {
    return res.status(400).json({ error: 'Missing IP or port parameter' });
  }

  const query = Buffer.from([
    0x53, 0x41, 0x4D, 0x50, // "SAMP"
    ...ip.split('.').map(octet => parseInt(octet)),
    parseInt(port) & 0xFF,
    (parseInt(port) >> 8) & 0xFF,
    0x69 // 'i' = info
  ]);

  try {
    const socket = new Promise((resolve, reject) => {
      const dgram = require('dgram');
      const client = dgram.createSocket('udp4');

      client.send(query, 0, query.length, port, ip, err => {
        if (err) {
          client.close();
          reject(err);
        }
      });

      client.on('message', message => {
        const hostnameLength = message[11];
        const hostname = message.slice(12, 12 + hostnameLength).toString();

        const offset = 12 + hostnameLength;
        const players = message[offset + 1];
        const maxPlayers = message[offset + 3];

        client.close();

        resolve({
          online: true,
          players,
          max_players: maxPlayers,
          hostname,
          last_updated: new Date().toISOString()
        });
      });

      client.on('error', err => {
        client.close();
        reject(err);
      });

      setTimeout(() => {
        client.close();
        resolve({ online: false, players: 0, max_players: 0, hostname: "", last_updated: new Date().toISOString() });
      }, 3000);
    });

    const result = await socket;
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ online: false, error: error.message });
  }
}
