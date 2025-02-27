import { _decorator, Component, Node, Texture2D,resources,Color, Sprite,SpriteFrame,assetManager,ImageAsset, Button  } from 'cc';
const { ccclass, property } = _decorator;
import { DataWarehouse,PropType } from './DataWarehouse';
import { JsonCMD } from './JsonCMD';
import { NetworkManager } from '../NetworkManager';
import { GameSceneUIManager } from './GameSceneUIManager';
@ccclass('BoxItemComp')
export class BoxItemComp extends Component {
    // public static iconBomb:Texture2D;
    // public static iconZoom:Texture2D;
    // public static iconNext:Texture2D;
    // public static iconCoin:Texture2D;
    // public static iconLucky:Texture2D;
    
    public static propType:PropType;

  //  static isloadResReady:boolean = false;
    @property(Sprite) propSprite;
    @property(Sprite) openSprite;
    @property(Node) peopleItem;
    @property(Button) boxBtn;
    @property(Number) moveX;
    @property(Number) moveY;
    private  avatarSp:Sprite;
    private  circleSp:Sprite;

    private isOpened = false;
    start() {
        // if(BoxItemComp.iconBomb==null){
        //     this.loadT2dFromResources(PropType.Bomb);
           
        // }
        // if(BoxItemComp.iconZoom==null){
        //     this.loadT2dFromResources(PropType.Zoom);
        // }
        // if(BoxItemComp.iconNext==null){
        //     this.loadT2dFromResources(PropType.Next);
        // }
        // if(BoxItemComp.iconCoin==null){
        //     this.loadT2dFromResources(PropType.Coin);
        // }
        // if(BoxItemComp.iconLucky==null){
        //     this.loadT2dFromResources(PropType.None);
        // }

        this.avatarSp = this.peopleItem.getChildByName("AvatarImg").getComponent(Sprite);
        this.circleSp = this.peopleItem.getChildByName("Avatarbg").getComponent(Sprite);
        // this.avatarSp = this.peopleItem.getChildByName("avatar").getComponent(Sprite);
        // this.avatarSp.spriteFrame.texture = BoxItemComp.iconBomb;
       // this.avatarSp.node.active = false;
        this.openSprite.node.active = false;
        this.propSprite.node.active = false;
        this.peopleItem.active = false;

        this.boxBtn.node.on('click', () => {
            if(!GameSceneUIManager.isAllowSel){
                console.log("====not allow local sel bomb====");
                return;
            }
            console.log("===click open box===",this.moveX,this.moveY);
            
            if(DataWarehouse.startZoom){
                DataWarehouse.instance.requestUsingOneZoomPropForMainPlayer(this.moveX,this.moveY);
                DataWarehouse.startZoom = false;
                return;

            }

            if(this.isOpened)
                return;
            let jsonStr = JsonCMD.C2S_playerMove(this.moveX,this.moveY);
            NetworkManager.instance.sendMsg2Server(jsonStr);
            this.isOpened = true;
            // this.popUpTipViewMatching(10,5);
        });
        // this.node.getComponent(Sprite).spriteFrame = new SpriteFrame(BoxItemComp.iconBomb);

    }
    ///todo maybe return a clone object 
   

    // init(){
    //     BoxItemComp.isloadResReady = true;
    // }

    public openBox(propType:PropType,isMainPlayer:boolean,avatarURL:string){
        this.openSprite.node.active = true;
      //  if(BoxItemComp.isloadResReady){
            this.propSprite.node.active = true
            this.propSprite.spriteFrame = new SpriteFrame();
           
            const t2d = GameSceneUIManager.getPropTex2d(propType)
            console.log("openBox===propType=="+propType.toString());
            console.log("openBox===propType name=="+t2d.name.toString());
            this.propSprite.spriteFrame.texture = t2d;
            this.propSprite.node.width = 25;
            this.propSprite.node.height = 25;
    //    }
        this.peopleItem.active = true;
        if(avatarURL!=null&&avatarURL!="")
             this.setAvatar(avatarURL);
        if(isMainPlayer)
            this.setIsCurrentPlayer(true);
    }
    private setIsCurrentPlayer(isCurrentPlayer: boolean) {
      //  this._isCurrentPlayer = isCurrentPlayer;
        // if(this._isCurrentPlayer){
        //     this.nameLabel.color = this.hexToColor("#FFC003");
           // this.circleSp.node.color = this.hexToColor("#FF9F04");
            this.setCircleColor(this.hexToColor("#FF9F04"));
       // }
    }

    private setCircleColor(color: Color) {
        this.circleSp.color = color;
        console.log("setcirclecolor=="+color);
    }

    hexToColor(hex: string): Color {
        hex = hex.replace(/^#/, '');
        if (hex.length === 6) {
            return new Color(
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16)
            );
        } else if (hex.length === 8) {
            return new Color(
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16),
                parseInt(hex.slice(6, 8), 16)
            );
        } else {
            throw new Error("Invalid hex color format");
        }
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
                this.avatarSp.spriteFrame = spriteFrame;
                // this.avatarSp.node.width = 47.47;
                // this.avatarSp.node.height = 72;
                //this.avatarSp.node.height = 72;
            });
        }catch(e){
            console.log("===set avatar==="+e);
        }
        }



    public closeBox(){
        this.openSprite.node.active = false;
        this.propSprite.node.active = false;
        this.peopleItem.active = false;
        // if(BoxItemComp.isloadResReady){
        //     this.node.getComponent(Sprite).spriteFrame = new SpriteFrame(BoxItemComp.iconBomb);
        // }
    }

    // public static loadT2dFromResources(propType:PropType){
    //     console.log("loadT2dFromResources==="+propType.toString());
    //     let iconName = "";
    //     switch(propType){
    //         case PropType.Bomb:{
    //             iconName = "props_boom";
    //         }
    //         case PropType.Zoom:{
    //             iconName = "props_mirror";
    //         }
    //         case PropType.Next:{
    //             iconName = "props_idontkown";
    //         }
    //         case PropType.Coin:{
    //             iconName = "props_glod";
    //         }
    //         case PropType.None:{
    //             iconName = "props_lucky";
    //         }
    //     }
    //     const imagePath = 'Icon/'+iconName+".png";
    //     resources.load(imagePath, Texture2D, (err, tex2d:Texture2D) => {
    //         if (err) {
    //            // error(err.message || err);
    //             console.log("error loadT2dFromResources==="+err.message);
    //             return;
    //         }
    //         switch(propType){
    //             case PropType.Bomb:{
    //                BoxItemComp.iconBomb = tex2d;
    //             }
    //             case PropType.Zoom:{
    //                 BoxItemComp.iconZoom = tex2d;
    //             }
    //             case PropType.Next:{
    //                 BoxItemComp.iconNext = tex2d;
    //             }
    //             case PropType.Coin:{
    //                 BoxItemComp.iconCoin = tex2d;
    //             }
    //             case PropType.None:{
    //                 BoxItemComp.iconLucky = tex2d;
    //             }
    //         }
    //         if(BoxItemComp.iconLucky!=null &&BoxItemComp.iconBomb!=null && BoxItemComp.iconZoom!=null && BoxItemComp.iconNext!=null && BoxItemComp.iconCoin!=null){
    //           //  this.init();
    //             BoxItemComp.isloadResReady = true;
    //             console.log("BoxItemComp.isloadResReady = true");
    //         }
    //         // 成功加载后，texture 是一个 cc.Texture2D 对象
    //        // this.onImageLoaded(texture);
    //     });
    // }

    update(deltaTime: number) {
        
    }
}

