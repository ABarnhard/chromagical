/* exported Game */
/* global Asset, Drop, Bar */
//Bloop, Splat,
var Game = (function(){
  'use strict';

  function Game(){
    this.canvas        = document.getElementById('canvas');
    this.ctx           = this.canvas.getContext('2d');
    this.canvas.height = window.innerHeight;
    this.canvas.width  = Math.floor(window.innerWidth * 0.7);
    this.assets        = Asset.load();
    this.drops         = [];
    this.splats        = [];
    this.bloops        = [];
    this.score         = 0;
    this.lives         = 0;
    this.timer         = null;
    this.isOver        = false;
    this.bloopCount    = 0;
    this.currentLevel  = 0;
    this.levels        = {
      0: {gravity:5,  frequency: 2500, range: 2,  point: 10},
      1: {gravity:7, frequency: 2500, range: 5,  point: 15},
      2: {gravity:15, frequency: 2000, range: 5,  point: 15},
      3: {gravity:20, frequency: 1500, range: 11, point: 20}
    };
    this.palette       = {
      5:  '#ff0000', // red
      7:  '#ffff00', // yellow
      11: '#0033ff', // blue
      16: '#990099', // purple
      12: '#ff9900', // orange
      18: '#009900', // green
      19: '#ffcc00', // yellow-orange
      25: '#66cc00', // yellow-green
      17: '#ff6600', // red-orange
      21: '#cc0099', // red-purple
      27: '#660099', // blue-purple
      29: '#006600', // blue-green
      0:  '#ffffff'  // white
    };
  }

  Game.prototype.paint = function(timestamp){
    this.clear();

    this.drops.forEach(function(drop){
      drop.draw(this);
    }.bind(this));

    this.splats.forEach(function(splat){
      splat.draw(this);
    }.bind(this));

    this.bloops.forEach(function(bloop){
      bloop.draw(this);
    }.bind(this));

    this.bar.draw(this);

    this.updateGame();
    this.isOver = this.lives <= 0;
    this.levelUp = this.updateLevel();

    if(this.isOver){
      window.dispatchEvent(new Event('gameover'));
    }else if(this.levelUp){
      window.dispatchEvent(new Event('levelup'));
    }else{
      window.requestAnimationFrame(this.paint.bind(this));
    }
  };

  Game.prototype.clear = function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Game.prototype.setDropTimer = function(){
    this.timer = window.setInterval(function(){
      this.drops.push(new Drop(this));
    }.bind(this), this.levels[this.currentLevel].frequency);
  };

  Game.prototype.cancelDropTimer = function(){
    window.clearInterval(this.timer);
  };

  Game.prototype.updateGame = function(){
    if(!this.drops[0]){return;}

    if(this.drops[0].hitBar(this)){
      console.log('drop color:', this.drops[0].color, 'bar color:', this.bar.color);
      console.log('colors Matched', this.drops[0].color === this.bar.color);
      if(this.drops[0].color === this.bar.color){
        this.score += this.levels[this.currentLevel].point;
        this.bloopCount += 1;
        // this.bloops.push(new Bloop(this));
        this.assets.bloop.play();
      }else{
        this.lives -= 1;
        // this.splats.push(new Splat(this));
        this.assets.splat.play();
      }
      this.drops.shift();
    }
  };

  Game.prototype.updateLevel = function(){
    var levelUp = false;
    if(this.bloopCount % 10 === 0 && this.bloopCount !== 0){
      levelUp = true;
    }
    return levelUp;
  };

  Game.prototype.start = function(lives, level, score){
    this.cancelDropTimer();
    this.currentLevel = level || 0;
    this.score = score || 0;
    this.lives = lives;
    this.bloopCount = 0;
    this.drops = [];
    this.splats = [];
    this.bloops = [];
    this.bar = new Bar(this);
    this.setDropTimer();
    this.paint();
  };

  return Game;
})();
