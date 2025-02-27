import { _decorator, Component, Node, Label, Button, EventTarget, resources, Prefab, instantiate,director } from 'cc';
import { JsonCMD } from './JsonCMD';
import { DataWarehouse, GameData } from './DataWarehouse';
import { PeopleItemComp } from './PeopleItemComp';
import { NetworkManager } from '../NetworkManager';
import { networkEventTarget } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('WaittingRoomSceneUIManager')
export class WaittingRoomSceneUIManager extends Component {
    @property(Label) bombLabel;
    @property(Label) coinsLabel;
    @property(Label) zoomPropLabel;
    @property(Label) nextPropLabel;
    @property(Label) coinPropLabel;

    @property(Label) titleLabel;
    @property(Label) countDownLabel;

    @property(Node) playerItemGridNode;

    @property(Button) readyBtn;

    @property(Button) back2MainBtn;

    private PeopleItemPrefab: Prefab;
    private isReady:boolean = false;
    start() {
        // resources.load('Prefabs/PeopleItem', (err, prefab: Prefab) => {
        //     if (err) {
        //         console.error(err);
        //         return;
        //     }

        //     this.PeopleItemPrefab = prefab;
        //    // this.initPlayerSeats();
        //    const piNode = instantiate(this.PeopleItemPrefab) as Node;
        //    this.playerItemGridNode.addChild(piNode);
        //    const peopleItemComp = piNode.getComponent(PeopleItemComp);
        //   // peopleItemComp.setAvatar(playerObj.avatar);
        //    peopleItemComp.sessionId = "";
        //    peopleItemComp.seatSeq = 1;
        //    peopleItemComp.setNickName("test");
        //  //  peopleItemComp.setReady(false);
        //    peopleItemComp.setIsCurrentPlayer(true);
        //    peopleItemComp.setReady(true);
        //     console.log("load===PeopleItemPrefab");
        // });
      
        // return;
        this.initEventTarget();
        this.initGameData(DataWarehouse.instance.gameData);

        resources.load('Prefabs/PeopleItem', (err, prefab: Prefab) => {
            if (err) {
                console.error(err);
                return;
            }

            this.PeopleItemPrefab = prefab;
            this.initPlayerSeats();
            console.log("load===PeopleItemPrefab");
        });
       
        this.readyBtn.node.on('click', () => {
            this.isReady = !this.isReady;
            this.readyBtn
            let jsonStr = JsonCMD.C2S_isReady(this.isReady);
            NetworkManager.instance.sendMsg2Server(jsonStr);
            // this.popUpTipViewMatching(10,5);
            const labelNode = this.readyBtn.node.getChildByName('Label');
            if (labelNode) {
                const label = labelNode.getComponent(Label);
                if (label) {
                    label.string = this.isReady ? '取消准备' : '准备好了';
                }
            }
        });

        // this.readyBtn.      
    }

    initGameData(data: GameData) {
        console.log("initGameData===" + data);
        this.titleLabel.string = `${data.curBetCoins}$ (${data.curMaxPlayer}p)`;
        this.bombLabel.string = data.bombCount + "/" + data.maxBombCount;
        this.coinsLabel.string = DataWarehouse.instance.userDataGened.coins;
        this.zoomPropLabel.string = data.zoomPropCount + "/" + data.maxZoomPropCount;
        this.nextPropLabel.string = data.nextPropCount + "/" + data.maxNextPropCount;
        this.coinPropLabel.string = data.nextPropCount + "/" + data.maxNextPropCount;

    }

    initPlayerSeats() {
        let gameData = DataWarehouse.instance.gameData;
        
        Object.keys(gameData.playerDict).forEach(
            key => {
                console.log("sessionId===" + key);
                let playerObj = gameData.playerDict[key];
                this.genPeopleItem2Seat(gameData, playerObj);
            });
        this.updatePlayerSeatsSeq();
    }

    private genPeopleItem2Seat(gameData:GameData, playerObj) {
        const piNode = instantiate(this.PeopleItemPrefab) as Node;
        this.playerItemGridNode.addChild(piNode);
        const peopleItemComp = piNode.getComponent(PeopleItemComp);
        peopleItemComp.setAvatar(playerObj.avatar);
        peopleItemComp.sessionId = playerObj.sessionId;
        peopleItemComp.seatSeq = playerObj.seatSeq;
        peopleItemComp.setNickName(playerObj.name);
        if (gameData.curPlayerSessinId == playerObj.sessionId) {
            peopleItemComp.setIsCurrentPlayer(true);
            peopleItemComp.setReady(false);
            console.log("===set currentplayer=="+gameData.curPlayerSessinId);
        } else {
            peopleItemComp.setReady(playerObj.isReady);
            console.log("===set anotherplayer=="+playerObj.isReady);
        }
    }

    private updatePlayerSeatsSeq() {
        const children = this.playerItemGridNode.children;

        // 根据 seatSeq 属性对子节点进行排序
        children.sort((a, b) => {
            const aComp = a.getComponent('PeopleItemComp');
            const bComp = b.getComponent('PeopleItemComp');
            return aComp.seatSeq - bComp.seatSeq;
        });

        // 按照排序后的顺序重新添加子节点到父节点中
        children.forEach(child => {
            this.playerItemGridNode.addChild(child);
        });
    }

    initEventTarget() {
        networkEventTarget.on(JsonCMD.CMD_S2C_allReady, (event) => {
            console.log("eventTarget on===" + JsonCMD.CMD_S2C_allReady);
            //todo loadinginto gamescene
            //director.loadScene("WaittingRoomScene");
            director.loadScene("GameScene");
        });
        networkEventTarget.on(JsonCMD.Server_Property_countDownTime, (value) => {
           console.log("eventTarget on waittingRoomScene===countdowntime" + value);
            if(this.countDownLabel!=null)
                this.countDownLabel.string = `做好准备，还有 ${value} 秒剩余`;
           // console.log("in waitting room eventTarget on===countdowntime" + value);
            //todo loadinginto gamescene
            //director.loadScene("WaittingRoomScene");
        });

        networkEventTarget.on(JsonCMD.Server_Property_playersIn, (playerObj) => {
            console.log("eventTarget on===" + JsonCMD.Server_Property_playersIn);
            this.genPeopleItem2Seat(DataWarehouse.instance.gameData, playerObj);
            this.updatePlayerSeatsSeq();
            //   this.countDownLabel.text = `做好准备，还有 ${value} 秒剩余`;
            //todo loadinginto gamescene
            //director.loadScene("WaittingRoomScene");
        });

        networkEventTarget.on(JsonCMD.Server_Property_playersOut, (playerObj) => {
            console.log("eventTarget on===" + JsonCMD.Server_Property_playersOut);
            const children = this.playerItemGridNode.children;
            let tChild;
            children.forEach(child => {
                const pic = child.getComponent('PeopleItemComp');
                if (pic.sessionId == playerObj.sessionId) {
                    tChild = child;
                    return;
                }

            });
            this.playerItemGridNode.remove(tChild);
            this.updatePlayerSeatsSeq();
            //   this.countDownLabel.text = `做好准备，还有 ${value} 秒剩余`;
            //todo loadinginto gamescene
            //director.loadScene("WaittingRoomScene");
        });

        networkEventTarget.on(JsonCMD.Server_Property_isReady, (sessionId,ifReady) => {
            const children = this.playerItemGridNode.children;
            let tChild;
            children.forEach(child => {
                const pic = child.getComponent('PeopleItemComp');
                if (pic.sessionId == sessionId) {
                    tChild = child;
                    pic.setReady(ifReady);
                    return;
                }

            });

            networkEventTarget.on(JsonCMD.CMD_S2C_startGameFailed, () => {
                director.loadScene("MainScene");
    
                });
            //   this.countDownLabel.text = `做好准备，还有 ${value} 秒剩余`;
            //todo loadinginto gamescene
            //director.loadScene("WaittingRoomScene");
        });

    }

    update(deltaTime: number) {

    }
}

