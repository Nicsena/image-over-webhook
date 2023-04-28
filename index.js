require("dotenv").config();

const http = require('http');
const ws = require('ws')
const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3000

const { screenshotScreen } = require("./src/screenshot")


// ----------- EXPRESS SERVER -----------

app.use(express.static('public'));
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'public'));
app.enable("trust proxy");

app.get("/", (req, res) => {
    res.status(200).render(`${__dirname}/views/index`)
})






// ----------- WEBSOCKET SERVER -------------


async function doScreenshot() {

  var img = await screenshotScreen();
  var clients = socketsList
  
  clients.forEach(async (c) => {
    if(!c.send) return;

    if(c.send) {
        c.send(JSON.stringify({
          width: 1280,
          height: 720,
          output: Buffer.from(img).toString("base64")
        }));
    };

  });

};

// we need to create our own http server so express and ws can share it.
const server = http.createServer(app);
// pass the created server to ws
const wss = new ws.Server({ server });

// List of currently connected lists
let sockets = new Set()
// List of clients that want screenshots to be sent
let socketsList = new Set();


wss.on("listening", () => {
    console.log(`WebSocket Server has started to listen on port ${PORT}`);
    setInterval(doScreenshot, 750)
})

// based on https://www.npmjs.com/package/ws#simple-server
wss.on('connection', function connection(ws, req) {

  const ip = req.socket.remoteAddress

  ws.on('message', async (message, isBinary) => {
    const result = isBinary ? message : message.toString() 
    const data = JSON.parse(result)
    
    console.log(`Client ${ip} - Received: ${result}`);
    
    if(data["event"] === "ping") {
      return ws.send(JSON.stringify( [ { "output": "pong" } ] ) ) 
    };

    if(data["event"] === "stopScreenshot") {
        socketsList.delete(ws);
    };

    if(data["event"] === "startScreenshot") {
        socketsList.add(ws);
    };
    
    
});
 
ws.on('close', function () {

console.log(`Websocket - A client has disconnected! - client IP Address ${ip}`)
    
});

ws.broadcast = function broadcast(msg) {
  sockets.forEach(function each(client) {
      client.send(msg);
   });
};
  
console.log(`Websocket - A client has connected! - client IP Address: ${ip}`)

});



server.listen(PORT, () => {
   console.log(`Web Server has started on port ${PORT}`);
});