import { _decorator, Component, Node, EventTarget } from 'cc';
const { ccclass, property } = _decorator;
const networkEventTarget = new EventTarget();
import Colyseus, { Client } from 'db://colyseus-sdk/colyseus.js';
import { UserData } from './Scripts/GenJson/UserDataGened';
import { DataWarehouse } from './Scripts/DataWarehouse';
import { JsonCMD } from './Scripts/JsonCMD';

@ccclass('NetworkManager')
export class NetworkManager extends Component {
    @property hostname = "localhost";
    @property port = 2567;
    @property useSSL = false;

    @property localDebug = true;


    client!: Colyseus.Client;
    room!: Colyseus.Room;
    private static _instance: NetworkManager;
    public static get instance(): NetworkManager {
        return this._instance;
    }
    start() {
        console.log("===NetworkManager start===");
       // this.hostname = location.hostname;
        this.init();
        // Instantiate Colyseus Client
        // connects into (ws|wss)://hostname[:port]
        //this.client = new Colyseus.Client(`${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443, 80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`);

        // Connect into the room
        // this.connect();
    }

    private init() {
        if (!NetworkManager.instance) {
            NetworkManager._instance = this;

        }
    }

    public static resetInstance(){
        NetworkManager._instance = null;
    }

    public selectRoom(maxClients: number, coins: number) {
        let u: UserData = DataWarehouse.instance.userDataGened;
        // if(maxClients==5){
       // this.client = new Colyseus.Client(`${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443, 80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`);
        
        this.connect({ "userName": u.nickname, "userId": u.id, "betCoins": coins, "maxClients": maxClients, "avatar": u.avatar,"coins":u.coins });
        // }else if(maxClients==10){
        //     this.connect(maxClients,{userName:u.nickname,userId:u.id});
        // }
    }

    public leaveRoom() {
        this.room.leave();
    }

    public sendMsg2Server(jsonStr: string) {
        this.room.send("C2S", jsonStr);
    }

    public disconnect(){
        this.room.leave(false);
    }

    async connect(jsonObject: any) {
        try {
           // const url = "ws://localhost:2567";
           let url = `${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443, 80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`;
            url +=":"+this.port;

            if(this.localDebug){
                url ="ws://localhost:2567";
            }
            console.log("ws url =="+url);
            console.log("hostname =="+this.hostname);
            this.client = new Colyseus.Client(url);
            
            //this.client = new Colyseus.Client(url);
            this.room = await this.client.joinOrCreate("roomAuto", jsonObject);
            DataWarehouse.instance.gameData.curPlayerSessinId = this.room.sessionId;
            DataWarehouse.instance.gameData.curBetCoins = jsonObject.betCoins;
            DataWarehouse.instance.gameData.curMaxPlayer = jsonObject.maxClients;

            console.log("joined successfully!");
            console.log("user's sessionId:", this.room.sessionId);

            // this.room.onStateChange((state) => {
            //     console.log("onStateChange: ", state);
            //     this.room.state.countD
            // });


            this.room.state.listen("countDownTime",(cdTime:number)=>{
                console.log("countDownTime=="+cdTime);
                networkEventTarget.emit(JsonCMD.Server_Property_countDownTime, cdTime);

            });

            this.room.state.listen(JsonCMD.Server_Property_movingPlayerSessionId,(curPlayerSessionId:number)=>{
                console.log("curPlayerUserId change to=="+curPlayerSessionId);
                networkEventTarget.emit(JsonCMD.Server_Property_movingPlayerSessionId, curPlayerSessionId);

            });

            this.room.state.listen(JsonCMD.Server_Property_coinPropCount,(value:number)=>{
                console.log("Server_Property_coinPropCount change to=="+value);
                networkEventTarget.emit(JsonCMD.Server_Property_coinPropCount, value);

            });
            this.room.state.listen(JsonCMD.Server_Property_bombCount,(value:number)=>{
                console.log("Server_Property_bombCount change to=="+value);
                networkEventTarget.emit(JsonCMD.Server_Property_bombCount, value);

            });
            this.room.state.listen(JsonCMD.Server_Property_nextPropCount,(value:number)=>{
                console.log("Server_Property_nextPropCount change to=="+value);
                networkEventTarget.emit(JsonCMD.Server_Property_nextPropCount, value);

            });
            this.room.state.listen(JsonCMD.Server_Property_zoomPropCount,(value:number)=>{
                console.log("Server_Property_zoomPropCount change to=="+value);
                networkEventTarget.emit(JsonCMD.Server_Property_zoomPropCount, value);

            });
            


            this.room.state.players.onAdd((player, key) => {
                console.log(player, "has been added at", key);
                DataWarehouse.instance.gameData.addPlayerObj(key, player);
                networkEventTarget.emit(JsonCMD.Server_Property_playersIn, player);
                player.listen("isReady", (value, previousValue) => {
                     console.log("isReady",value);
                    // console.log(previousValue);
                    networkEventTarget.emit(JsonCMD.Server_Property_isReady, player.sessionId, player.isReady);
                });

                player.listen("status", (value, previousValue) => {
                    console.log("status",value);
                   // console.log(previousValue);
                   networkEventTarget.emit(JsonCMD.Server_Property_playerStatus, player.sessionId, value);
               });

               player.listen("coins", (value) => {
                console.log("my conis change to:",value);//get newer coins value and update localstorage
                DataWarehouse.instance.userDataGened.coins = value;
               // console.log(previousValue);
              // networkEventTarget.emit(JsonCMD.Server_Property_playerStatus, player.sessionId, value);
           });
                //    console.log("on add Player joined:", sessionId, player,player.userId,player.name);

            });

            this.room.state.players.onRemove((player, key) => {
                console.log(player, "has been removed at", key);
                DataWarehouse.instance.gameData.removePlayerObj(key);
                networkEventTarget.emit(JsonCMD.Server_Property_playersOut, player);
            });
            this.room.onMessage("S2C", (message) => {
                console.log("Received message from server:", message);
                const jsonObj = JSON.parse(message);
                console.log("excute==" + jsonObj.cmd);
                if (jsonObj.cmd == JsonCMD.CMD_S2C_allReady) {
                    console.log("excute S2C_allReady");
                    networkEventTarget.emit(jsonObj.cmd);
                } else
                    if (jsonObj.cmd == JsonCMD.CMD_S2C_allMached) {
                        console.log("excute " + JsonCMD.CMD_S2C_allMached);
                        networkEventTarget.emit(jsonObj.cmd);
                    }else if(jsonObj.cmd == JsonCMD.CMD_S2C_playerMove){
                        console.log("excute " + JsonCMD.CMD_S2C_playerMove);
                        networkEventTarget.emit(jsonObj.cmd,jsonObj);
                    }else if(jsonObj.cmd == JsonCMD.CMD_S2C_gameOver){
                        console.log("excute " + JsonCMD.CMD_S2C_gameOver);
                        const sessionId = jsonObj.sessionId;
                        const rewardCoins = jsonObj.rewardCoins;
                        networkEventTarget.emit(jsonObj.cmd,sessionId,rewardCoins);
                    }else if(jsonObj.cmd == JsonCMD.CMD_S2C_startGameFailed){
                        console.log("excute " + JsonCMD.CMD_S2C_startGameFailed);
                        networkEventTarget.emit(jsonObj.cmd);
                    }else if(jsonObj.cmd == JsonCMD.CMD_S2C_usingProp){
                        console.log("excute " + JsonCMD.CMD_S2C_usingProp);

                        networkEventTarget.emit(jsonObj.cmd,jsonObj);
                    }
            });



            this.room.onLeave((code) => {
                console.log("onLeave:", code);
            });

            // this.room.state.countDownTime.onChange = (value, previousValue) => {
            //     console.log("countDownTime changed:", value);
            //     networkEventTarget.emit(JsonCMD.Server_Property_countDownTime, value);
            // }

        } catch (e) {
            console.error(e);
        }
    }
}
export { networkEventTarget };