import { _decorator, Component, Node, resources,instantiate, Prefab, Button,EventTarget,director } from 'cc';
import { TipViewMatching } from './TipViewMatching';
import { NetworkManager } from '../NetworkManager';
import { networkEventTarget } from '../NetworkManager';
import { JsonCMD } from './JsonCMD';
const { ccclass, property } = _decorator;

@ccclass('MainSceneUIManager')
export class MainSceneUIManager extends Component {
    @property(Button) p10_5Btn;
    @property(Button) p10_10Btn;
    @property(Button) p30_5Btn;
    @property(Button) p30_10Btn;
    @property(Button) p50_5Btn;
    @property(Button) p50_10Btn;
    @property(Button) personalCenterBtn;
    private tipViewMatchingPrefab:Prefab;
    start() {
        resources.load('Prefabs/TipView', (err, prefab:Prefab) => {
            if (err) {
                console.error(err);
                return;
            }

            this.tipViewMatchingPrefab = prefab;
            console.log("==="+this.tipViewMatchingPrefab)
        })

        this.p10_5Btn.node.on('click', ()=>{
            this.popUpTipViewMatching(10,5);
        });
        this.p10_10Btn.node.on('click', ()=>{
            this.popUpTipViewMatching(10,10);
        });
        this.p30_5Btn.node.on('click', ()=>{
            this.popUpTipViewMatching(30,5);
        });
        this.p30_10Btn.node.on('click', ()=>{
            this.popUpTipViewMatching(30,10);
        });
        this.p50_5Btn.node.on('click', ()=>{
            this.popUpTipViewMatching(50,5);
        });
        this.p50_10Btn.node.on('click', ()=>{
            this.popUpTipViewMatching(50,10);
        });
        this.personalCenterBtn.node.on('click', ()=>{
           // this.popUpTipViewMatching(50,10);
           console.log("personalCenterBtn");
           location.href = "../../personalCenter/personalCenter.html";
        });

        networkEventTarget.on(JsonCMD.CMD_S2C_allMached, (event) => {
            console.log("main scene ui eventTarget on==="+JsonCMD.CMD_S2C_allMached);
             director.loadScene("WaittingRoomScene");
        });
    }

    private popUpTipViewMatching(cost: number,p: number){ 
        NetworkManager.instance.selectRoom(p,cost);
        const tipViewMatchingNode = instantiate(this.tipViewMatchingPrefab) as Node;
        this.node.addChild(tipViewMatchingNode);
        const tipViewMatching =  tipViewMatchingNode.getComponent(TipViewMatching);
        tipViewMatching.peopleTf.string = "【"+p+" - 人】";
        tipViewMatching.costTf.string = "入场费 "+cost+" $";
    }

    update(deltaTime: number) {
        
    }
}

