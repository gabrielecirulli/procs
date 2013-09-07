document.addEventListener("DOMContentLoaded", function () {
  var procs = window.procs = window.procs || {};
  procs.view = {};

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

  // Canvas
  var canvas = document.getElementById("view");
  var ctx = canvas.getContext("2d");

  // Canvas management
  window.addEventListener("resize", resize);

  function resize() {
    // Add b2world resizing here
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }

  resize();

  // Box2D variables
  var b2World = Box2D.Dynamics.b2World;
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
  var b2BodyDef = Box2D.Dynamics.b2BodyDef;
  var b2_staticBody = Box2D.Dynamics.b2Body.b2_staticBody;
  var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

  // World setup
  var SCALE = 30;

  var world = new b2World(new b2Vec2(0, 10), true); // World with vertical gravity to -10 and sleep allowed
  var floorFixture = new b2FixtureDef;
  floorFixture.density = 1.0;
  floorFixture.friction = 0.5;
  floorFixture.restitution = 0.2;

  var floorBody = new b2BodyDef;
  floorBody.type = b2_staticBody;

  floorBody.position.x = canvas.width / 2 / SCALE;
  floorBody.position.y = canvas.height / SCALE;

  floorFixture.shape = new b2PolygonShape;
  floorFixture.shape.SetAsBox((canvas.width / SCALE) / 2, (10 / SCALE) / 2);
  world.CreateBody(floorBody).CreateFixture(floorFixture);

  // Debug draw
  var debugDraw = new b2DebugDraw;
  debugDraw.SetSprite(ctx);
  debugDraw.SetDrawScale(SCALE);
  debugDraw.SetFillAlpha(0.3);
  debugDraw.SetLineThickness(1.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);

  function update() {
    world.Step(1 / 60, 10, 10); // Framerate, velocity iterations, position iterations
    world.DrawDebugData();

    requestAnimFrame(update);
  }

  requestAnimFrame(update);
});
