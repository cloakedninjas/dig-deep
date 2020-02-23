import { Game } from './game';
import { Game as GameScene } from './scenes/game';
import { Preload } from './scenes/preload';
import { Results } from './scenes/results';

const config: Phaser.Types.Core.GameConfig = {
  title: 'Demo Game',

  scene: [Preload, GameScene, Results],
  backgroundColor: '#333',
  resolution: window.devicePixelRatio,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    width: 800,
    height: 600,

  },
};

window.addEventListener('load', () => {
  window['game'] = new Game(config);
});
