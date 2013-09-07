var processes = require("./processes");

function Manager(io) {
  var self = this;
  this.io = io;
  this.cache = null;
  this.connected = 0;
  this.interval = 1000;

  processes.retrieve(function (list) {
    self.cache = list;
  });

  // Connection counting
  this.io.sockets.on("connection", function (socket) {
    self.connected++;

    socket.on("disconnect", function () { self.connected--; });
  });

  setInterval(this.broadcast.bind(this), this.interval);

  this.io.set('log level', 2);
}

Manager.prototype.broadcast = function(first_argument) {
  var self = this;
  if (this.connected > 0) {
    processes.retrieve(function (list) {
      self.cache = list;
      self.io.sockets.emit("processes", { list: self.cache });
    });
  }
};

module.exports = Manager;
