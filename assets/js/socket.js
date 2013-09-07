document.addEventListener("DOMContentLoaded", function () {
  var procs = window.procs = window.procs || {};

  // Socket handling
  var socket = io.connect();

  socket.on("processes", function (processes) {
    procs.view.add();
    // console.log(processes.list[0]);
  });
});

