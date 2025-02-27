import { _decorator, Component, Node,Button, Label, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;
import { DataWarehouse,PropType,PropData } from './DataWarehouse';
import { SelectPropItemComp,selectPropItemEventTarget } from './SelectPropItemComp';
import { GameSceneUIManager } from './GameSceneUIManager';
@ccclass('ChoosePropViewComp')
export class ChoosePropViewComp extends Component {
     @property(Button) closeBtn;
     @property(Button) confirmBtn;
     @property(Node) grid;
    @property(Label) descLabel;
     private curSelPropType:PropType = PropType.None;

     @property(Prefab) selectPropItemPrefab:Prefab;
    start() {
       // this.initData
        this.closeBtn.node.on('click', () => {
            GameSceneUIManager.propsViewNode = null;
            this.node.destroy();
        }, this);

        this.confirmBtn.node.on('click', () => {
           //todo 加入使用道具的方法
           if(this.curSelPropType == PropType.Next){
            DataWarehouse.instance.requestUsingOnePropForMainPlayer(this.curSelPropType);
              
           }else if(this.curSelPropType == PropType.Zoom){
             DataWarehouse.startZoom = true;
           }
           GameSceneUIManager.propsViewNode = null;
           this.node.destroy();
        }, this);
    }

    protected onDestroy(): void {
        selectPropItemEventTarget.off('selectPropItemEvent');
    }
    
    public initData(propdataList:PropData[]){
     propdataList.forEach((propData:PropData)=>{

        const siNode =  instantiate(this.selectPropItemPrefab) as Node;
        siNode.getComponent(SelectPropItemComp).initData(propData);
    //     let propItem = new Node();
    //    let spic = propItem.addComponent(SelectPropItemComp);
    //    spic.initData(propData);
       selectPropItemEventTarget.on('selectPropItemEvent',(propType:PropType)=>{
        console.log('selectPropItem',propType);
        this.curSelPropType = propType;
        this.updateDesc();
        this.resetSelectPropComp(propType);
        // console.log("selectPropItem===="+pro)
      //  this.node.emit('selectPropItem',propType);
      //  this.node.destroy();
       },this);
        //propItem.getComponent(SelectPropItemComp).initData(propData);
        this.grid.addChild(siNode);
     });

    }

        updateDesc(){
        switch(this.curSelPropType){
            case PropType.Bomb:{
                this.descLabel.string = "炸弹";
                break;
            }
            case PropType.Zoom:{
                this.descLabel.string = "放大镜";
                break;
            }
            case PropType.Next:{
                this.descLabel.string = "跳过";
                break;
            }
            case PropType.Coin:{
                this.descLabel.string = "金币";
                break;
            }
        }
        //descLabel.string = 
    }

    public resetSelectPropComp(selectedPropType:PropType){
        this.grid.children.forEach((child:Node)=>{
            let spic = child.getComponent(SelectPropItemComp);
            if(spic.getPropType() == selectedPropType){
                spic.select();
                console.log("reset selectPropItem===="+selectedPropType);
            }else{
                spic.unSelect();
                console.log("reset unselectPropItem===="+spic.getPropType());
            }
        });

    }

    update(deltaTime: number) {
        
    }
}

