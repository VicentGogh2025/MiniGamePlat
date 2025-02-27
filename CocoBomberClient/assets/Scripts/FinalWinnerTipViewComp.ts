import { _decorator, Button, Component, Label, Node, Sprite,ImageAsset,assetManager,SpriteFrame,Texture2D,director } from 'cc';
import { DataWarehouse } from './DataWarehouse';
import { NetworkManager } from '../NetworkManager';
import { LocalLangManager } from './LocalLangManager';
const { ccclass, property } = _decorator;

@ccclass('FinalWinnerTipViewComp')
export class FinalWinnerTipViewComp extends Component {

    @property(Label)
    playerNameLabel:Label;
    @property(Sprite)
    avatarSprite:Sprite;
    @property(Label)
    rewardCoinsLabel:Label;
    @property(Button)
    closeBtn:Button;

    start() {
        this.closeBtn.node.on('click', () => {
            DataWarehouse.instance.updateUserData2LocalStorage();
            location.reload();
      //      DataWarehouse.instance.gameData.removeAllPlayerObj();
        //     DataWarehouse.instance.node.destroy();
        //     NetworkManager.instance.destroy();
        //     LocalLangManager.instance.destroy();
        //     DataWarehouse.instance.destroy();

        //     DataWarehouse.resetInstance();
        //     LocalLangManager.resetInstance();
        //     NetworkManager.resetInstance();
           
        //    director.loadScene("Init");
            //this.node.destroy();
        }, this);
    }

    public setAvatar(url: string) {
        try{
        assetManager.loadRemote(url, { ext: '.png' }, (err, img: ImageAsset) => {
            console.log('url', url);
            if (err) {
                console.error('Failed to load image:', err);
                return;
            }

            // 创建一个新的 SpriteFrame 并设置纹理
            const spriteFrame = new SpriteFrame();
            let tex = new Texture2D();
            tex.image = img;
            spriteFrame.texture = tex;
            // 将 SpriteFrame 设置到 Sprite 组件上
            this.avatarSprite.spriteFrame = spriteFrame;
        });
    }catch(e){
        console.log("===set avatar==="+e);
    }
    }

    public setPlayerName(name:string){
        this.playerNameLabel.string = name;
    }

    public setRewardCoins(coins:number){
        this.rewardCoinsLabel.string = coins.toString();
    }

    update(deltaTime: number) {
        
    }
}

