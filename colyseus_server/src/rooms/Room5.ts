import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Player } from "./schema/MyRoomState";

export class Room5 extends Room<MyRoomState> {
  maxClients = 5;
  betCoins = 10;
  onCreate (options: any) {
    this.setState(new MyRoomState());

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
      if(jsonObj.cmd=="C2S_isReady"){
        this.checkReady(client,jsonObj.value);
      }

    });


    this.onMessage("unReady", (client, message) => {
      //
      // handle "type" message
      //
      this.state.arrayOfPlayers.forEach((player) => {
        if (player.sessionId === client.sessionId) {
            player.isReady = true;
        }
      } );
    });
  }

///is every one ready，or set readystate of player
///when all ready,start game broadcast
  checkReady(client:Client,isReady:boolean){
    let isAllReady = true;
    this.state.arrayOfPlayers.forEach((player) => {
      if (player.isReady == false) {
        isAllReady = false;
      }
    } );

    if(isAllReady){
      //this.state.countDownTime = 10;
      this.broadcast("S2C", JSON.stringify({cmd:"S2C_allReady"}));
      return;
    }
    this.state.arrayOfPlayers.forEach((player) => {
      if (player.sessionId === client.sessionId) {
          player.isReady = isReady;
      }
    } );
  }
//options{userName:"name",userId:1}
  onJoin (client: Client, options: any) {
    const player = new Player();
    player.sessionId = client.sessionId; // Assign a unique ID to the player
    player.name = options.userName; // Assign the name of the player
    player.userId = options.userId; // Assign the user ID of the player
    this.betCoins = options.betCoins; 
    player.x = -1; // Initial x position
    player.y = -1; // Initial y position
    player.coins = 0; // Initial goal
    player.isReady = false;
    player.isOnline = true;
    this.state.arrayOfPlayers.push(new Player());
    if (this.clients.length >= this.maxClients) {
      this.lock();
      console.log("Room locked!");
      //进入准备倒计时阶段

    }
    console.log(client.sessionId, "joined!");
  }

//中途有人离开则需要被机器人接管，自动下注，允许断线重连进来继续玩
  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.arrayOfPlayers.forEach((player) => {
      if (player.sessionId === client.sessionId) {
          player.isOnline = false;
      }
    } );
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
