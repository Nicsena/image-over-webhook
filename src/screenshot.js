const screenshot = require('screenshot-desktop')
const path = require("path");

async function screenshotScreen() {

    var screen = screenshot({ format: "png"})
    return screen;

};

module.exports = {
    screenshotScreen: screenshotScreen
};