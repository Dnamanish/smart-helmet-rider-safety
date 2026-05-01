const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let clients = [];

wss.on('connection', (ws) => {
  console.log("Device connected");

  clients.push(ws);

  ws.on('message', (message) => {
    console.log("Received:", message.toString());

    // send to all other devices
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    console.log("Device disconnected");
  });
});

console.log("✅ Server running on ws://192.168.1.13:3000");