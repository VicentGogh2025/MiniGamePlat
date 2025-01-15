import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Player } from "./schema/MyRoomState";

export class Room20 extends Room<MyRoomState> {
  maxClients = 20;

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }
//options{userName:"name",userId:1}
  onJoin (client: Client, options: any) {
    const player = new Player();
    player.sessionId = client.sessionId; // Assign a unique ID to the player
    player.name = options.userName; // Assign the name of the player
    player.userId = options.userId; // Assign the user ID of the player
    player.x = -1; // Initial x position
    player.y = -1; // Initial y position
    player.coins = 0; // Initial goal
    this.state.arrayOfPlayers.push(new Player());
    client.send("welcome", `Welcome to the room, ${player.name}!,room type is ${this.maxClients} people room,roomid:${this.roomId}`);
    if (this.clients.length >= this.maxClients) {
      this.lock();
      
      console.log("Room locked!");
    }
    console.log(client.sessionId, "joined!");
  }

//中途有人离开则需要被机器人接管，自动下注，允许断线重连进来继续玩
  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
