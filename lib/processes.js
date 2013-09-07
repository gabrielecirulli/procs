var child = require("child_process");

function retrieve(fn) {
  child.exec("ps ax -o pid -o rss -o comm", function (err, stdout, stderr) {
    var stats = [];

    stdout.trim().split("\n").slice(1).forEach(function (line) {
      var match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);

      if (match) {
        stats.push({
          pid: +match[1],
          mem: +match[2] * 1024, // KiB
          name: match[3]
        });
      }
    });

    fn(stats);
  });
}

exports.retrieve = retrieve;
