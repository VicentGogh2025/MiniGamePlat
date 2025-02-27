import { _decorator, Component, Node, Button, Prefab, instantiate, resources, Label, Texture2D } from 'cc';
const { ccclass, property } = _decorator;
import { ChoosePropViewComp } from './ChoosePropViewComp';
import { networkEventTarget } from '../NetworkManager';
import { Bomb2dUnit } from './ServerClass/Bomb2dUnit';
import { JsonCMD } from './JsonCMD';
import { BoxItemComp } from './BoxItemComp';
import { DataWarehouse, PropType,GameData, DataWarehouseEventTarget} from './DataWarehouse';
import { PeopleItemComp } from './PeopleItemComp';
import { FinalWinnerTipViewComp } from './FinalWinnerTipViewComp';

@ccclass('GameSceneUIManager')
export class GameSceneUIManager extends Component {

    @property(Button)
    public magicPropsBtn: Button = null;
    @property(Node) bombGrid;
    @property(Node) playerGrid;
    @property(Prefab) boxItemPrefab;
    @property(Prefab) peopleItemPrefab;
    @property(Prefab) propsViewPrefab;

    @property(Prefab) finalWinnerTipViewPrefab;
    // private Bomb2dUnit[][] 
    @property(Label) bombLabel;
    @property(Label) coinsLabel;
    @property(Label) zoomPropLabel;
    @property(Label) nextPropLabel;
    @property(Label) coinPropLabel;
    @property(Label) playerCountLabel;
    @property(Label) allExistPropCountLabel;

    @property(Texture2D) bombTex2d;
    @property(Texture2D) zoomTex2d;
    @property(Texture2D) nextTex2d;
    @property(Texture2D) coinTex2d;
    @property(Texture2D) luckyTex2d;

    @property(Button) exitRoomBtn;

   // @property(Label) AllExistPropCountLabel;
    private Bomb2dArray: Bomb2dUnit[][];// = [];

    private bomb2dGridDict = new Map<Bomb2dUnit, BoxItemComp>();

    public static Instance: GameSceneUIManager;
    start() {
        GameSceneUIManager.Instance = this;
        // BoxItemComp.loadT2dFromResources(PropType.Bomb);
        // BoxItemComp.loadT2dFromResources(PropType.Coin);
        // BoxItemComp.loadT2dFromResources(PropType.Next);
        // BoxItemComp.loadT2dFromResources(PropType.Zoom);
        // BoxItemComp.loadT2dFromResources(PropType.None);
        // let propType = this.propTypeStr2PropType("Bomb");
        // console.log("start openBox===propType=="+propType.toString());
        this.exitRoomBtn.node.on('click', () => {
            console.log("===exitRoomBtn===");
            if(DataWarehouse.instance.isFailedThisTurn){
                location.reload();
            }else{
                
            }
           // this.popUpPropsView();
               //this.node.destroy();
           }, this);

        this.magicPropsBtn.node.on('click', () => {

         this.popUpPropsView();
            //this.node.destroy();
        }, this);
        this.Bomb2dArray = this.createBomb2dArray();
        this.initNetworkEvent();
        this.initGameData(DataWarehouse.instance.gameData);
        this.initPlayerSeats();
        this.updatePlayerSeatsSeq();

        DataWarehouseEventTarget.on(DataWarehouse.UpdateMainPlayerPropEvent,()=>{
           this.allExistPropCountLabel.string = DataWarehouse.instance.getMainPlayerAllPropCount().toString();
        });

        DataWarehouseEventTarget.on(DataWarehouse.UsingZoomPropEvent,(moveX,moveY,openedPropType)=>{

            let b2u:Bomb2dUnit = this.Bomb2dArray[moveX][moveY];
            let bc:BoxItemComp = this.bomb2dGridDict.get(b2u);
            bc.openBox(openedPropType,false,null);
            setTimeout(() => {
                bc.closeBox();
            }, 3000);
        });
    }

    // private choosePropViewNode:Node;
    // private popUpNewPropsView(){
    //    // if(this.choosePropViewNode==null){
    //         const cpvc = this.popUpPropsView();
    //         cpvc.initData(DataWarehouse.instance.getMainPlayerPropDataArray());
    //     //     this.choosePropViewNode = cpvc.node;
    //     // }
       

    // }

     public static getPropTex2d(propType:PropType):Texture2D{
            switch(propType){
                case PropType.Bomb:{
    
                   return GameSceneUIManager.Instance.bombTex2d;
                }
                case PropType.Zoom:{
                   // iconName = "props_mirror";
                    return GameSceneUIManager.Instance.zoomTex2d;
                }
                case PropType.Next:{
                   // iconName = "props_idontkown";
                    return GameSceneUIManager.Instance.nextTex2d;
                }
                case PropType.Coin:{
                    //iconName = "props_glod";
                    return GameSceneUIManager.Instance.coinTex2d;
                }
                case PropType.None:{
                    //iconName = "props_glod";
                    return GameSceneUIManager.Instance.luckyTex2d;
                }
            }
            return null;
        }

        initGameData(data: GameData) {
            console.log("initGameData===" + data);
            this.playerCountLabel.string = `${data.curBetCoins}$ (${data.curMaxPlayer}p)`;
            this.bombLabel.string = data.bombCount + "/" + data.maxBombCount;
            this.coinsLabel.string = DataWarehouse.instance.userDataGened.coins;
            this.zoomPropLabel.string = data.zoomPropCount + "/" + data.maxZoomPropCount;
            this.nextPropLabel.string = data.nextPropCount + "/" + data.maxNextPropCount;
            this.coinPropLabel.string = data.coinsPropCount + "/" + data.maxCoinsPropCount;
    
        }

    private initPlayerSeats(){
        console.log("gameSceneUI===initPlayerSeats===");
        const gameData = DataWarehouse.instance.gameData;
        Object.keys(gameData.playerDict).forEach(
            key => {
                console.log("sessionId===" + key);
                let playerObj = gameData.playerDict[key];
                //this.genPeopleItem2Seat(gameData, playerObj);
                const playerNode = instantiate(this.peopleItemPrefab) as Node;
            const pic = playerNode.getComponent(PeopleItemComp);
                pic.disableRightWrongNode();
                pic.setAvatar(playerObj.avatar);
                pic.setNickName(playerObj.name);
                let isCurPlayer = DataWarehouse.instance.gameData.curPlayerSessinId == playerObj.sessionId;
                pic.setIsCurrentPlayer(isCurPlayer);
                pic.sessionId = playerObj.sessionId;
                pic.seatSeq = playerObj.seatSeq;
                this.playerGrid.addChild(playerNode);
            });
    }

    private updatePlayerSeatsSeq() {
        const children = this.playerGrid.children;

        // 根据 seatSeq 属性对子节点进行排序
        children.sort((a, b) => {
            const aComp = a.getComponent('PeopleItemComp');
            const bComp = b.getComponent('PeopleItemComp');
            return aComp.seatSeq - bComp.seatSeq;
        });

        // 按照排序后的顺序重新添加子节点到父节点中
        children.forEach(child => {
            this.playerGrid.addChild(child);
        });
    }
    public static propsViewNode:Node;
    private popUpPropsView():ChoosePropViewComp {
         if (GameSceneUIManager.propsViewNode != null)
            return;
        //     this.propsViewPrefab = resources.get("Prefabs/ChoosePropView", Prefab);
        // }
        GameSceneUIManager.propsViewNode = instantiate(this.propsViewPrefab) as Node;

        this.node.addChild(GameSceneUIManager.propsViewNode);
        const cpvc = GameSceneUIManager.propsViewNode.getComponent(ChoosePropViewComp);
        cpvc.initData(DataWarehouse.instance.getMainPlayerPropDataArray());
        return cpvc;
    }
    createBomb2dArray(): Bomb2dUnit[][] {

        let array: Bomb2dUnit[][] = new Array(8).fill(0).map(() => new Array(8).fill(null));
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                array[i][j] = { propType: "None", moveX: i, moveY: j, userId: -1 };
                const biNode = instantiate(this.boxItemPrefab) as Node;
                this.bombGrid.addChild(biNode);
                const boxItemComp = biNode.getComponent(BoxItemComp);
                boxItemComp.moveX = i;
                boxItemComp.moveY = j;
                this.bomb2dGridDict.set(array[i][j], boxItemComp);
                // boxItemComp.initData(array[i][j]);
            }
        }

        // createProps()
        return array;
    }

    private findSeatBySessionId(sessionId: string): PeopleItemComp {
        const children = this.playerGrid.children;
        let pic:PeopleItemComp = null;
        children.forEach(child => {
            const peopleItemComp = child.getComponent(PeopleItemComp);
            console.log("peopleItemComp.sessionId===" + peopleItemComp.sessionId);
            if(peopleItemComp.sessionId == sessionId){
                console.log("findSeatBySessionId===finded" + sessionId);
                pic = peopleItemComp;
                return peopleItemComp;
            }
        });
        return pic;
    }

    // private getAllSeat(): PeopleItemComp[] {
    //     const children = this.playerGrid.children;
    //     let arr: PeopleItemComp[] = [];
    //     children.forEach(child => {
    //         const peopleItemComp = child.getComponent(PeopleItemComp);
    //         arr.push(peopleItemComp);
    //     });
    //     return arr;
    // }

    private setAllSeatCancelCountDownStatus(){
        const children = this.playerGrid.children;
        children.forEach(child => {
            const peopleItemComp = child.getComponent(PeopleItemComp);

         peopleItemComp.CancelCountDownTime();
        });
    }

    private cdPeopleItemComp:PeopleItemComp = null;
    private initNetworkEvent() {
        //   networkEventTarget.on(JsonCMD.CMD_S2C_playerMove,)
        networkEventTarget.on(JsonCMD.CMD_S2C_playerMove, (value) => {
            console.log("eventTarget on===" + JsonCMD.CMD_S2C_playerMove);
            let mX = value.moveX;
            let mY = value.moveY;
            let propTypeStr = value.propTypeStr;
            let b2u:Bomb2dUnit = this.Bomb2dArray[mX][mY];
            let bc:BoxItemComp = this.bomb2dGridDict.get(b2u);

            let propType = GameSceneUIManager.propTypeStr2PropType(value.propTypeStr);

            let sessionId = value.sessionId;
            let isCurPlayer = DataWarehouse.instance.gameData.curPlayerSessinId == sessionId;
            if(isCurPlayer&&propType==PropType.Bomb){
                DataWarehouse.instance.isFailedThisTurn = true;
            }
            if(isCurPlayer&&propType!=PropType.Bomb&&propType!=PropType.None){
                DataWarehouse.instance.addOneProp2MainPlayer(propType);
               // const propCount =   DataWarehouse.instance.getMainPlayerPropCount(propType)
            }
            let playerObj = DataWarehouse.instance.gameData.getPlayerObj(sessionId);
            bc.openBox(propType,isCurPlayer,playerObj.avatar);
            //todo 更新bomb2dArray
            //todo 更新bomb2dGridDict
            //todo loadinginto gamescene
            //director.loadScene("WaittingRoomScene");
        });

        networkEventTarget.on(JsonCMD.Server_Property_movingPlayerSessionId, (value) => {
            console.log("eventTarget on Server_Property_movingPlayerSessionId===" + JsonCMD.Server_Property_movingPlayerSessionId);
            this.setAllSeatCancelCountDownStatus();
            this.cdPeopleItemComp = this.findSeatBySessionId(value);
            console.log("eventTarget on findSeatBySessionId===" + value);
            let isCurPlayer = DataWarehouse.instance.gameData.curPlayerSessinId == value;
            if(isCurPlayer){
                GameSceneUIManager.startLocalTurn();
                let num:number = Number(this.allExistPropCountLabel.string);
                if(num>0)
                    this.popUpPropsView();
            }else{
                GameSceneUIManager.stopLocalTurn();
            }
            //todo 更新bomb2dArray
            //todo 更新bomb2dGridDict
            //todo loadinginto gamescene
            //director.loadScene("WaittingRoomScene");
  
        });

        networkEventTarget.on(JsonCMD.Server_Property_countDownTime, (value) => {
            console.log("every player countdown eventTarget on===" + value);
            if(this.cdPeopleItemComp!=null)
                this.cdPeopleItemComp.setCountDownTime(value);
            else
                console.log("cdPeopleItemComp is null");
        });
        //handler failed show player
        networkEventTarget.on(JsonCMD.Server_Property_playerStatus, (sessionId,status) => {
           // this.cdPeopleItemComp.setCountDownTime(value);
           let p:PeopleItemComp = this.findSeatBySessionId(sessionId);
            if(status==3)
                p.setFailed();
            console.log("every player countdown eventTarget on===" + status);
          //  this.countDownLabel.string = `做好准备，还有 ${value} 秒剩余`;
           // console.log("in waitting room eventTarget on===countdowntime" + value);
            //todo loadinginto gamescene
            //director.loadScene("WaittingRoomScene");
        });
        networkEventTarget.on(JsonCMD.CMD_S2C_gameOver, (winnerSessionId,rewardCoins) => {
            // this.cdPeopleItemComp.setCountDownTime(value);
            // let p:PeopleItemComp = this.findSeatBySessionId(winnerSessionId);
            //  if(status==3)
            //      p.setFailed();
            const finalWinnerTipViewNode = instantiate(this.finalWinnerTipViewPrefab) as Node;
            this.node.addChild(finalWinnerTipViewNode);
            const fwtv = finalWinnerTipViewNode.getComponent(FinalWinnerTipViewComp);
            const leftLosePSessionId = DataWarehouse.instance.gameData.getSessionIdWithNoWin(winnerSessionId);
            let p:PeopleItemComp = this.findSeatBySessionId(leftLosePSessionId);
                if(p!=null){
                    console.log("setfailed name===" + p.getNickName());
                    p.CancelCountDownTime();
                    p.setFailed();
                }
            const playerObj = DataWarehouse.instance.gameData.getPlayerObj(winnerSessionId);
            
            fwtv.setAvatar(playerObj.avatar);
            fwtv.setRewardCoins(rewardCoins);
            fwtv.setPlayerName(playerObj.name);
             console.log("CMD_S2C_gameOver eventTarget on===" + winnerSessionId+"|"+rewardCoins);
           //  this.countDownLabel.string = `做好准备，还有 ${value} 秒剩余`;
            // console.log("in waitting room eventTarget on===countdowntime" + value);
             //todo loadinginto gamescene
             //director.loadScene("WaittingRoomScene");
         });
         //handler failed show player
        //  networkEventTarget.on(JsonCMD.Server_Property_playerStatus, (sessionId,status) => {

        //     let p:PeopleItemComp = this.findSeatBySessionId(sessionId);
        //      if(status==3)
        //          p.setFailed();
        //      console.log("every player countdown eventTarget on===" + status);

        //  });
         networkEventTarget.on(JsonCMD.Server_Property_bombCount, (value) => {

            DataWarehouse.instance.gameData.bombCount = DataWarehouse.instance.gameData.maxBombCount-value;
            this.bombLabel.string = DataWarehouse.instance.gameData.bombCount + "/" + DataWarehouse.instance.gameData.maxBombCount;

         });
         networkEventTarget.on(JsonCMD.Server_Property_coinPropCount, (value) => {
            // this.cdPeopleItemComp.setCountDownTime(value);
            DataWarehouse.instance.gameData.coinsPropCount = DataWarehouse.instance.gameData.maxCoinsPropCount - value;
            const data =  DataWarehouse.instance.gameData;
            this.coinPropLabel.string = data.coinsPropCount + "/" + data.maxCoinsPropCount;

         });
         networkEventTarget.on(JsonCMD.Server_Property_nextPropCount, (value) => {
            // this.cdPeopleItemComp.setCountDownTime(value);
            const data =  DataWarehouse.instance.gameData;
            data.nextPropCount = data.maxNextPropCount - value;
            this.nextPropLabel.string = data.nextPropCount + "/" + data.maxNextPropCount;

         });
         networkEventTarget.on(JsonCMD.Server_Property_zoomPropCount, (value) => {
            // this.cdPeopleItemComp.setCountDownTime(value);
            const data =  DataWarehouse.instance.gameData;
            data.zoomPropCount = data.maxZoomPropCount - value;
   
            this.zoomPropLabel.string = data.zoomPropCount + "/" + data.maxZoomPropCount;

         });
    }

    public static isAllowSel:boolean;
    public static startLocalTurn(){
        GameSceneUIManager.isAllowSel = true;
       

    }

    public static stopLocalTurn(){
        GameSceneUIManager.isAllowSel = false;
    }

    public static propTypeStr2PropType(propTypeStr:string):PropType{
        if(PropType.Bomb.toString()==propTypeStr)
            return PropType.Bomb;
        if(PropType.Coin.toString()==propTypeStr)
            return PropType.Coin;

        if(PropType.Next.toString()==propTypeStr)
            return PropType.Next;

        if(PropType.None.toString()==propTypeStr)
            return PropType.None;

        if(PropType.Zoom.toString()==propTypeStr)
            return PropType.Zoom;

        return PropType.None;
    }

    // private popUpPropsView() {
    //     const propsViewNode = instantiate(this.propsViewPrefab) as Node;
    //     this.node.addChild(propsViewNode);
    //     const propsView = propsViewNode.getComponent(ChoosePropViewComp);
    //     //propsView.initData();
    // }


    update(deltaTime: number) {

    }
}

