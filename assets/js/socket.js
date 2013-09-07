document.addEventListener("DOMContentLoaded", function () {
  // Socket handling
  var socket = io.connect();

  socket.on("processes", function (processes) {
    console.log("LOL");
    // console.log(processes.list[0]);
  });
});

