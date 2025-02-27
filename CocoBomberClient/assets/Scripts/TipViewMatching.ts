import { _decorator, Button, Component, Label, labelAssembler, Node, Sprite, assetManager, Texture2D, SpriteFrame, ImageAsset } from 'cc';
import { DataWarehouse } from './DataWarehouse';
import { networkEventTarget, NetworkManager } from '../NetworkManager';

const { ccclass, property } = _decorator;

@ccclass('TipViewMatching')
export class TipViewMatching extends Component {
    @property({
        type: Label
    })
    public peopleTf: Label;

    @property({
        type: Label
    })
    public costTf: Label;

    @property({
        type: Button
    })
    private closeBtn;

    @property(Button) cancelBtn;

    @property(Sprite) avatarSp;

    start() {

         if (DataWarehouse.instance.userDataGened != undefined) {
             let url = DataWarehouse.instance.userDataGened.avatar;
             console.log("url===avatar===", url);
          // let url = "https://lucky-us.oss-us-east-1.aliyuncs.com/systemavatar/avatar2.jpg"
            if (url != null && url != "") {

                assetManager.loadRemote(url, (err, img: ImageAsset) => {
                    console.log('url', url);
                    if (err) {
                        console.error('Failed to load image:', err);
                        return;
                    }

                    // 创建一个新的 SpriteFrame 并设置纹理
                    const spriteFrame = new SpriteFrame();
                    let texture2d = new Texture2D();
                    texture2d.image = img;
                    spriteFrame.texture = texture2d;
                    // 将 SpriteFrame 设置到 Sprite 组件上
                    this.avatarSp.spriteFrame = spriteFrame;
                });
            }
         }


        this.closeBtn.node.on('click', () => {
            this.cancelConn();
        }, this);



        this.cancelBtn.node.on('click', () => {
            this.cancelConn();
            //todo cancel matching from networkworks
        }, this);


    }

    cancelConn(){
        NetworkManager.instance.disconnect();
        this.node.destroy();
    }

    update(deltaTime: number) {

    }
}

