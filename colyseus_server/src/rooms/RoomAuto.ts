import { Room, Client, Delayed } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Player } from "./schema/MyRoomState";
import { RobotPlayerManager } from "./RobotPlayerManager";

export class RoomAuto extends Room<MyRoomState> {
  maxClients = 5;
  betCoins = 10;
  playerGlobalReadyTime: number = 30;
  playerMatchTime: number = 5;
  playerMoveCDTime = 10;
  currentGamePhrase = 1;//1 is waiting for player,2 ready for room,3 startGame,4 gameover
  onCreate(options: any) {
    this.setState(new MyRoomState());
    if (options.maxClients) {
      this.maxClients = options.maxClients;
    }
    if (options.betCoins) {
      this.betCoins = options.betCoins;
    }
    this.currentGamePhrase = 1;
    this.startCountdown(this.playerMatchTime, () => {
      console.log("===match players time out!");
      let res = this.addRobotsPlayer();
      if(res){
        this.startCurrentGamePhrase2();
      }

    });
    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });

    this.onMessage("C2S", (client, message) => {
      //
      // handle "type" message
      //
      const jsonObj = JSON.parse(message);
      if (jsonObj.cmd == "C2S_isReady") {
        this.checkReady(client, jsonObj.value);
      }

    });


    this.onMessage("unReady", (client, message) => {
      //
      // handle "type" message
      //
      if(!this.state.players.has(client.sessionId))
        return;
      const p = this.state.players.get(client.sessionId);
      p.isReady = false;
     // this.broadcast("S2C", JSON.stringify({ cmd: "S2C_unReady", sessionId: client.sessionId }));
    });
  }

  addRobotsPlayer():boolean{
    if(this.clients.length > 0){

      let count = this.maxClients - this.clients.length;
      if(count <= 0)//说明当前人数已经满了，不需要从超时这里开始下一阶段
        return false;
      let pArray:any =  RobotPlayerManager.getInstance().addRobotPlayer(count);
      if(pArray&&pArray.length>0){
        pArray.forEach((p:any) => {
          const player = new Player();
         // player.sessionId = p.sessionId; // Assign a unique ID to the player
          player.name = p.nickname; // Assign the name of the player
          player.userId = p.id; // Assign the user ID of the player
          player.avatar = p.avatar;
          player.seatSeq = this.state.players.size+1; //
        //  player.coins = 0; // Initial goal
          player.isReady = true;
          player.isOnline = true;
          this.state.players.set(p.sessionId,player);
        });
        return true;
      }
      
    }
  }
  ///is every one ready，or set readystate of player
  ///when all ready,start game broadcast
  checkReady(client: Client, isReady: boolean) {
    let isAllReady = true;
    this.state.players.forEach((player) => {
      if (player.isReady == false) {
        isAllReady = false;
      }
    });

    if (isAllReady) {
      //this.state.countDownTime = 10;
     // this.broadcast("S2C", JSON.stringify({ cmd: "S2C_allReady" }));
      this.startCurrentGamePhrase3();
      return;
    }
    this.state.players.get(client.sessionId).isReady = isReady;
    // this.state.arrayOfPlayers.forEach((player) => {
    //   if (player.sessionId === client.sessionId) {
    //     player.isReady = isReady;
    //   }
    // });
  }

  

  //options{"userName":"test1","userId":1,"betCoins":10,"maxClients":8}
  onJoin(client: Client, options: any) {
    const player = new Player();
    player.sessionId = client.sessionId; // Assign a unique ID to the player
    player.name = options.userName; // Assign the name of the player
    player.userId = options.userId; // Assign the user ID of the player
    player.avatar = options.avatar;
    player.seatSeq = this.state.players.size+1; // 

    player.coins = 0; // Initial goal
    player.isReady = false;
    player.isOnline = true;
    this.state.players.set(client.sessionId,player);
    if (this.clients.length >= this.maxClients) {
      this.lock();
     
      console.log("Room locked!");
      //进入准备倒计时阶段
      this.startCurrentGamePhrase2();
    }
    console.log(client.sessionId, "joined!");
  }

  startCurrentGamePhrase2() {
    this.broadcast("S2C", JSON.stringify({ cmd: "S2C_allMached" }));
    this.currentGamePhrase = 2;
    this.startCountdown(this.playerGlobalReadyTime, () => {

      this.addRobotsPlayer();

      this.state.players.forEach((player) => {
        if(player.isReady == false)
             player.isReady = true;
      });
      this.startCurrentGamePhrase3();
      //whenallready than start game
    });
  }

  startCurrentGamePhrase3() {
    this.broadcast("S2C", JSON.stringify({ cmd: "S2C_allReady" }));
    this.currentGamePhrase = 3;
    //todo 同步所有玩家的金币一次，并且按照次序计时

    // this.startCountdown(this.playerGlobalReadyTime, () => {

    //   this.addRobotsPlayer();

    //   this.state.players.forEach((player) => {
    //     if(player.isReady == false)
    //          player.isReady = true;
    //   });
    //   this.startCurrentGamePhrase3();
    //   //whenallready than start game
    // });
  }


  delayedInterval!: Delayed;
  startCountdown(cdTime: number,method: () => void) {
    if (this.delayedInterval) {
      this.delayedInterval.clear();
    }
    this.state.countDownTime = cdTime; // Set initial countdown time
    this.clock.start();
    this.delayedInterval = this.clock.setInterval(() => {
      console.log("Time now " + this.clock.currentTime);
      if (this.state.countDownTime > 0)
        this.state.countDownTime -= 1;
    }, 1000);



    this.clock.setTimeout(() => {
      this.delayedInterval.clear();
      method();
    }, cdTime * 1000);

  }


  //中途有人离开则需要被机器人接管，自动下注，允许断线重连进来继续玩
  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    if(this.currentGamePhrase==1 || this.currentGamePhrase==2){
      this.state.players.delete(client.sessionId);
    }

    if(this.currentGamePhrase==3){//when game start,if player leave,then wait for his come back
      this.allowReconnection(client,1000000).then((isReconnected) => {
        if (isReconnected) {
          console.log("client reconnected!");
          this.state.players.get(client.sessionId).isOnline = true;
        } else {
          console.log("client not reconnected!");
          //this.state.players.get(client.sessionId).isOnline = false;
          //this.state.players.delete(client.sessionId);
        }
      });
    }
    // this.state.arrayOfPlayers.forEach((player) => {
    //   if (player.sessionId === client.sessionId) {
    //     player.isOnline = false;
    //   }
    // });
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
