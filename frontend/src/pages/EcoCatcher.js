import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { motion } from 'framer-motion';
import { Trophy, Play, RotateCcw } from 'lucide-react';

// MainMenu Scene
class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

    // Title
    this.add.text(width / 2, 150, 'Eco Catcher', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#2d5016',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(width / 2, 250, 'Use ← → para mover a cesta', {
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0.5);

    this.add.text(width / 2, 290, 'Colete lixo reciclável!', {
      fontSize: '20px',
      color: '#666'
    }).setOrigin(0.5);

    // Categories
    const categories = [
      { text: 'Plástico: +10 pts', color: '#2196F3' },
      { text: 'Vidro: +15 pts', color: '#4CAF50' },
      { text: 'Metal: +20 pts', color: '#FFC107' },
      { text: 'Orgânico: -10 pts', color: '#795548' }
    ];

    categories.forEach((cat, i) => {
      this.add.text(width / 2, 340 + i * 30, cat.text, {
        fontSize: '18px',
        color: cat.color,
        fontStyle: 'bold'
      }).setOrigin(0.5);
    });

    // Start Button
    const startBtn = this.add.rectangle(width / 2, 520, 200, 50, 0x4CAF50)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, 520, 'COMEÇAR!', {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    startBtn.on('pointerover', () => startBtn.setFillStyle(0x45a049));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0x4CAF50));
    startBtn.on('pointerdown', () => this.scene.start('GameScene'));
  }
}

// GameScene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    this.score = 0;
    this.lives = 3;
    this.timeLeft = 60;
    this.combo = 0;
    this.multiplier = 1;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

    // Ground
    this.add.rectangle(0, height - 50, width, 50, 0x8B4513).setOrigin(0);

    // Player (basket)
    this.player = this.add.rectangle(width / 2, height - 100, 80, 60, 0xFF6B35);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setImmovable(true);

    // Items group
    this.items = this.physics.add.group();

    // HUD
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '28px',
      color: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    });

    this.timeText = this.add.text(width / 2, 20, 'Tempo: 60s', {
      fontSize: '28px',
      color: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5, 0);

    this.livesText = this.add.text(width - 20, 20, '❤️ '.repeat(this.lives), {
      fontSize: '28px'
    }).setOrigin(1, 0);

    this.comboText = this.add.text(width / 2, 60, '', {
      fontSize: '24px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5, 0);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Spawn items
    this.spawnTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true
    });

    // Game timer
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // Collision
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
  }

  update() {
    // Player movement
    if (this.cursors.left.isDown) {
      this.player.x -= 8;
    } else if (this.cursors.right.isDown) {
      this.player.x += 8;
    }

    // Keep player in bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 40, this.cameras.main.width - 40);

    // Remove items that fell off screen
    this.items.children.entries.forEach(item => {
      if (item.y > this.cameras.main.height) {
        item.destroy();
      }
    });
  }

  spawnItem() {
    const { width } = this.cameras.main;
    const x = Phaser.Math.Between(50, width - 50);
    
    const types = [
      { color: 0x2196F3, points: 10, type: 'plastic', label: 'PLÁSTICO' },
      { color: 0x4CAF50, points: 15, type: 'glass', label: 'VIDRO' },
      { color: 0xFFC107, points: 20, type: 'metal', label: 'METAL' },
      { color: 0x795548, points: -10, type: 'organic', label: 'ORGÂNICO' }
    ];

    const itemType = Phaser.Math.RND.pick(types);
    const item = this.add.rectangle(x, -30, 50, 50, itemType.color);
    
    // Add label
    const label = this.add.text(x, -30, itemType.label, {
      fontSize: '10px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.physics.add.existing(item);
    item.body.setVelocityY(Phaser.Math.Between(150, 250));
    item.setData('points', itemType.points);
    item.setData('type', itemType.type);
    item.setData('label', label);
    
    this.items.add(item);

    // Increase difficulty over time
    if (this.timeLeft < 40) {
      this.spawnTimer.delay = 1200;
    }
    if (this.timeLeft < 20) {
      this.spawnTimer.delay = 900;
      item.body.setVelocityY(Phaser.Math.Between(200, 300));
    }
  }

  collectItem(player, item) {
    const points = item.getData('points');
    const label = item.getData('label');

    if (label) label.destroy();

    if (points > 0) {
      this.combo++;
      if (this.combo >= 5) {
        this.multiplier = 2;
        this.comboText.setText(`COMBO x${this.multiplier}!`);
      }
      this.score += points * this.multiplier;
      
      // Flash effect
      this.cameras.main.flash(100, 0, 255, 0);
    } else {
      this.lives--;
      this.combo = 0;
      this.multiplier = 1;
      this.comboText.setText('');
      this.livesText.setText('❤️ '.repeat(this.lives));
      this.cameras.main.shake(200, 0.01);
      
      if (this.lives <= 0) {
        this.gameOver();
      }
    }

    this.scoreText.setText(`Score: ${this.score}`);
    item.destroy();
  }

  updateTimer() {
    this.timeLeft--;
    this.timeText.setText(`Tempo: ${this.timeLeft}s`);

    if (this.timeLeft <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    if (this.spawnTimer) this.spawnTimer.remove();
    if (this.gameTimer) this.gameTimer.remove();
    this.scene.start('GameOver', { score: this.score });
  }
}

// GameOver Scene
class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

    // Game Over text
    this.add.text(width / 2, 150, 'Fim de Jogo!', {
      fontSize: '64px',
      color: '#d32f2f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, 250, `Score: ${this.finalScore}`, {
      fontSize: '36px',
      color: '#333',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // EcoPoints
    const ecoPoints = Math.floor(this.finalScore / 10);
    this.add.text(width / 2, 310, `EcoPoints Ganhos: ${ecoPoints}`, {
      fontSize: '28px',
      color: '#4CAF50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Play Again Button
    const playBtn = this.add.rectangle(width / 2, 420, 220, 50, 0x4CAF50)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, 420, 'JOGAR NOVAMENTE', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    playBtn.on('pointerover', () => playBtn.setFillStyle(0x45a049));
    playBtn.on('pointerout', () => playBtn.setFillStyle(0x4CAF50));
    playBtn.on('pointerdown', () => this.scene.start('GameScene'));

    // Menu Button
    const menuBtn = this.add.rectangle(width / 2, 490, 220, 50, 0x2196F3)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, 490, 'MENU PRINCIPAL', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x1976D2));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x2196F3));
    menuBtn.on('pointerdown', () => this.scene.start('MainMenu'));

    // Save score to parent component
    if (window.saveGameScore) {
      window.saveGameScore(this.finalScore, ecoPoints);
    }
  }
}

// React Component
export default function EcoCatcher() {
  const gameRef = useRef(null);
  const [gameInstance, setGameInstance] = useState(null);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    if (showGame && !gameInstance) {
      const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: 800,
        height: 600,
        backgroundColor: '#87CEEB',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: [MainMenu, GameScene, GameOver]
      };

      const game = new Phaser.Game(config);
      setGameInstance(game);

      window.saveGameScore = (score, ecoPoints) => {
        console.log('Score:', score, 'EcoPoints:', ecoPoints);
      };
    }

    return () => {
      if (gameInstance && !showGame) {
        gameInstance.destroy(true);
        setGameInstance(null);
      }
    };
  }, [showGame]);

  if (!showGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              🎮 Eco Catcher
            </h1>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
            >
              <div className="mb-6">
                <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Colete Lixo Reciclável!
                </h2>
                <p className="text-lg text-gray-600">
                  Mova a cesta e colete o máximo de lixo reciclável em 60 segundos!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Como Jogar</h3>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>⌨️ Use as setas ← → para mover</li>
                    <li>🎯 Colete lixo reciclável</li>
                    <li>❌ Evite lixo orgânico</li>
                    <li>⏱️ 60 segundos de jogo</li>
                    <li>❤️ 3 vidas disponíveis</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-green-800 mb-4">Pontuação</h3>
                  <ul className="text-left space-y-2">
                    <li className="text-blue-600 font-semibold">🔵 Plástico: +10 pts</li>
                    <li className="text-green-600 font-semibold">🟢 Vidro: +15 pts</li>
                    <li className="text-yellow-600 font-semibold">🟡 Metal: +20 pts</li>
                    <li className="text-red-600 font-semibold">🟤 Orgânico: -10 pts</li>
                    <li className="text-purple-600 font-semibold">⚡ Combo x2 após 5 acertos!</li>
                  </ul>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGame(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-12 py-4 rounded-2xl text-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto"
              >
                <Play className="w-8 h-8" />
                Começar Jogo!
              </motion.button>
            </motion.div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🏆 Ranking</h3>
              <p className="text-gray-600">Em breve: Top 10 jogadores!</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (gameInstance) {
                gameInstance.destroy(true);
                setGameInstance(null);
              }
              setShowGame(false);
            }}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Sair do Jogo
          </motion.button>

          <div 
            id="game-container" 
            ref={gameRef}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: '800px', height: '600px' }}
          />
        </div>
      </div>
    </div>
  );
}
