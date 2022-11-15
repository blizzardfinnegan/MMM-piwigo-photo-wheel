const NodeHelper = require("node_helper");
const path = require("path");
const _ = require("lodash");
const { getImages, downloadImages } = require("./loader");
const Log = require("logger");

module.exports = NodeHelper.create({
  socketNotificationReceived: function (notification, payload) {
    this.syncImages(payload);
  },

  syncImages: function (config) {
    const imagePath = path.join("/", __dirname, "images");
    downloadImages(imagePath, config)
      .then(() => {
        getImages(imagePath).then((images) => {
          shuffledImages = _.shuffle(images);
          this.sendSocketNotification("IMAGES_UPDATED", shuffledImages);
        });
      })
      .catch((err) => {
        Log.error("Could not download images from piwigo! Error was: ");
        Log.error(err);
      });
  },
});
