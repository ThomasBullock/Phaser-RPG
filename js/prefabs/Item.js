var RPG = RPG || {};

RPG.Item = function(state, x, y, key, data) {
  Phaser.Sprite.call(this, state.game, x, y, key);

  this.state = state;
  this.game = state.game;
  this.data = data;
  this.anchor.setTo(0.5);

  // //walking animation
  // this.animations.add('walk', [0, 1, 0], 6, false);

  //enable physics
  this.game.physics.arcade.enable(this);  
};

RPG.Item.prototype = Object.create(Phaser.Sprite.prototype);
RPG.Item.prototype.constructor = RPG.Item;