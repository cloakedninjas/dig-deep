import { FoundFragments, MODE } from '../scenes/game';
import Button from './Button';
import { Scene } from 'phaser';
import { Game } from '../scenes/game';
import * as config from '../config/config.json';
import * as treasureConfig from '../config/treasure.json';

const TWEEN_DURATION: number = 1000;

export default class Inventory extends Phaser.GameObjects.Container {
    scene: Game;
    discoveries: FoundFragments[];
    allFragments: FragmentDef[];
    bg: Phaser.GameObjects.Image;
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
    descLabel: Phaser.GameObjects.Text;
    polaroidBg: Phaser.GameObjects.Image;
    upgradeLabel: Phaser.GameObjects.Text;
    upgradePriceLabel: Phaser.GameObjects.Text;
    upgradeInfo: Phaser.GameObjects.Text;
    upgradeButton: Button;
    nextDayLabel: Phaser.GameObjects.Text;
    events: Phaser.Events.EventEmitter;

    constructor(scene: Scene) {
        super(scene, 0, 0);

        this.pageSize = this.rows * this.cols;
        this.events = new Phaser.Events.EventEmitter();

        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, 'bag');
        this.bg.setOrigin(0, 0);

        // start offscreen
        this.x = -this.bg.width;

        this.add(this.bg);

        this.itemsContainer = new Phaser.GameObjects.Container(scene, 0, 0);
        this.add(this.itemsContainer);

        const y = 412;

        const prevButton = new Button(scene, 121, y, 'arrow_button', null, 1);
        prevButton.setOrigin(0, 0);
        prevButton.on(Phaser.Input.Events.POINTER_DOWN, this.pagePrev, this);
        this.add(prevButton);

        const nextButton = new Button(scene, 313, y, 'arrow_button', null, 1);
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

        this.polaroidBg = new Phaser.GameObjects.Image(scene, 550, 320, 'polaroid');
        this.polaroidBg.setOrigin(0.5, 0.45);
        this.add(this.polaroidBg);

        this.upgradeLabel = new Phaser.GameObjects.Text(scene, 326, 477, 'Upgrade Pickaxe:', {
            fontSize: '14px',
            align: 'right',
            fontFamily: config.fonts.cursive,
            color: 'red'
        });
        this.upgradeLabel.setOrigin(0, 0);
        this.add(this.upgradeLabel);

        this.upgradeInfo = new Phaser.GameObjects.Text(scene, 375, 500, '', {
            fontSize: '14px',
            align: 'center',
            fontFamily: config.fonts.cursive,
            color: this.fontColor
        });
        this.upgradeInfo.setOrigin(0.5, 0);
        this.add(this.upgradeInfo);

        this.upgradeButton = new Button(scene, 320, 528, 'upgrade_button', 1, 2);
        this.upgradeButton.setOrigin(0, 0);
        this.upgradeButton.on(Phaser.Input.Events.POINTER_DOWN, this.buyUpgrade, this);
        this.upgradeButton.on(Phaser.Input.Events.POINTER_UP, () => {
            this.upgradePriceLabel.y = 532;
        });
        this.add(this.upgradeButton);

        this.upgradePriceLabel = new Phaser.GameObjects.Text(scene, 380, 532, '', {
            fontSize: '20px bold',
            align: 'center',
            fontFamily: config.fonts.normal,
            color: this.fontColor
        });
        this.upgradePriceLabel.setOrigin(0.5, 0);
        this.add(this.upgradePriceLabel);

        this.nextDayLabel = new Phaser.GameObjects.Text(scene, 657, 483, 'Start next day\n> > >', {
            fontSize: '28px bold',
            align: 'center',
            fontFamily: config.fonts.cursive,
            color: this.fontColor
        });
        this.nextDayLabel.setOrigin(0.5, 0);
        this.nextDayLabel.setInteractive({
            useHandCursor: true
        });
        this.nextDayLabel.on(Phaser.Input.Events.POINTER_UP, this.startNextDay, this);
        this.nextDayLabel.angle = 355;
        this.add(this.nextDayLabel);
    }

    show(page?: number) {
        this.currentPage = page || 0;

        this.moneyLabel.text = this.money.toString();
        this.upgradeInfo.text = 'TOdo...';
        this.upgradePriceLabel.text = '123';

        this.createFragmentListing(this.currentPage);
        this.createPage(this.currentPage);

        this.scene.tweens.add({
            targets: [this],
            props: {
                x: 0
            },
            ease: Phaser.Math.Easing.Circular.Out,
            duration: TWEEN_DURATION
        });
    }

    createFragmentListing(page: number) {
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
            fragment.sprite.tint = 2000;

            let x = fragment.sprite.x + 30;
            let y = fragment.sprite.y + 86;
            const sellButton = new Button(this.scene, x, y, 'sell_button', 1, 2);
            sellButton.setOrigin(0, 0);

            this.itemsContainer.add(sellButton);

            // price label
            x += 20;
            y += 3;
            const itemDef = treasureConfig.find(tc => tc.id === fragment.id);
            const priceLabel = new Phaser.GameObjects.Text(this.scene, x, y, itemDef.value.toString(), {
                fontFamily: config.fonts.normal,
                fontSize: '14px bold',
                color: '#fff'
            });
            priceLabel.setOrigin(0.5, 0);
            this.itemsContainer.add(priceLabel);
            sellButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
                priceLabel.y += 4;
            });
            sellButton.on(Phaser.Input.Events.POINTER_UP, this.sellItem.bind(this, fragment, sellButton, priceLabel));
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
        const maxAngle = 50;
        const angleSection = maxAngle / 10;
        const offset = piece % 2 === 0 ? maxAngle / 2 : 0;
        this.polaroidBg.setAngle((piece * angleSection) - offset);
        console.log(itemId, piece, i);
    }

    private sellItem(item: FragmentDef, priceButton: Button, priceLabel: Phaser.GameObjects.Text) {
        console.log(item)
        priceLabel.y -= 4;

        const itemDef = treasureConfig.find(tc => tc.id === item.id);

        this.money += itemDef.value;

        // remove this fragment from all fragments
        let index = this.allFragments.indexOf(item);
        this.allFragments.splice(index, 1);

        // update discoveries
        index = this.discoveries[item.id].pieces.indexOf(item.piece);
        this.discoveries[item.id].pieces.splice(index, 1);

        item.sprite.destroy();
        priceLabel.destroy();
        priceButton.destroy();

        const newTotalPages = Math.ceil(this.allFragments.length / this.pageSize);
        if (newTotalPages !== this.totalPages) {
            if (this.currentPage === newTotalPages) {
                this.currentPage--;
            }
        }

        this.createFragmentListing(this.currentPage);
        this.createPage(this.currentPage);
        this.moneyLabel.text = this.money.toString();
    }

    private buyUpgrade() {
        this.upgradePriceLabel.y = 540;
    }

    private startNextDay() {
        if (this.scene.mode === MODE.INVENTORY) {
            this.scene.tweens.add({
                targets: [this],
                props: {
                    x: -this.bg.width
                },
                ease: Phaser.Math.Easing.Circular.In,
                duration: TWEEN_DURATION,
                onComplete: () => {
                    this.events.emit(INV_EVENTS.NEXT_DAY);
                }
            });
        }
    }
}

interface FragmentDef {
    id: number,
    piece: number,
    sprite: Phaser.GameObjects.Sprite
};

export enum INV_EVENTS {
    NEXT_DAY = 'day'
};