document.addEventListener("DOMContentLoaded", () => {
var imageDiv = document.getElementById("image")

function wsPing(ws) {

    ws.send(JSON.stringify({
        event: "ping"
    }))

}

const ws = new FriendlyWebSocket();

ws.on("open", () => {

    ws.send(JSON.stringify({
        "event": "startScreenshot"
    }))

    setInterval(wsPing, 750, (ws))

})

ws.on("close", () => {
    clearInterval(wsPing)
})

ws.on("message", message => {

    var msg = JSON.parse(message);
    var img = msg["output"];

    if (msg["output"] === "pong") return;

    if(img) {
    imageDiv.style.height = msg["height"]
    imageDiv.style.width = msg["width"]
    imageDiv.src = `data:image/png;base64,${img}`
    };

})

});