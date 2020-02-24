import { Scene } from 'phaser';
import { FoundFragments } from './game.js';
import * as config from '../config/config.json';
import * as treasureConfig from '../config/treasure.json';

export class Results extends Scene {
  foundFragments: FoundFragments[];
  score: number = 0;

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
  }

  create() {
    const bg = this.add.image(0, 0, 'results_bg');
    bg.setOrigin(0, 0);

    this.foundFragments.forEach((fragment, itemId) => {
      const itemConfig = treasureConfig.find(tc => tc.id === itemId);

      this.score += fragment.pieces.length * itemConfig.value;

      if (fragment.pieces.length === itemConfig.fragments) {
        this.score *= config.completionBonusMult;
      }

      this.score = Math.ceil(this.score);

      const coords = {
        1: {
          x: 631,
          y: 66
        },
        2: {
          x: 24,
          y: 66
        },
        4: {
          x: 631,
          y: 295
        },
        5: {
          x: 24,
          y: 295
        },
        7: {
          x: 275,
          y: 384
        }
      };

      if (!itemConfig.trash) {
        fragment.pieces.forEach(piece => {
          const portraitPiece = new Phaser.GameObjects.Sprite(this, coords[itemId].x, coords[itemId].y, `treasure_end_${itemId}`, piece);
          portraitPiece.setOrigin(0, 0);
          this.add.existing(portraitPiece);
        });
      }
    });

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: config.fonts.cursive,
      fontSize: '24px',
      align: 'center',
      color: config.fonts.colour
    };
    const score = this.add.text(400, 135, this.score.toString(), style);
    score.setOrigin(0.5, 0);

    let titleValue;
    let descValue;

    if (this.score > 600) {
      titleValue = 'Indiana Bones';
      descValue = 'Bone diggity! You\'ve mastered the art.';
    } else if (this.score > 400) {
      titleValue = 'Bonehunter';
      descValue = 'A bonafide archaeologist, no bones about it!';
    } else if (this.score > 250) {
      titleValue = 'Archaeologist';
      descValue = 'You\'ve got a bone to pick... with the ground!';
    } else if (this.score > 150) {
      titleValue = 'Archaeology Student';
      descValue = 'You\'ve really been boning up on the subject!';
    } else {
      titleValue = 'Architect';
      descValue = 'Are you sure you came to the right place ?'
    }

    const title = this.add.text(400, 180, titleValue, style);
    title.setOrigin(0.5, 0);

    style.wordWrap = {
      width: 280
    }
    const desc = this.add.text(400, 265, descValue, style);
    desc.setOrigin(0.5, 0.5);

    const rect = new Phaser.Geom.Rectangle(531, 275, 66, 70);

    var graphics = this.add.graphics();

    graphics.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
    graphics.on(Phaser.Input.Events.POINTER_DOWN, () => {
      //this.scene.start('MenuScene');
      document.location.reload();
    });
  }
}
