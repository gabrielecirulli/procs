var socket = io.connect();

socket.on("processes", function (processes) {
  console.log(processes.list[0]);
});
