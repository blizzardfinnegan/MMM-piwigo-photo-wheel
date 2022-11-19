const path = require("path");
const fs = require("fs").promises;
const os = require("os");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const request = require("superagent");
const mockConfig = require("./superagent-mock-config");
const mockConfigEmpty = require("./superagent-mock-config-empty");

const { getImages, syncImages, exportedForTesting } = require("./../loader");
const { deleteImages, fetchServerImages, downloadImage } = exportedForTesting;

describe("Loader", function () {
  describe("getImages", function () {
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

  describe("deleteImages", function () {
    it("should delete local-only files", async () => {
      // Given
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), "foo-"));
      await fs.appendFile(dir + "/local.txt", "I exist only locally");
      await fs.appendFile(dir + "/both.txt", "I exist locally and remotely");
      const localFileNames = ["local.txt"];
      const serverFileNames = ["server.txt", "both.txt"];
      // When
      await deleteImages(dir, localFileNames, serverFileNames);
      // Then
      const content = await fs.readdir(dir, { withFileTypes: true });
      expect(content.map((x) => x.name)).not.to.include("local.txt");
      expect(content.map((x) => x.name)).to.include("both.txt");
    });

    it("should throw on deletion error", async () => {
      // Given
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), "foo-"));
      await fs.appendFile(dir + "/else.txt", "hello");
      const lfn = ["local.txt"];
      const sfn = ["server.txt"];
      // When Then
      return expect(deleteImages(dir, lfn, sfn))
        .to.be.eventually.rejectedWith(
          "ENOENT: no such file or directory, unlink '" + dir + "/local.txt'"
        )
        .and.be.an.instanceOf(Error);
    });
  });

  describe("fetchServerImages", function () {
    before(() => {
      this.superagentMock = require("superagent-mock")(request, mockConfig);
    });

    after(() => {
      this.superagentMock.unset();
    });

    it("should fetch and parse correctly", async () => {
      // Given
      const config = {
        username: "tester",
        password: "secret",
        url: "https://piwigo.example",
        size: "large",
      };
      // When
      const images = await fetchServerImages(request.agent(), config);
      // Then
      expect(images).to.have.length(1);
      expect(images[0].file).to.eql("demo-image.jpg");
    });

    it("should throw on connection error", async () => {
      // Given
      const config = {
        username: "tester",
        password: "secret",
        url: "https://piwigo.wrong",
        size: "large",
      };
      // When Then
      return expect(fetchServerImages(request.agent(), config))
        .to.be.eventually.rejectedWith("ENOTFOUND piwigo.wrong")
        .and.be.an.instanceOf(Error);
    });
  });

  describe("fetchServerImages - Empty", function () {
    before(() => {
      this.superagentMock = require("superagent-mock")(
        request,
        mockConfigEmpty
      );
    });

    after(() => {
      this.superagentMock.unset();
    });

    it("should throw on empty list", async () => {
      // Given
      const config = {
        username: "tester",
        password: "secret",
        url: "https://piwigo.example",
        size: "large",
      };
      // When Then
      return expect(fetchServerImages(request.agent(), config))
        .to.be.eventually.rejectedWith(
          "There were no images found! Check connection details or upload images"
        )
        .and.be.an.instanceOf(Error);
    });
  });

  describe("syncImages", function () {
    xit("should connect (manual integration-test)", async () => {
      const config = {
        username: "<real-user>",
        password: "<real-password>",
        url: "<real-url>",
        size: "large",
      };
      await syncImages(path.join("/", __dirname, "../images"), config);
    }).timeout(30000);
  });
});
