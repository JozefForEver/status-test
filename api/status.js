import dgram from 'dgram';

export default async function handler(req, res) {
  const ip = req.query.ip;
  const port = parseInt(req.query.port);

  if (!ip || !port) {
    return res.status(400).json({ error: 'Missing IP or port parameter' });
  }

  const query = Buffer.from([
    0x53, 0x41, 0x4D, 0x50, // SAMP
    ...ip.split('.').map(Number),
    port & 0xFF,
    (port >> 8) & 0xFF,
    0x69
  ]);

  const client = dgram.createSocket('udp4');

  const result = await new Promise((resolve, reject) => {
    let timeout;

    client.send(query, 0, query.length, port, ip, err => {
      if (err) return reject(err);

      timeout = setTimeout(() => {
        client.close();
        resolve({
          online: false,
          players: 0,
          max_players: 0,
          hostname: "",
          last_updated: new Date().toISOString()
        });
      }, 4000);
    });

    client.on('message', msg => {
      clearTimeout(timeout);

      const hostnameLength = msg[11];
      const hostname = msg.slice(12, 12 + hostnameLength).toString();
      const offset = 12 + hostnameLength;

      const players = msg[offset + 1];
      const maxPlayers = msg[offset + 3];

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
      clearTimeout(timeout);
      client.close();
      reject(err);
    });
  });

  res.status(200).json(result);
}
