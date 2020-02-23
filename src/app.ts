import { Game } from './game';
import { Game as GameScene } from './scenes/game';
import { Preload } from './scenes/preload';
import { Results } from './scenes/results';
import { Menu } from './scenes/menu';

const config: Phaser.Types.Core.GameConfig = {
  title: 'DIG DEEP',

  scene: [Preload, Menu, GameScene, Results],
  backgroundColor: '#333',
  resolution: window.devicePixelRatio,
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    width: 800,
    height: 600,

  },
};

window.addEventListener('load', () => {
  window['game'] = new Game(config);
});
