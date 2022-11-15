const fsprom = require("fs").promises;
const path = require("path");
const fs = require("fs");
const superagent = require("superagent");

async function getImages(rootPath) {
  const content = await fsprom.readdir(rootPath, { withFileTypes: true });
  const images = content
    .filter((x) => !x.isDirectory())
    .map((x) => x.name)
    .filter((x) => x !== ".gitkeep");
  return images;
}

async function deleteImages(rootPath, fileNamesLocal, fileNamesServer) {
  const diff = fileNamesLocal.filter((x) => !fileNamesServer.includes(x));
  try {
    for (fileName of diff) {
      //console.log("delete " + path.join("/", rootPath, fileName));
      await fsprom.unlink(path.join("/", rootPath, fileName));
    }
  } catch (err) {
    // do not propagate errors so that failed delete will not lead to failed download
    console.log(err);
  }
}

async function downloadImages(rootPath, config) {
  const localFileNames = await getImages(rootPath);
  const agent = superagent.agent();
  await agent
    .post(config.url + "?format=json&method=pwg.session.login")
    .field("username", config.username)
    .field("password", config.password);
  const data = await agent.get(
    config.url + "?format=json&method=pwg.categories.getImages"
  );
  respText = JSON.parse(data.res.text);
  images = respText.result.images;
  serverFileNames = [];
  for (img of images) {
    const fileName = img.file;
    serverFileNames.push(fileName);
    // Only download if file does not yet exist
    if (!localFileNames.some((x) => x === fileName)) {
      await new Promise((resolve) =>
        agent
          .get(img.derivatives[config.size].url)
          .pipe(fs.createWriteStream(path.join("/", rootPath, fileName)))
          .on("finish", resolve)
      );
    }
  }

  await deleteImages(rootPath, localFileNames, serverFileNames);
}

module.exports = { getImages, downloadImages };
