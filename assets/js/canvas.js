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

    this.world = new b2World(new b2Vec2(0, 9.81), false); // World with vertical gravity to -10 and sleep not allowed

    // var fixtureDefinition = new b2FixtureDef;
    // var bodyDefinition = new b2BodyDef;

    // Set up and refresh canvas size (also draws walls)
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();

    // Distance in any direction after which an object is placed back at the top
    this.boundaryThreshold = Math.max(this.canvas.width, this.canvas.height) * 3;

    this.toDelete = [];

    // Debug draw
    var debugDraw = new b2DebugDraw;
    debugDraw.SetSprite(this.ctx);
    debugDraw.SetDrawScale(this.scale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(2.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);

    // Run
    this.update = this.update.bind(this);
    requestAnimFrame(this.update);
  }

  BoxManager.prototype.update = function () {
    // Apply a force to bodies that need to be deleted
    this.toDelete.forEach(function (body) {
      body.ApplyForce(new b2Vec2(0, -1), body.GetWorldCenter());
    });

    // Perform simulation step and draw
    this.world.Step(1 / 30, 10, 10); // Framerate, velocity iterations, position iterations
    this.world.DrawDebugData();

    var body = this.world.GetBodyList();
    while (body) {
      var position = body.GetPosition();
      if (position.x > (this.canvas.width + this.boundaryThreshold) / this.scale
          || position.x < -this.boundaryThreshold / this.scale
          || position.y > (this.canvas.height + this.boundaryThreshold) / this.scale
          || position.y < -this.boundaryThreshold / this.scale) {
        var bodyIndex = this.toDelete.indexOf(body);
        if (bodyIndex !== -1) {
          console.log("Delete");
          this.world.DestroyBody(body);
          this.toDelete.splice(bodyIndex, 1);
        } else {
          console.log("Reset");
          body.SetPosition(new b2Vec2(this.canvas.width / 2 / this.scale, 0));
        }
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

  BoxManager.prototype.defaultFixture = function () {
    var fixtureDefinition = new b2FixtureDef;
    fixtureDefinition.density = 1.0;
    fixtureDefinition.friction = 0.1;
    fixtureDefinition.restitution = 0.6;

    return fixtureDefinition;
  };

  BoxManager.prototype.wallFixture = function () {
    return this.defaultFixture();
  };

  BoxManager.prototype.ballFixture = function () {
    return this.defaultFixture();
  };

  BoxManager.prototype.addBall = function (radius) {
    var bodyDefinition = new b2BodyDef;

    bodyDefinition.type = b2_dynamicBody;
    bodyDefinition.position.x = ((this.canvas.width / 2) + (this.canvas.width / 1.2) * (Math.random() -.5)) / this.scale;
    bodyDefinition.position.y = (-(this.canvas.height * 2) + (this.canvas.height * 2) * (Math.random() -.5)) / this.scale;

    var fixtureDefinition = this.ballFixture();
    fixtureDefinition.shape = new b2CircleShape(radius / this.scale);

    var body = this.world.CreateBody(bodyDefinition);
    body.CreateFixture(fixtureDefinition);

    return body;
  };

  BoxManager.prototype.adjustBallRadius = function (ball, radius) {
    ball.DestroyFixture(ball.GetFixtureList());
    var fixtureDefinition = this.ballFixture();
    fixtureDefinition.shape = new b2CircleShape(radius / this.scale);

    ball.CreateFixture(fixtureDefinition);
  };

  BoxManager.prototype.removeBall = function (ball) {
    var self = this;
    this.toDelete.push(ball);
  };

  BoxManager.prototype.applyForce = function (ball, strength) {
    // ball.ApplyImpulse(new b2Vec2((Math.random() - .5) * strength, (-(strength) / 2) * Math.random()), ball.GetWorldCenter());
  };

  BoxManager.prototype.wallShape = function (width, height) {
    var shape = new b2PolygonShape;
    shape.SetAsBox(width, height);

    return shape;
  };

  BoxManager.prototype.addWall = function (x, y, width, height) {
    var bodyDefinition = new b2BodyDef;

    bodyDefinition.type = b2_staticBody;
    bodyDefinition.position.x = x;
    bodyDefinition.position.y = y;

    var fixtureDefinition = this.wallFixture();
    fixtureDefinition.shape = this.wallShape(width, height);

    var body = this.world.CreateBody(bodyDefinition);
    body.CreateFixture(fixtureDefinition);

    return body;
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
      var bottomFixture = this.wallFixture();
      bottomFixture.shape = this.wallShape(bottomWallSize.x, bottomWallSize.y);
      this.walls.bottom.CreateFixture(bottomFixture);

      this.walls.right.SetPosition(rightWallPosition);
      this.walls.right.DestroyFixture(this.walls.right.GetFixtureList());
      var rightFixture = this.wallFixture();
      rightFixture.shape = this.wallShape(rightWallSize.x, rightWallSize.y);
      this.walls.right.CreateFixture(rightFixture);

      this.walls.left.SetPosition(leftWallPosition);
      this.walls.left.DestroyFixture(this.walls.left.GetFixtureList());
      var leftFixture = this.wallFixture();
      leftFixture.shape = this.wallShape(leftWallSize.x, leftWallSize.y);
      this.walls.left.CreateFixture(leftFixture);
    }
  };

  manager = new BoxManager;

  // Procs view functions
  procs.view.addBall = manager.addBall.bind(manager);
  procs.view.adjustBallRadius = manager.adjustBallRadius.bind(manager);
  procs.view.removeBall = manager.removeBall.bind(manager);
  procs.view.applyForce = manager.applyForce.bind(manager);
});
