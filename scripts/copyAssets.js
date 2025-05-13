// filepath: scripts/copyAssets.js
const fs = require("fs");
const path = require("path");

function copyFolderSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isFile()) {
      fs.copyFileSync(fromPath, toPath);
    } else {
      copyFolderSync(fromPath, toPath);
    }
  });
}

// Sao chép views
copyFolderSync("src/views", "build/views");

// Sao chép public
copyFolderSync("public", "build/public");