import { Game } from './game';
import { Game as GameScene } from './scenes/game';
import { Preload } from './scenes/preload';
import { Results } from './scenes/results';
import { Menu } from './scenes/menu';

const config: Phaser.Types.Core.GameConfig = {
  title: 'DIG DEEP',

  scene: [Preload, Menu, GameScene, Results],
  backgroundColor: '#333',
  //resolution: window.devicePixelRatio,
  scale: {
    parent: 'game-container',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    max: {
      width: 800,
      height: 600,
    }
  },
};

window.addEventListener('load', () => {
  if (!document.getElementById('game-container')) {
    document.body.insertAdjacentHTML('afterbegin', '<div id="game-container"></div>');
  }
  window['game'] = new Game(config);
});
