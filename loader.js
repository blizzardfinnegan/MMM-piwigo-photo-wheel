const path = require("path");
const fs = require("fs");
const superagent = require("superagent");

async function getImages(rootPath) {
  const content = await fs.promises.readdir(rootPath, { withFileTypes: true });
  const images = content
    .filter((x) => !x.isDirectory())
    .map((x) => x.name)
    .filter((x) => x !== ".gitkeep");
  return images;
}

async function deleteImages(rootPath, fileNamesLocal, fileNamesServer) {
  const diff = fileNamesLocal.filter((x) => !fileNamesServer.includes(x));
  for (fileName of diff) {
    await fs.promises.unlink(path.join("/", rootPath, fileName));
  }
}

async function fetchServerImages(agent, config) {
  await agent
    .post(config.url + "?format=json&method=pwg.session.login")
    .field("username", config.username)
    .field("password", config.password);
  const data = await agent.get(
    config.url + "?format=json&method=pwg.categories.getImages"
  );
  respText = JSON.parse(data.res.text);
  images = respText.result.images;

  if (images.length === 0) {
    throw Error(
      "There were no images found! Check connection details or upload images."
    );
  }
  return images;
}

async function downloadImage(agent, url, targetPath) {
  await new Promise((resolve) =>
    agent.get(url).pipe(fs.createWriteStream(targetPath)).on("finish", resolve)
  );
}

async function syncImages(rootPath, config) {
  const agent = superagent.agent();
  const images = await fetchServerImages(agent, config);

  const localFileNames = await getImages(rootPath);
  const newImages = images.filter((img) => !localFileNames.includes(img.file));

  for (img of newImages) {
    const url = img.derivatives[config.size].url;
    await downloadImage(agent, url, path.join("/", rootPath, img.file));
  }

  await deleteImages(
    rootPath,
    localFileNames,
    images.map((i) => i.file)
  );
}

const exportedForTesting = { deleteImages, fetchServerImages, downloadImage };
module.exports = { getImages, syncImages, exportedForTesting };
