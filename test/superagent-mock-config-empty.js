const response = require("./response-empty.json");

module.exports = [
  {
    pattern: "https://piwigo.example(.*)",

    fixtures: function (match, params, headers, context) {
      if (match[1] === "?format=json&method=pwg.session.login") {
        return {
          stat: "ok",
          result: true,
        };
      }

      if (match[1] === "?format=json&method=pwg.categories.getImages") {
        return JSON.stringify(response);
      }
    },
    get: function (match, data) {
      return {
        status: 200,
        res: {
          text: data,
        },
      };
    },
    post: function (match, data) {
      return {
        status: 200,
        res: {
          text: data,
        },
      };
    },
  },
];
