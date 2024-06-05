module.exports = {
  "presets": ["@babel/preset-env"],
  "plugins": [ "babel-plugin-transform-import-meta", ["@babel/plugin-syntax-import-attributes",  { "deprecatedAssertSyntax": true }]]
}