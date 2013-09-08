var child = require("child_process");

function retrieve(fn) {
  var process = child.exec("ps ax -o pid -o rss -o comm", function (err, stdout, stderr) {
    var stats = {};

    stdout.trim().split("\n").slice(1).forEach(function (line) {
      var match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);

      if (match) {
        var pid = +match[1];
        var mem = +match[2] * 1024; // Bytes
        // if (mem < 1) console.log(match[3] + pid);
        if (pid === process.pid || mem < 1) return;
        stats[pid] = {
          pid: pid,
          mem: mem,
          name: match[3]
        };
      }
    });

    fn(stats);
  });
}

exports.retrieve = retrieve;
