const WebSocket = require('ws');

const wss = new WebSocket.Server({
  host: '0.0.0.0',   // 🔥 IMPORTANT
  port: 3000,
});

let clients = [];

wss.on('connection', (ws) => {
  console.log("📱 Device connected");

  clients.push(ws);

  ws.on('message', (message) => {
    const msg = message.toString();
    console.log("📩 Received:", msg);

    // broadcast to others
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    console.log("❌ Device disconnected");
  });
});

console.log("✅ Server running on ws://0.0.0.0:3000");