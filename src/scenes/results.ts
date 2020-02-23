import { Scene } from 'phaser';
import { FoundFragments } from './game.js';
import * as config from '../config/config.json';
import * as treasureConfig from '../config/treasure.json';

export class Results extends Scene {
  foundFragments: FoundFragments[];
  score: number;

  constructor() {
    super({
      key: 'ResultsScene',
    });
  }

  preload() {
    this.load.image('results_bg', 'assets/image/end_screen.png');
  }

  init(data: any) {
    this.foundFragments = data.foundFragments;

    this.score = 0;

    this.foundFragments.forEach((fragment, itemId) => {
      const itemConfig = treasureConfig.find(tc => tc.id === itemId);

      this.score += fragment.pieces.length * itemConfig.value;

      if (fragment.pieces.length === itemConfig.fragments) {
        this.score *= config.completionBonusMult;
      }
    });
  }

  create() {
    const bg = this.add.image(0, 0, 'results_bg');
    bg.setOrigin(0, 0);

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: config.fonts.cursive,
      fontSize: '24px',
      align: 'center',
      color: config.fonts.colour
    };
    const score = this.add.text(400, 135, this.score.toString(), style);

    score.setOrigin(0.5, 0);

  }
}
