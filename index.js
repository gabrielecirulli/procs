var processes = require("./lib/processes");

processes.retrieve(function (processes) {
  console.log(processes);
});
