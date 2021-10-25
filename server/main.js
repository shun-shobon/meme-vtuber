import { WebSocketServer } from "ws";

const memeServer = new WebSocketServer({ port: 5000 });
const clientServer = new WebSocketServer({ port: 5001 });

let connections = [];

memeServer.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = message.toString();

    if (msg.includes("heartbeat")) return;

    for (const connection of connections) {
      connection.send(msg);
    }
  });
});

clientServer.on("connection", (ws) => {
  connections.push(ws);

  ws.on("close", () => {
    connections = connections.filter((connection) => connection !== ws);
  });
});
