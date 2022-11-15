Module.register("MMM-piwigo-photo-wheel", {
  defaults: {
    updateInterval: 60 * 60 * 1000,
    switchInterval: 10 * 1000,
    maxWidth: "250px",
    maxHeight: "333px",
    piwigoBaseUrl: "",
    piwigoUsername: "",
    piwigoPassword: "",
    piwigoSize: "large",
    loadingText: "Loading...",
  },

  start: function () {
    this.imageFileNames = [];
    this.imageIndex = 0;
    setInterval(this.updateImages, this.config.updateInterval);
    setInterval(() => {
      this.imageIndex = (this.imageIndex + 1) % this.imageFileNames.length;
      this.updateDom();
    }, this.config.switchInterval);
    this.updateImages();
  },

  socketNotificationReceived: function (notification, payload) {
    this.imageFileNames = payload;
    this.imageIndex = 0;
    this.updateDom();
  },

  getDom: function () {
    const photoDiv = document.createElement("div");
    photoDiv.className = "piwigo-photo";
    photoDiv.style.width = this.config.maxWidth;
    photoDiv.style.height = this.config.maxHeight;

    if (this.imageFileNames && this.imageFileNames.length) {
      const curImage = this.imageFileNames[this.imageIndex];
      photoDiv.textContent = "";
      photoDiv.style.backgroundImage =
        "url('" + this.file("images/" + curImage) + "')";
    } else {
      photoDiv.textContent = this.config.loadingText;
    }

    return photoDiv;
  },

  getStyles: function () {
    return [this.file("css/style.css")];
  },

  updateImages: function () {
    this.sendSocketNotification("UPDATE", {
      username: this.config.piwigoUsername,
      password: this.config.piwigoPassword,
      url: this.config.piwigoBaseUrl,
      size: this.config.piwigoSize,
    });
  },
});
