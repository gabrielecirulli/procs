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

  // Box2D manager
  function BoxManager() {
    // Canvas
    this.canvas = document.getElementById("view");
    this.ctx = this.canvas.getContext("2d");

    // World setup
    this.scale = 30;
    this.boundaryThreshold = 1000;

    this.world = new b2World(new b2Vec2(0, 9.81), false); // World with vertical gravity to -10 and sleep not allowed

    this.fixtureDefinition = new b2FixtureDef;
    this.bodyDefinition = new b2BodyDef;

    // Set up and refresh canvas size (also draws walls)
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();

    // Debug draw
    var debugDraw = new b2DebugDraw;
    debugDraw.SetSprite(this.ctx);
    debugDraw.SetDrawScale(20);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(2.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);

    // Run
    this.update = this.update.bind(this);
    requestAnimFrame(this.update);
  }

  BoxManager.prototype.update = function () {
    this.world.Step(1 / 30, 10, 10); // Framerate, velocity iterations, position iterations
    this.world.DrawDebugData();

    var body = this.world.GetBodyList();
    while (body) {
      var position = body.GetPosition();
      if (position.x > (this.canvas.width + this.boundaryThreshold) / this.scale
          || position.x < -this.boundaryThreshold
          || position.y > (this.canvas.height + this.boundaryThreshold) / this.scale
          || position.y < -this.boundaryThreshold) {
        this.world.DestroyBody(body);
      }
      body = body.GetNext();
    }

    requestAnimFrame(this.update);
  };

  BoxManager.prototype.resize = function () {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;

    this.buildWalls();
  };

  BoxManager.prototype.add = function () {
    this.bodyDefinition.type = b2_dynamicBody;
    this.fixtureDefinition.shape = new b2CircleShape(20 / this.scale);
    this.bodyDefinition.position.x = (this.canvas.width / 2 + Math.random()) / this.scale;
    this.bodyDefinition.position.y = this.canvas.height / 2 / this.scale;
    this.world.CreateBody(this.bodyDefinition).CreateFixture(this.fixtureDefinition);
  };

  BoxManager.prototype.addWall = function (x, y, width, height) {
    this.fixtureDefinition.density = 1.0;
    this.fixtureDefinition.friction = 0.5;
    this.fixtureDefinition.restitution = 0.2;

    this.bodyDefinition.type = b2_staticBody;

    this.bodyDefinition.position.x = x;
    this.bodyDefinition.position.y = y;

    var shape = this.wallShape(width, height);
    // this.fixtureDefinition.shape = new b2PolygonShape;
    // this.fixtureDefinition.shape.SetAsBox(width, height);

    var body = this.world.CreateBody(this.bodyDefinition);
    body.CreateFixture2(shape);

    return body;
  };

  BoxManager.prototype.wallShape = function (width, height) {
    var shape = new b2PolygonShape;
    shape.SetAsBox(width, height);
    return shape;
  };

  BoxManager.prototype.buildWalls = function () {
    var wallThickness = 400 / 2;

    var bottomWallPosition = new b2Vec2(this.canvas.width / 2 / this.scale, (this.canvas.height + wallThickness) / this.scale);
    var bottomWallSize = new b2Vec2(this.canvas.width / 2 / this.scale, wallThickness / this.scale);

    var rightWallPosition = new b2Vec2((this.canvas.width + wallThickness) / this.scale, (this.canvas.height / 2) / this.scale);
    var rightWallSize = new b2Vec2(wallThickness / this.scale, this.canvas.height / 2 / this.scale);

    var leftWallPosition = new b2Vec2((-wallThickness) / this.scale, (this.canvas.height / 2) / this.scale);
    var leftWallSize = new b2Vec2(wallThickness / this.scale, this.canvas.height / 2 / this.scale);

    if (!this.walls) {
      this.walls = {};

      this.walls.bottom = this.addWall(bottomWallPosition.x, bottomWallPosition.y, bottomWallSize.x, bottomWallSize.y);
      this.walls.right = this.addWall(rightWallPosition.x, rightWallPosition.y, rightWallSize.x, rightWallSize.y);
      this.walls.left = this.addWall(leftWallPosition.x, leftWallPosition.y, leftWallSize.x, leftWallSize.y);
    } else {
      this.walls.bottom.SetPosition(bottomWallPosition);
      this.walls.bottom.DestroyFixture(this.walls.bottom.GetFixtureList());
      this.walls.bottom.CreateFixture2(this.wallShape(bottomWallSize.x, bottomWallSize.y));

      this.walls.right.SetPosition(rightWallPosition);
      this.walls.right.DestroyFixture(this.walls.right.GetFixtureList());
      this.walls.right.CreateFixture2(this.wallShape(rightWallSize.x, rightWallSize.y));

      this.walls.left.SetPosition(leftWallPosition);
      this.walls.left.DestroyFixture(this.walls.left.GetFixtureList());
      this.walls.left.CreateFixture2(this.wallShape(leftWallSize.x, leftWallSize.y));
    }
  };

  manager = new BoxManager;











  // Procs view functions
  procs.view.add = manager.add.bind(manager);
});
