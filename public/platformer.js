// # Quintus platformer example
//
// [Run the example](../quintus/examples/platformer/index.html)
// WARNING: this game must be run from a non-file:// url
// as it loads a level json file.
//
// This is the example from the website homepage, it consists
// a simple, non-animated platformer with some enemies and a 
// target for the player.
window.addEventListener("load",function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus()
  .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
  // Maximize this game to whatever the size of the browser is
  .setup({ maximize: true })
  // And turn on default input controls and touch input (for UI)
  .controls().touch()

//Sett ing gravity
Q.gravityX = 0;
Q.gravityY = 980;

// ## Player Sprite
// The very basic player sprite, this is just a normal sprite
// using the player sprite sheet with default controls added to it.
Q.Sprite.extend("Player",{

  // the init constructor is called on creation
  init: function(p) {

    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sheet: "ninjared",  // Setting a sprite sheet sets sprite width and height
      x: 800,           // You can also set additional properties that can
      y: 768             // be overridden on object creation
    });

    // Add in pre-made components to get up and running quickly
    // The `2d` component adds in default 2d collision detection
    // and kinetics (velocity, gravity)
    // The `platformerControls` makes the player controllable by the
    // default input actions (left, right to move,  up or action to jump)
    // It also checks to make sure the player is on a horizontal surface before
    // letting them jump.
    this.add('2d, platformerControls');

    // Write event handlers to respond hook into behaviors.
    // hit.sprite is called everytime the player collides with a sprite
    this.on("hit.sprite",function(collision) {

      // Check the collision, if it's the Tower, you win!
      if(collision.obj.isA("Tower")) {
        Q.stageScene("endGame",1, { label: "You Won! <3!" }); 
        this.destroy();
      }
      if(collision.obj.isA("ParkourLoveSpike")){
        Q.stageScene("endGame",1, { label: "You Died! ^.^" });
        this.destroy();
      }
      if(collision.obj.isA("UpFlipper")){
        Q.gravityX = 0;
        Q.gravityY = -1000;
        UpFlipper.destroy();
      }
      if(collision.obj.isA("DownFlipper")){
        Q.gravityX = 0;
        Q.gravityY = 1000;
      }
    });

  }

});

// ## Tower Sprite
// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
Q.Sprite.extend("Tower", {
  init: function(p) {
    this._super(p, { sheet: 'loveheart' });
  }
});

// ## Enemy Sprite
// Create the Enemy class to add in some baddies
Q.Sprite.extend("ParkourLoveSpike",{
  init: function(p) {
    this._super(p, { sheet: 'parkourlovespike'});

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    // this.add('2d');

    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
        Q.stageScene("endGame",1, { label: "You Died! ^.^" }); 
        collision.obj.destroy();
      }
    });

    // If the enemy gets hit on the top, destroy it
    // and give the user a "hop"
    // this.on("bump.top",function(collision) {
    //   if(collision.obj.isA("Player")) { 
    //     this.destroy();
    //     collision.obj.p.vy = -300;
    //   }
    // });
  }
});

Q.Sprite.extend("UpFlipper",{
  init: function(p) {
    this._super(p, {sheet: 'flipperup'});

    // this.add('2d');
    this.on("bump.left,bump.right,bump.top,bump.bottom",function(collision){
      if(collision.obj.isA("Player")){
        Q.gravityX = 0;
        Q.gravityY = -1000;
      }
    })
  }
})

Q.Sprite.extend("DownFlipper",{
  init: function(p) {
    this._super(p, {sheet: 'flipperdown'});
    // this.add('2d');
    this.on("bump.left,bump.right,bump.top,bump.bottom",function(collision){
      if(collision.obj.isA("Player")){
        Q.gravityX = 0;
        Q.gravityY = 1000;
      }
    })
  }
})

// ## Level1 scene
// Create a new scene called level 1
Q.scene("level1",function(stage) {

  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "hex.png", speedX: 0.5, speedY: 0.5 }));

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({dataAsset: 'level.json',sheet:'tiles' }));


  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player());

  // Give the stage a moveable viewport and tell it
  // to follow the player.` 
  stage.add("viewport").follow(player);

  for(var i=0;i<19;i++){
    stage.insert(new Q.ParkourLoveSpike({x: 48+i*32, y: 752}));
  }

  stage.insert(new Q.UpFlipper({ x: 490, y: 700}));

  stage.insert(new Q.DownFlipper({ x: 375, y: 600}));

  for(var i=0;i<19;i++){
    stage.insert(new Q.ParkourLoveSpike({x: 48+i*32, y: 350}));
  }

  stage.insert(new Q.UpFlipper({ x: 656, y: 500}));

  stage.insert(new Q.DownFlipper({x:723, y:48}));

  stage.insert(new Q.ParkourLoveSpike({x:720,y:80}));

  stage.insert(new Q.UpFlipper({x: 478, y: 320}))

  stage.insert(new Q.DownFlipper({x: 384,y: 80}))

  stage.insert(new Q.UpFlipper({x: 256,y: 320}))

  // Finally add in the tower goal
  stage.insert(new Q.Tower({ x: 48, y: 48 }));


  for(var i=0;i<17;i++){
    stage.insert(new Q.ParkourLoveSpike({x:175+i*32,y:48}));
  }
});

// To display a game over / game won popup box, 
// create a endGame scene that takes in a `label` option
// to control the displayed message.
Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(255,255,255,0.75)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#ffaaaa",
                                                  label: "Play Again" }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: stage.options.label }));
  // When the button is clicked, clear all the stages
  // and restart the game.
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
  });

  // Expand the container to visibily fit it's contents
  // (with a padding of 20 pixels)
  container.fit(20);
});

// ## Asset Loading and Game Launch
// Q.load can be called at any time to load additional assets
// assets that are already loaded will be skipped
// The callback will be triggered when everything is loaded
Q.load("sprites.png, sprites.json, level.json, tiles.png, hex.png, ParkourLoveNinja.png, ParkourLoveNinja.json, Spikes.png, Spikes.json, flippers.png, flippers.json, ParkourLoveSpike.png, ParkourLoveSpike.json, ParkourLoveHeart.png, ParkourLoveHeart.json, ParkourLoveNinjaRed.png, ParkourLoveNinjaRed.json", function() {

  // Sprites sheets can be created manually
  Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });

  Q.compileSheets("ParkourLoveNinja.png","ParkourLoveNinja.json");

  Q.compileSheets("Spikes.png","Spikes.json")

  Q.compileSheets("ParkourLoveSpike.png","ParkourLoveSpike.json")

  Q.compileSheets("flippers.png","flippers.json")

  Q.compileSheets("ParkourLoveHeart.png","ParkourLoveHeart.json")

  Q.compileSheets("ParkourLoveNinjaRed.png","ParkourLoveNinjaRed.json")

  // Or from a .json asset that defines sprite locations
  Q.compileSheets("sprites.png","sprites.json");

  // Finally, call stageScene to run the game
  Q.stageScene("level1");
});

// ## Possible Experimentations:
// 
// The are lots of things to try out here.
// 
// 1. Modify level.json to change the level around and add in some more enemies.
// 2. Add in a second level by creating a level2.json and a level2 scene that gets
//    loaded after level 1 is complete.
// 3. Add in a title screen
// 4. Add in a hud and points for jumping on enemies.
// 5. Add in a `Repeater` behind the TileLayer to create a paralax scrolling effect.

});
