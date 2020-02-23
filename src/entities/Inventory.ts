import { FoundFragments, MODE } from '../scenes/game';
import Button from './Button';
import { Scene } from 'phaser';
import { Game } from '../scenes/game';
import * as config from '../config/config.json';
import * as treasureConfig from '../config/treasure.json';
import Tool from './Tool';

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
    money: number;
    moneyLabel: Phaser.GameObjects.Text;
    descLabel: Phaser.GameObjects.Text;
    polaroidBg: Phaser.GameObjects.Image;
    polaroidFragment: Phaser.GameObjects.Image;
    upgradeLabel: Phaser.GameObjects.Text;
    upgradePriceLabel: Phaser.GameObjects.Text;
    upgradeInfo: Phaser.GameObjects.Text;
    upgradeButton: Button;
    nextDayLabel: Phaser.GameObjects.Text;
    events: Phaser.Events.EventEmitter;
    tool: Tool;
    sfx: Record<string, Phaser.Sound.BaseSound>;

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
            fontSize: '26px',
            align: 'center',
            fontFamily: config.fonts.cursive,
            color: config.fonts.colour
        });
        this.add(this.pageLabel);

        this.moneyLabel = new Phaser.GameObjects.Text(scene, 270, 490, '0000', {
            fontSize: '32px',
            align: 'right',
            fontFamily: config.fonts.cursive,
            color: config.fonts.colour
        });
        this.moneyLabel.setOrigin(1, 0);
        this.add(this.moneyLabel);

        this.descLabel = new Phaser.GameObjects.Text(scene, 460, 110, '', {
            fontSize: '14px',
            align: 'left',
            fontFamily: config.fonts.cursive,
            color: config.fonts.colour,
            wordWrap: {
                width: 240
            }
        });
        this.descLabel.setOrigin(0, 0);
        this.add(this.descLabel);

        this.polaroidBg = new Phaser.GameObjects.Image(scene, 550, 325, 'polaroid_2');
        this.polaroidBg.setOrigin(0.5, 0.45);
        this.polaroidBg.visible = false;
        this.add(this.polaroidBg);

        this.polaroidFragment = new Phaser.GameObjects.Image(scene, 550, 320, '');
        this.polaroidFragment.setOrigin(0.5, 0.45);
        this.polaroidFragment.visible = false;
        this.add(this.polaroidFragment);

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
            color: config.fonts.colour
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
            fontSize: '24px',
            align: 'center',
            fontFamily: config.fonts.normal,
            color: config.fonts.colour
        });
        this.upgradePriceLabel.setOrigin(0.5, 0);
        this.add(this.upgradePriceLabel);

        this.nextDayLabel = new Phaser.GameObjects.Text(scene, 657, 483, 'Start next day', {
            fontSize: '24px',
            align: 'center',
            fontFamily: config.fonts.cursive,
            color: config.fonts.colour
        });
        this.nextDayLabel.setOrigin(0.5, 0);
        this.nextDayLabel.setInteractive({
            useHandCursor: true
        });
        this.nextDayLabel.on(Phaser.Input.Events.POINTER_UP, this.startNextDay, this);
        this.nextDayLabel.angle = 355;
        this.add(this.nextDayLabel);

        this.sfx = {
            'upgrade': scene.sound.add('upgrade'),
            'money_1': scene.sound.add('money_1'),
            'money_0': scene.sound.add('money_2'),
            'inv_select': scene.sound.add('inv_select')
        }
    }

    show(page?: number) {
        this.currentPage = page || 0;

        this.updateUpgradeDetails();
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
            const itemDef = treasureConfig.find(tc => tc.id === itemId);

            discovery.pieces.forEach(piece => {
                const frame = itemDef.trash ? 0 : piece;
                const fragmentSprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, `treasure_${itemId}`, frame);
                fragmentSprite.setOrigin(0, 0);

                this.allFragments.push({
                    id: itemId,
                    piece,
                    sprite: fragmentSprite
                });

                i++;
            });

        });

        this.totalPages = Math.ceil(this.allFragments.length / this.pageSize);

        if (this.totalPages === 0) {
            this.totalPages = 1;
        }
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
            let x = (spriteW * (i % this.cols)) + startX;
            let y = (spriteH * Math.floor(i / this.rows)) + startY;

            const fragmentBg = new Phaser.GameObjects.Sprite(this.scene, x, y, 'polaroid_1');
            fragmentBg.setOrigin(0, 0);
            this.itemsContainer.add(fragmentBg);

            fragmentBg.setInteractive();
            fragmentBg.on(Phaser.Input.Events.POINTER_DOWN, this.selectItem.bind(this, fragment, i));

            this.itemsContainer.add(fragment.sprite);
            fragment.sprite.scale = 0.6;
            fragment.sprite.x = x;
            fragment.sprite.y = y;

            x += 30;
            y += 86;
            const sellButton = new Button(this.scene, x, y, 'sell_button', 1, 2);
            sellButton.setOrigin(0, 0);

            this.itemsContainer.add(sellButton);

            // price label
            x += 20;
            y += 3;
            const itemDef = treasureConfig.find(tc => tc.id === fragment.id);
            const priceLabel = new Phaser.GameObjects.Text(this.scene, x, y, itemDef.value.toString(), {
                fontFamily: config.fonts.normal,
                fontSize: '14px',
                color: '#fff'
            });
            priceLabel.setOrigin(0.5, 0);
            this.itemsContainer.add(priceLabel);
            sellButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
                priceLabel.y += 4;
            });
            sellButton.on(Phaser.Input.Events.POINTER_UP, this.sellItem.bind(this, fragment, sellButton, priceLabel));
        });

        if (this.allFragments.length) {
            this.selectItem(this.allFragments[0], 0, true);
        }
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

    private selectItem(fragment: FragmentDef, i: number, silent?: boolean) {
        const maxAngle = 50;
        const angleSection = maxAngle / 10;
        const offset = fragment.piece % 2 === 0 ? maxAngle / 2 : 0;
        const angle = (fragment.piece * angleSection) - offset;
        const itemDef = treasureConfig.find(tc => tc.id === fragment.id);

        const frame = itemDef.trash ? 0 : fragment.piece;
        this.polaroidFragment.setTexture(`treasure_${fragment.id}`, frame);
        this.polaroidFragment.setAngle(angle);
        this.polaroidBg.setAngle(angle);

        this.polaroidBg.visible = true;
        this.polaroidFragment.visible = true;

        if (itemDef.pieceDescriptions && itemDef.pieceDescriptions[fragment.piece]) {
            this.descLabel.text = itemDef.pieceDescriptions[fragment.piece];
        } else if (itemDef.description) {
            this.descLabel.text = itemDef.description;
        }

        if (silent !== true) {
            this.sfx.inv_select.play();
        }
    }

    private sellItem(item: FragmentDef, priceButton: Button, priceLabel: Phaser.GameObjects.Text) {
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

            if (this.currentPage < 0) {
                this.currentPage = 0;
            }
        }

        this.createFragmentListing(this.currentPage);
        this.createPage(this.currentPage);
        this.moneyLabel.text = this.money.toString();

        this.sfx['money_' + Math.round(Math.random())].play();
    }

    private buyUpgrade() {
        this.upgradePriceLabel.y = 540;

        const cost = this.tool.getNextUpradeCost();

        if (this.money >= cost) {
            this.money -= cost;
            this.moneyLabel.text = this.money.toString();

            this.tool.upgrade();
            this.updateUpgradeDetails();
            this.sfx.upgrade.play();
        }
    }

    private updateUpgradeDetails() {
        const nextUpgradeCost = this.tool.getNextUpradeCost();

        if (nextUpgradeCost) {
            this.upgradeInfo.text = this.tool.getNextUpgrade();
            this.upgradePriceLabel.text = nextUpgradeCost.toString();
        } else {
            this.upgradeInfo.text = 'Fully Upgraded';
            this.upgradePriceLabel.text = '';
            this.upgradeButton.removeInteractive();
        }
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