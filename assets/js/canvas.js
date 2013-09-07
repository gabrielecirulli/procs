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
  var b2_dynamicBody = Box2D.Dynamics.b2Body.b2_dynamicBody;
  var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
  var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

  // World setup
  var SCALE = 30;

  var world = new b2World(new b2Vec2(0, 9.81), true); // World with vertical gravity to -10 and sleep allowed
  var fixtureDefinition = new b2FixtureDef;
  fixtureDefinition.density = 1.0;
  fixtureDefinition.friction = 0.5;
  fixtureDefinition.restitution = 0.2;

  var bodyDefinition = new b2BodyDef;
  bodyDefinition.type = b2_staticBody;

  bodyDefinition.position.x = canvas.width / 2 / SCALE;
  bodyDefinition.position.y = canvas.height / SCALE;

  fixtureDefinition.shape = new b2PolygonShape;
  fixtureDefinition.shape.SetAsBox((canvas.width / SCALE) / 2, (10 / SCALE) / 2);
  world.CreateBody(bodyDefinition).CreateFixture(fixtureDefinition);

  // Debug draw
  var debugDraw = new b2DebugDraw;
  debugDraw.SetSprite(ctx);
  debugDraw.SetDrawScale(SCALE);
  debugDraw.SetFillAlpha(0.3);
  debugDraw.SetLineThickness(2.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);

  function update() {
    world.Step(1 / 25, 10, 10); // Framerate, velocity iterations, position iterations
    world.DrawDebugData();

    requestAnimFrame(update);
  }

  requestAnimFrame(update);

  // Procs view functions
  procs.view.add = function () {
    bodyDefinition.type = b2_dynamicBody;
    fixtureDefinition.shape = new b2CircleShape(20 / SCALE);
    bodyDefinition.position.x = (canvas.width / 2 + Math.random()) / SCALE;
    bodyDefinition.position.y = canvas.height / 2 / SCALE;
    world.CreateBody(bodyDefinition).CreateFixture(fixtureDefinition);
  }
});
