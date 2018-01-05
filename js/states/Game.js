var RPG = RPG || {};

RPG.GameState = {

  init: function(currentLevel) {    
    //keep track of the current level
    this.currentLevel = currentLevel ? currentLevel : 'map1';

    //constants
    this.PLAYER_SPEED = 90;
    
    //no gravity in a top-down game
    this.game.physics.arcade.gravity.y = 0;    

    //keyboard cursors
    this.cursors = this.game.input.keyboard.createCursorKeys();
  },
  create: function() {   

    this.game.onscreenControls = this.game.plugins.add(Phaser.Plugin.OnscreenControls);
    // console.log(this.game.onscreenControls);

    this.loadLevel();
  },   
  update: function() {
  
    // player can't walk through walls
    this.game.physics.arcade.collide(this.player, this.collisionLayer);
    
    // items collection
    this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
      
    // stop each time
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    
    if(this.cursors.left.isDown || this.player.btnsPressed.left || this.player.btnsPressed.upleft || this.player.btnsPressed.downleft) {
      this.player.body.velocity.x = -this.PLAYER_SPEED;
      this.player.scale.setTo(1, 1);
      
    }
    if(this.cursors.right.isDown || this.player.btnsPressed.right || this.player.btnsPressed.upright || this.player.btnsPressed.downright) {
      this.player.body.velocity.x = this.PLAYER_SPEED;
      this.player.scale.setTo(-1, 1);
      
    }
    if(this.cursors.up.isDown || this.player.btnsPressed.up || this.player.btnsPressed.upleft || this.player.btnsPressed.upright) {
      this.player.body.velocity.y = -this.PLAYER_SPEED;
    } 
    if(this.cursors.down.isDown || this.player.btnsPressed.down || this.player.btnsPressed.downleft || this.player.btnsPressed.downright) {
      this.player.body.velocity.y = this.PLAYER_SPEED;
    }
    
    //stop all movement if nothing is being pressed
    if(this.game.input.activePointer.isUp) {  // nothing being touched
      this.game.onscreenControls.stopMovement();
    }
    
    // play walking animation
    if(this.player.body.velocity.x != 0 || this.player.body.velocity.y != 0) {
      this.player.animations.play('walk');
    } else {
      this.player.animations.stop();
      this.player.frame = 0;
    }                
       
  },     
  loadLevel: function(){
    //create a tilemap object
    this.map = this.add.tilemap(this.currentLevel);
    
    //join the tile images to the json data
    this.map.addTilesetImage('terrains', 'tilesheet');
    
    //create tile layers
    this.backgroundLayer = this.map.createLayer('backgroundLayer');
    this.collisionLayer = this.map.createLayer('collisionLayer');
    
    //send background to the back
    this.game.world.sendToBack(this.backgroundLayer);
    
    //collision layer should be collisionLayer
    this.map.setCollisionBetween(1,16, true, 'collisionLayer');
    
    //resize the world to fit the layer
    this.collisionLayer.resizeWorld();

    //create player
    var playerData = {
      // list of items
      items: [],

      //player stats
      health: 25,
      attack: 12,
      defense: 8,
      gold: 100,

      // quest
      quests: [
        {
          name: 'Find The Magic Scroll',
          code: 'magic-scroll',
          isCompleted: false
        },
        {
          name: 'Find The Helmet of the Gods',
          code: 'gods-helmet',
          isCompleted: false
        }            
      ] 
    };

    this.player = new RPG.Player(this, 100, 100, playerData);
    
    this.add.existing(this.player);
    
    // group of items
    this.items = this.add.group();
    
    this.loadItems(); 
    
    // follow player with camer
    this.game.camera.follow(this.player);
    
    this.initGUI();
       
  },
  gameOver: function() {
    this.game.state.start('Game', true, false, this.currentLevel);
  },
  initGUI: function() {
    //onscreen controls setup
    // console.log(this.game.onscreenControls);
    this.game.onscreenControls.setup(this.player, {
      left: true,
      right: true,
      up: true,
      down: true,
      upleft: true,
      downleft: true,
      upright: true,
      downright: true,
      action: true
    });
    
    this.showPlayerIcons();  
  },
  collect: function(player, item) {
    this.player.collectItems(item);
  },
  showPlayerIcons: function() {
    // gold icon 
    this.goldIcon = this.add.sprite(10, 10, 'coin');
    this.goldIcon.fixedToCamera = true;
    
    var style = {font: '14px Arial', fill: '#fff' };
    this.goldLabel = this.add.text(30, 10, '0', style);
    this.goldLabel.fixedToCamera = true;
    
    // attack icon 
    this.attackIcon = this.add.sprite(70, 10, 'sword');
    this.attackIcon.fixedToCamera = true;
    
    var style = {font: '14px Arial', fill: '#fff' };
    this.attackLabel = this.add.text(90, 10, '0', style);
    this.attackLabel.fixedToCamera = true;
    
    // defense icon 
    this.defenseIcon = this.add.sprite(130, 10, 'shield');
    this.defenseIcon.fixedToCamera = true;
    
    var style = {font: '14px Arial', fill: '#fff' };
    this.defenseLabel = this.add.text(150, 10, '0', style);
    this.defenseLabel.fixedToCamera = true;
    
    this.refreshStats();         
  },
  refreshStats: function() {
    this.goldLabel.text = this.player.data.gold;
    this.attackLabel.text = this.player.data.attack;
    this.defenseLabel.text = this.player.data.defense;        
  },
  findObjectsByType: function(targetType, tilemap, layer){
    var result = [];
    
    tilemap.objects[layer].forEach(function(element){ 
      if(element.properties.type == targetType) {
        element.y -= tilemap.tileHeight/2; 
        element.x -= tilemap.tileHeight/2;                
        result.push(element);
      }
    }, this);
    
    return result;
  },
  loadItems: function() {
    var elementsArr = this.findObjectsByType('item', this.map, 'objectsLayer');
    console.log(elementsArr);
    elementsArr.forEach(function(element){
      elementObj = new RPG.Item(this, element.x, element.y, element.properties.asset, element.properties)
      this.items.add(elementObj);
    }, this);
  }  
};
