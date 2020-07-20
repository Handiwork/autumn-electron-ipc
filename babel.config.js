
module.exports = {
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": [
            "last 2 versions"
          ]
        },
        "useBuiltIns": "usage"
      }
    ],
  ],
  "plugins": [
    // "@babel/plugin-syntax-dynamic-import",
    // "@babel/plugin-proposal-object-rest-spread",
    // ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
  ]
};