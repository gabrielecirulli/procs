document.addEventListener("DOMContentLoaded", function () {
  // Socket handling
  var socket = io.connect();

  socket.on("processes", function (processes) {
    // console.log(processes.list[0]);
  });

  // Canvas and Box2D
  var requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback, element){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var canvas = document.getElementById("view");
  var ctx = canvas.getContext("2d");

  var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true); // World with vertical gravity to -10 and sleep allowed

  // Other things
  window.addEventListener("resize", resize);

  function resize() {

    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }

  resize();
});

