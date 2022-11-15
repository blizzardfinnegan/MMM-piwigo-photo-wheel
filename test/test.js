const path = require("path");
const fs = require("fs").promises;
const os = require("os");
const chai = require("chai");
const expect = chai.expect;
const request = require("superagent");
const mockConfig = require("./superagent-mock-config");

const { getImages, downloadImages } = require("./../loader");

describe("Loader", function () {
  describe("getImages()", function () {
    it("should return array of file names", async () => {
      // Given
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), "foo-"));
      await fs.appendFile(dir + "/mynewfile1.txt", "Hello content!");
      // When
      const data = await getImages(dir);
      // Then
      expect(data).to.eql(["mynewfile1.txt"]);
    });
    it("should ignore .gitkeep", async () => {
      // Given
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), "foo-"));
      await fs.appendFile(dir + "/mynewfile1.txt", "Hello content!");
      await fs.appendFile(dir + "/.gitkeep", "Hello content!");
      await fs.appendFile(dir + "/.gitbla", "Hello content!");
      // When
      const data = await getImages(dir);
      // Then
      expect(data).to.eql([".gitbla", "mynewfile1.txt"]);
    });
  });
});

describe("Loader", function () {
  describe("downloadImages()", function () {
    it("should connect", async () => {
      const config = {
        username: "tester",
        password: "secret",
        url: "https://piwigo.example",
        size: "large",
      };
      var superagentMock = require("superagent-mock")(request, mockConfig);
      await downloadImages(path.join("/", __dirname, "../images"), config);
      superagentMock.unset();
    }).timeout(30000);
  });
});
