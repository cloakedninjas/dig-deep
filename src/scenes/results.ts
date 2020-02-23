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
    this.load.image('results_bg', 'assets/image/result.png');
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


    // calc score
  }

  create() {
    const bg = this.add.image(0, 0, 'results_bg');

    const score = this.add.text(0, 0, this.score.toString(), {
      fontFamily: config.fonts.normal,
      fontSize: '32px'
    });

  }
}
