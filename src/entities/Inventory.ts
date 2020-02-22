import { FoundFragments } from '../scenes/game';
import Button from './Button';
import { Scene } from 'phaser';

const TWEEN_DURATION: number = 1000;

export default class Inventory extends Phaser.GameObjects.Container {
    discoveries: FoundFragments[];
    allFragments: any[];
    itemsContainer: Phaser.GameObjects.Container;
    pageLabel: Phaser.GameObjects.Text;
    totalPages: number;
    currentPage: number;
    cols: number = 3;
    rows: number = 3;
    pageSize: number;
    fontFamily: string = 'Arial, Helvetica';
    fontColor: string = '#000';
    money: number;
    moneyLabel: Phaser.GameObjects.Text;
    titleLabel: Phaser.GameObjects.Text;
    descLabel: Phaser.GameObjects.Text;


    constructor(scene: Scene) {
        super(scene, 0, 0);

        this.pageSize = this.rows * this.cols;

        const bg = new Phaser.GameObjects.Image(scene, 0, 0, 'bag');
        bg.setOrigin(0, 0);

        // start offscreen
        this.x = -bg.width;

        this.add(bg);

        this.itemsContainer = new Phaser.GameObjects.Container(scene, 0, 0);
        this.add(this.itemsContainer);

        const y = 412;

        const prevButton = new Button(scene, 121, y, 'arrow');
        prevButton.setOrigin(0, 0);
        prevButton.on(Phaser.Input.Events.POINTER_DOWN, this.pagePrev, this);
        this.add(prevButton);

        const nextButton = new Button(scene, 313, y, 'arrow');
        nextButton.setOrigin(0, 0);
        nextButton.flipX = true;
        nextButton.on(Phaser.Input.Events.POINTER_DOWN, this.pageNext, this);
        this.add(nextButton);

        this.pageLabel = new Phaser.GameObjects.Text(scene, 200, 418, '', {
            fontSize: '26px bold',
            align: 'center',
            fontFamily: this.fontFamily,
            color: this.fontColor
        });
        this.add(this.pageLabel);

        this.moneyLabel = new Phaser.GameObjects.Text(scene, 280, 503, '$12345', {
            fontSize: '24px bold',
            align: 'right',
            fontFamily: this.fontFamily,
            color: this.fontColor
        });
        this.moneyLabel.setOrigin(1, 0);
        this.add(this.moneyLabel);

        this.titleLabel = new Phaser.GameObjects.Text(scene, 570, 50, 'FINDINGS', {
            fontSize: '42px bold',
            align: 'center',
            fontFamily: this.fontFamily,
            color: this.fontColor
        });
        this.titleLabel.setOrigin(0.5, 0);
        this.add(this.titleLabel);

        this.descLabel = new Phaser.GameObjects.Text(scene, 460, 110, '', {
            fontSize: '14px',
            align: 'left',
            fontFamily: this.fontFamily,
            color: this.fontColor,
            wordWrap: {
                width: 240
            }
        });
        this.descLabel.setOrigin(0, 0);
        this.add(this.descLabel);
    }

    show() {
        this.currentPage = 0;
        this.allFragments = [];

        let i = 0;

        this.discoveries.forEach((discovery, itemId) => {
            discovery.pieces.forEach(piece => {
                //  `fragment_${tc.id}_${foundPiece}`
                const spriteName = 'item_large';
                const fragmentSprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, spriteName);
                fragmentSprite.setOrigin(0, 0);
                fragmentSprite.setInteractive();
                fragmentSprite.on(Phaser.Input.Events.POINTER_DOWN, this.selectItem.bind(this, itemId, piece, i));

                this.allFragments.push({
                    id: itemId,
                    piece,
                    sprite: fragmentSprite
                });

                i++;
            });

        });

        this.totalPages = Math.ceil(this.allFragments.length / this.pageSize);
        this.moneyLabel.text = this.money.toString();

        this.createPage(0);

        this.scene.tweens.add({
            targets: [this],
            props: {
                x: 0
            },
            ease: Phaser.Math.Easing.Circular.Out,
            duration: TWEEN_DURATION
        });
    }

    createPage(page: number) {
        const startX = 95;
        const startY = 50;
        const spriteW = 100;
        const spriteH = 120;

        const startI = page * this.pageSize;
        const endI = startI + this.pageSize;

        this.itemsContainer.removeAll();
        this.pageLabel.text = (this.currentPage + 1) + ' / ' + this.totalPages;

        this.allFragments.slice(startI, endI).forEach((fragment, i) => {
            this.itemsContainer.add(fragment.sprite);
            fragment.sprite.scale = 0.6;
            fragment.sprite.x = (spriteW * (i % this.cols)) + startX;
            fragment.sprite.y = (spriteH * Math.floor(i / this.rows)) + startY;
            fragment.sprite.tint = 200000;
        });
    }

    private pagePrev() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.createPage(this.currentPage);

        }
    }

    private pageNext() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.createPage(this.currentPage);
        }
    }

    private selectItem(itemId: number, piece: number, i: number) {
        console.log(itemId, piece, i);
    }
}
