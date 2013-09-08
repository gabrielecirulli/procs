document.addEventListener("DOMContentLoaded", function () {
  var procs = window.procs = window.procs || {};

  var processes = {
    // 19294: {
    //   pid: 19294,
    //   mem: 3488, // Bytes
    //   name: "something",
    //   ball: /* Box2D object */
    // }
  };

  // Socket handling
  var socket = io.connect();

  socket.on("processes", function (data) {
    var list = data.list;
    var newPids = Object.keys(list);
    var oldPids = Object.keys(processes);

    var orphans = oldPids.filter(function(pid) { return newPids.indexOf(pid) === -1 });


    newPids.forEach(function (pid) {
      // var orphanIndex = orphans.indexOf[pid];
      // if (orphanIndex !== -1) orphans.pop(orphanIndex);

      if (oldPids.indexOf(pid) === -1) { // If there's a process that wasn't there before
        // Add the new process
        processes[pid] = list[pid];
        // console.log(pid);
        processes[pid].ball = procs.view.addBall(sizeFromMem(processes[pid].mem));
      } else {
        // Check if the memory has changed
        var diff = Math.abs(processes[pid].mem - list[pid].mem);
        if(diff > 50000) {
          // console.log(diff);
          processes[pid].mem = list[pid].mem;
          procs.view.adjustBallRadius(processes[pid].ball, sizeFromMem(processes[pid].mem));
        }
      }
    });

    // console.log(orphans);
    orphans.forEach(function (pid) {
      procs.view.removeBall(processes[pid].ball);
      delete processes[pid];
    });
  });



  // Other functions
  function log10(val) {
    return Math.log(val) / Math.LN10;
  }

  function sizeFromMem(mem) {
    return Math.pow(log10(mem), 3) / 15 + 2;
  }
});

