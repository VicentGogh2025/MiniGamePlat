import { _decorator, Button, Component, Label, Node, Sprite,EventTarget,SpriteFrame, Texture2D,Color} from 'cc';
const { ccclass, property } = _decorator;
import { DataWarehouse,PropType,PropData} from './DataWarehouse';
import { BoxItemComp } from './BoxItemComp';
import { GameSceneUIManager } from './GameSceneUIManager';
const selectPropItemEventTarget = new EventTarget();
@ccclass('SelectPropItemComp')
export class SelectPropItemComp extends Component {

    @property(Sprite) propBg;
    @property(Label) countLabel;
    @property(Button) selectBtn;
    @property(Sprite) colorBg;
   // @property(Button) closeBtn;

    private _curPropType:PropType = PropType.None;
    private _curPropCount:number = 0;

    private _originBgColor:Color;//= new Color(255,255,255,255);
    //private _selectBgColor:Color = new Color(255,255,255,255);
    start() {
        this._originBgColor = this.colorBg.color;
        this.selectBtn.node.on('click', ()=>{
           // this.popUpTipViewMatching(50,5);
           selectPropItemEventTarget.emit('selectPropItemEvent',this._curPropType);
           console.log("===selectPropItemEvent==="+this._curPropType);
         //  this.colorBg.color = Color.GREEN;
          
        });

        // this.closeBtn.node.on('click', ()=>{
        //     // this.popUpTipViewMatching(50,5);
        //     this.node.destroy();
        // }, this);
    }

    public select(){
        this.colorBg.color = Color.GREEN;
    }

    public unSelect(){

        this.resetBgColor();
    }

    public resetBgColor(){
        this.colorBg.color =  new Color(255,220,105,255);
    }

    public initData(pd:PropData){
        this._curPropType = pd.propType;

        // this.propBg.spriteFrame = new SpriteFrame();
         console.log("===propType===",pd.propType);
      //  let t2d:Texture2D = GameSceneUIManager.getPropTex2d(pd.propType);
       // console.log("===propType===t2d==",t2d);
        // const spriteFrame = new SpriteFrame();
        // spriteFrame.texture = t2d;
        // this.propBg.spriteFrame  = spriteFrame;

        const t2d = GameSceneUIManager.getPropTex2d(pd.propType)
        // console.log("openBox===propType=="+propType.toString());
        // console.log("openBox===propType name=="+t2d.name.toString());
        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = t2d;
        this.propBg.spriteFrame = spriteFrame;
        // this.propSprite.node.width = 25;
        // this.propSprite.node.height = 25;
        this.setPropCount(pd.propCount);
    }

    public setPropCount( count:number){
        this._curPropCount = count;
        this.countLabel.string = "x"+this._curPropCount.toString();
    }

    public getPropCount():number{
        return this._curPropCount;
    }

    public getPropType():PropType{
        return this._curPropType;
    }

    update(deltaTime: number) {
        
    }
}

export { selectPropItemEventTarget };