import { _decorator, Component, director, Node,sys,EventTarget } from 'cc';
import {UserData} from './GenJson/UserDataGened';
import { networkEventTarget } from '../NetworkManager';
import { JsonCMD } from './JsonCMD';
import { NetworkManager } from '../NetworkManager';
import { GameSceneUIManager } from './GameSceneUIManager';
//var GlobalData = require("GlobalData");
//import { GlobalData } from './GlobalData';
const DataWarehouseEventTarget = new EventTarget();
const { ccclass, property } = _decorator;
export enum PropType{
    None="None",
    Bomb="Bomb",
    Zoom="Zoom",
    Next="Next",
    Coin="Coin"
};
// export enum PropType{
//     None,
//     Zoom,
//     Next,
//     Coin
// };
@ccclass('DataWarehouse')
export class DataWarehouse extends Component {
    private static _instance:DataWarehouse;
    public static get instance():DataWarehouse{
        return this._instance;
    }
    private UserDataJson:any;
    public userDataGened:UserData;

    public gameData:GameData;

    private _countDownTime:number = 0;
    private dk:string;// = "userData";

    private mainPlayerPropMap = new Map<PropType,number>();

    public static UpdateMainPlayerPropEvent = 'UpdateMainPlayerPropEvent';
    public static UsingZoomPropEvent = 'UsingZoomPropEvent';

    public static startZoom:boolean = false;

    public isFailedThisTurn:boolean = false;
    start() {
        this.init();
        this.dk = this.getQueryParam('uk');
        console.log("dataKey=="+this.dk);
        var userDataStr = localStorage.getItem(this.dk);
        console.log("userDataStr=="+userDataStr);
         this.UserDataJson = JSON.parse(userDataStr);
         this.userDataGened = UserData.fromJSON(this.UserDataJson)
         console.log("UserId==="+this.userDataGened.id);

         this.gameData = new GameData();

         networkEventTarget.on(JsonCMD.CMD_S2C_usingProp,(jsonObj) => {
            console.log("datawarehouse eventTarget on===" + JsonCMD.CMD_S2C_usingProp);
            //let propType = jsonObj.propTypeStr;
            let targetPropType = GameSceneUIManager.propTypeStr2PropType(jsonObj.targetPropTypeStr);
            this.usingOnePropForMainPlayer(targetPropType);

            if(targetPropType == PropType.Next)   
                return;

            console.log("===prop is not next passed===")
            let moveX= 0;
            let moveY = 0;
            if("moveX" in jsonObj)
                moveX = jsonObj.moveX;
            if("moveY" in jsonObj)
                moveY = jsonObj.moveY;
             //    moveY = jsonObj.moveY;
             let openedPropType:PropType = PropType.None;
             if("openedPropTypeStr" in jsonObj)
                 openedPropType = GameSceneUIManager.propTypeStr2PropType(jsonObj.openedPropTypeStr);
            DataWarehouseEventTarget.emit(DataWarehouse.UsingZoomPropEvent,moveX,moveY,openedPropType);
        });

    }



    public addOneProp2MainPlayer(propType:PropType){
        if(this.mainPlayerPropMap.has(propType)){
            let count = this.mainPlayerPropMap.get(propType);
            this.mainPlayerPropMap.set(propType,count+1);
        }else{
            this.mainPlayerPropMap.set(propType,1);
        }
        DataWarehouseEventTarget.emit(DataWarehouse.UpdateMainPlayerPropEvent);
    }

    public usingOnePropForMainPlayer(propType:PropType){
        if(this.mainPlayerPropMap.has(propType)){
            let count = this.mainPlayerPropMap.get(propType);
            if(count<=0){
                return;
            }
            this.mainPlayerPropMap.set(propType,count-1);
            if(count-1<=0)
                this.mainPlayerPropMap.delete(propType);
        }
        DataWarehouseEventTarget.emit(DataWarehouse.UpdateMainPlayerPropEvent);
    }

    public requestUsingOnePropForMainPlayer(propType:PropType){
        let jsonStr = JsonCMD.C2S_usingProp(propType);
        NetworkManager.instance.sendMsg2Server(jsonStr);
    }

    public requestUsingOneZoomPropForMainPlayer(moveX,moveY){
        let jsonStr = JsonCMD.C2S_usingPropZoom(PropType.Zoom,moveX,moveY);
        NetworkManager.instance.sendMsg2Server(jsonStr);
        console.log("requestUsingOneZoomPropForMainPlayer==="+jsonStr);
    }

    public getMainPlayerPropCount(propType:PropType):number{
        if(this.mainPlayerPropMap.has(propType)){
            return this.mainPlayerPropMap.get(propType);
        }
        return 0;
    }

    public getMainPlayerPropDataArray():PropData[]{
        let propDataArray = new Array<PropData>();
        for(let key of this.mainPlayerPropMap.keys()){
            propDataArray.push(new PropData(key,this.mainPlayerPropMap.get(key)));
        }
       
        return propDataArray;
    }

    public getMainPlayerAllPropCount():number{
        let count = 0;
        this.mainPlayerPropMap.forEach((value,key)=>{
            count += value;
        });
        return count;
    }



    public updateUserData2LocalStorage(){
        const updatedStr = this.userDataGened.toJSON();
        localStorage.setItem(this.dk,updatedStr);
    }

    public static resetInstance(){
        DataWarehouse._instance = null;
    }

    get countDownTime():number{
        return this._countDownTime
    }

    set countDownTime(value:number){
        this._countDownTime = value;
        
    }

    private init(){
        if(!DataWarehouse.instance){
            DataWarehouse._instance = this;
            director.addPersistRootNode(this.node);
        }
    }

    private getQueryParam(param):string {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    onDestory(){
        this.myDestroy();
    }

    public myDestroy(): void {
        if (DataWarehouse.instance == this) {
            DataWarehouse._instance = null;
            this.node.destroy();
        }
    }

    update(deltaTime: number) {
        
    }
}
export class PropData{
    public propType:PropType;
    public propCount:number;
    constructor(propType:PropType,propCount:number){
        this.propType = propType;
        this.propCount = propCount;
    }
}
export class GameData{
    public maxBombCount:number = 10;
    public maxZoomPropCount = 2;
    public maxNextPropCount = 2;
    public maxCoinsPropCount = 1;

    public bombCount:number = this.maxBombCount;
    public zoomPropCount = this.maxZoomPropCount;
    public nextPropCount = this.maxNextPropCount;
    public coinsPropCount = this.maxCoinsPropCount;

    //public playerDict: { [key: string]: any } = {};
    public playerDict = new Map<string, any>();
    public curPlayerSessinId:string;
    public curBetCoins:number;
    public curMaxPlayer:number;
    public addPlayerObj(sessionId,playerObj:any){
        this.playerDict[sessionId] = playerObj;
    }

    public getPlayerObj(sessionId){
        return this.playerDict[sessionId];
    }

    public getSessionIdWithNoWin(winnerSessionId:string):string{
        let keys = Object.keys(this.playerDict);
        for (const key of keys) {
            const po = this.getPlayerObj(key);
            console.log("po.name=="+po.name);
            console.log("po.status=="+po.status);
            if (key != winnerSessionId && po.status != 2&&po.status != 3) {
                return key;
            }
        }
       console.log("getSessionIdWithNoWin === no sessionId found");
        return "";
    }

    public removePlayerObj(sessionId){
    
        this.playerDict.delete(sessionId);
        
    }

    public removeAllPlayerObj(){
        this.playerDict.clear();
        // let keys = Object.keys(this.playerDict);
        // for (const key of keys) {
        //     this.removePlayerObj(key);
        // }
    }


}
export { DataWarehouseEventTarget };
