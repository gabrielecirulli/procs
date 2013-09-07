var fs       = require("fs")
    UglifyJS = require("uglify-js"),
    path     = require("path"),
    mime     = require('mime');

exports.middleware = function (options) {
  // One entry per file, with mtime
  var cache = buildCache();

  // Always build on the first run
  build();

  function endsWith(string, suffix) {
    return string.indexOf(suffix, string.lenfth - suffix.length) !== -1;
  }

  function buildCache() {
    var files = fs.readdirSync(options.src);
    var cache = {};
    files.forEach(function (file) {
      var filePath = path.join(options.src, file);
      var stat = fs.statSync(filePath);
      var mtime = stat.mtime;
      cache[filePath] = mtime.getTime();
    });
    return cache;
  }

  // Return true if changed, false if not
  function cacheChanged(old, latest) {
    var oldKeys = Object.keys(old);
    var latestKeys = Object.keys(latest);
    var changed = false;

    if (oldKeys.length !== latestKeys.length) changed = true;

    oldKeys.forEach(function (key) {
      if (latestKeys.indexOf(key) === -1) changed = true;
      if (old[key] !== latest[key]) changed = true;
    });

    return changed;
  }

  function build() {
    var files = fs.readdirSync(options.src).map(function (file) { return path.join(options.src, file) });
    var minified = UglifyJS.minify(files);
    fs.writeFileSync(options.dest, minified.code);
  }

  return function (req, res, next) {
    var requestFile = req.url;
    var fileMime = mime.lookup(requestFile);

    if (fileMime === "application/javascript" && endsWith(options.dest, requestFile)) {
      // Check and compile
      if (fs.existsSync(options.dest)) {
        var newCache = buildCache();
        if (cacheChanged(cache, newCache)) {
          cache = newCache;
          build();
        } else {
        }
      } else {
        build();
      }
    }

    next();
  }
}
