// Nathan Altice
// Updated: 4/28/19
// Tilemaps
// Demonstrates tilemap loading, creation, and collision

// TASKMASTER
"use strict";

var Play = function(game) {
	// define constants
	this.SCALE = 0.5;
	this.MAX_X_VELOCITY = 500;	// measured in pixels/second
	this.MAX_Y_VELOCITY = 2500;
	this.ACCELERATION = 1200;
	this.DRAG = 600;			// note that DRAG < ACCELERATION (to create sliding)
	this.GRAVITY = 2600;
	this.JUMP_SPEED = -700;	// negative y-values jump up
	this.MAX_JUMPS = 3;
};
Play.prototype = {
	preload: function() {
		game.load.path = 'assets/';
		// load tilemap data (key, url, data, format)
		// load tilemap spritesheet (key, url, frameWidth, frameHeight)
		// load player atlas
		game.load.atlas('atlas', 'kenny_sheet.png', 'kenny_sheet.json');
	},
	create: function() {
		// spin up physics
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.gravity.y = this.GRAVITY;
		// TILE_BIAS adds a pixel "buffer" around your tiles to avoid collision tunneling
		// see https://thoughts.amphibian.com/2016/02/dont-fall-through-tile-bias-in-phaser.html
		game.physics.arcade.TILE_BIAS = 32;

		// set bg color
		game.stage.setBackgroundColor('#87CEEB');

		// create new Tilemap object - when using Tiled, you only need to pass the key

		// add an image to the map to be used as a tileset (tileset, key)
		// the tileset name is specified w/in the .json file (or in Tiled)
		// a single map may use multiple tilesets

		// set ALL tiles to collide *except* those passed in the array

		// create new TilemapLayer object 
		// A Tilemap Layer is a set of map data combined with a tileset
		
		// set the world size to match the size of the Tilemap layer

		// setup player
		// set up our player sprite
		this.player = this.add.sprite(game.width/2, game.height/2, 'atlas', 'side');
		this.player.anchor.set(0.5);
		this.player.scale.setTo(this.SCALE);
		// set up player physics
		game.physics.enable(this.player, Phaser.Physics.ARCADE);
		this.player.body.collideWorldBounds = true;
		// cap the player's max velocity (x, y)
		// make sure you don't set your jump velocity higher than max y velocity,
		// otherwise you'll never exceed that threshold
		this.player.body.maxVelocity.x = this.MAX_X_VELOCITY;
		this.player.body.maxVelocity.y = this.MAX_Y_VELOCITY;
		// add drag to slow the physics body while not accelerating
		this.player.body.drag.setTo(this.DRAG, 0);
		// set up player animations
		// .add('key', [frames], frameRate, loop)
		// .generateFrameNames('prefix', start, stop, 'suffix', zeroPad) -> returns array
		// this handles atlas names in format: walk0001 - walk0011
		this.player.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 1, 11, '', 4), 30, true);
		this.player.animations.add('idle', ['front'], 15, false);
		this.player.animations.add('jump', ['jump'], 15, false);
		// make camera follow player
		game.camera.follow(this.player, 0, 0.1, 0.1);

		// init debug toggle
		this.debug = false;
	},
	update: function() {
		// collision checks

	    // check keyboard input
		if(this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			this.player.body.acceleration.x = -this.ACCELERATION;
			this.player.scale.x = -this.SCALE; 	// flip sprite
			this.player.animations.play('walk');
		} else if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			this.player.body.acceleration.x = this.ACCELERATION;
			this.player.scale.x = this.SCALE; 	// re-orient sprite
			this.player.animations.play('walk');
		} else {
			// set acceleration to 0 (so DRAG will take over)
			this.player.body.acceleration.x = 0;
			this.player.animations.play('idle');		
		}

		// check if player is grounded
	    this.isGrounded = this.player.body.blocked.down;
	    // if so, we have jumps to spare
	    // change this.jumps to create double, triple, etc. jumps 🤾‍♀️
	    if(this.isGrounded) {
	    	this.jumps = this.MAX_JUMPS;
	    	this.jumping = false;
	    } else {
	    	this.player.animations.play('jump');
	    }
	    // allow steady velocity change up to a certain key down duration
	    if(this.jumps > 0 && this.input.keyboard.downDuration(Phaser.Keyboard.UP, 150)) {
	        this.player.body.velocity.y = this.JUMP_SPEED;
	        this.jumping = true;
	    } 
	    // finally, letting go of the UP key subtracts a jump
	    if(this.jumping && this.input.keyboard.upDuration(Phaser.Keyboard.UP)) {
	    	this.jumps--;
	    	this.jumping = false;
	    }

	    // debug toggle
	    if(this.input.keyboard.justPressed(Phaser.Keyboard.T)) {
	    	this.debug = !this.debug;
	    }
	},
	render: function() {
		if(this.debug) {
			game.debug.bodyInfo(this.player, 32, 32);
			game.debug.body(this.player);
			if(this.mapLayer) {
				this.mapLayer.debug = true;
			}
		} else {
			if(this.mapLayer) {
				this.mapLayer.debug = false;
			}
		}
		game.debug.text('Press \'T\' to toggle debug text', 32, game.height - 17);	
	}
};

// init game and state
var game = new Phaser.Game(900, 700, Phaser.AUTO);
game.state.add('Play', Play);
game.state.start('Play');
