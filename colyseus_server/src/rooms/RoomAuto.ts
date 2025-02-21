import { Room, Client, Delayed } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Player } from "./schema/MyRoomState";
import { RobotPlayerManager } from "./RobotPlayerManager";
import axios from "axios";
interface Bomb2dUnit {
  propType: string;
  moveX: number;
  moveY: number;
  userId: number;
}
class PropData{
  propTypeStr: string;
  count: number;
}
export class RoomAuto extends Room<MyRoomState> {
  maxClients = 5;
  betCoins = 10;
  playerGlobalReadyTime: number = 10;
  playerMatchTime: number = 5;
  playerMoveCDTime = 10;
  currentGamePhrase = 1;//1 is waiting for player,2 ready for room,3 startGame,4 gameover
  Bomb2dArray: Bomb2dUnit[][] = [];
  game_key = "abc123xyz789";
  rounds = 0;
  sortedPlayerList: Player[] = [];
  curPlayerIndex = 0;
  curRobotManager: RobotPlayerManager = new RobotPlayerManager();
  c2sMovedSessionId = "";
  mapPropData: Map<string, PropData[]> = new Map<string, PropData[]>();
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
      const pc = this.getPlayerCount();
      if (pc < this.maxClients) {
        const count = this.maxClients - pc;
      this.addRobotsPlayer(count,() => {
        this.startCurrentGamePhrase2();
      });}
      // console.log("===match players time out!" + res);
      // if (res) {

      // }

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
      } else if (jsonObj.cmd == "C2S_playerMove") {
        if(this.state.movingPlayerSessionId != client.sessionId){
          console.log("===C2S_playerMove==not your turn=="+this.state.movingPlayerSessionId);
          return;
        }
        if(this.c2sMovedSessionId==client.sessionId){
          console.log("===c2sMovedSessionId==already clicked==="+this.c2sMovedSessionId);
          return
        }
        this.c2sMovedSessionId = client.sessionId;
        this.stopCountdown();//cancel current countdown
        let moveX = jsonObj.moveX;
        let moveY = jsonObj.moveY;
        //  let playerUserId = this.findUserIdBySessionId(client.sessionId);
        //  this.Bomb2dArray[moveX][moveY].userId = playerUserId;
        // let propType = this.Bomb2dArray[moveX][moveY].propType;
        // this.broadcast("S2C", JSON.stringify({ cmd: "S2C_playerMove", sessionId: client.sessionId, moveX: moveX, moveY: moveY, propTypeStr: propType }));
        this.openGridByPlayerMove(moveX,moveY).then((gameOverRes) => {
          if (gameOverRes) {
            //console.log("in====excuteNextPlayerMove===gameOverRes===true==curIndex==" + index);
            return;
          } else {
            console.log("in====excuteNextPlayerMove===index==before=" + this.curPlayerIndex);
            const curPlayer = this.findNextActivePlayer(this.curPlayerIndex);
            console.log("in====excuteNextPlayerMove===index==after=" + this.curPlayerIndex);
            this.excuteNextPlayerMove(this.curPlayerIndex);
          }
        });
      }else if (jsonObj.cmd == "C2S_usingProp") {
       
         const propTypeStr =  jsonObj.propTypeStr;
         console.log("==C2S_usingProp==="+propTypeStr);
         const hasProp = this.PlayerHasProp(client.sessionId,propTypeStr);
         if(!hasProp)
          return;

         console.log("==C2S_usingProp===hasProp==="+propTypeStr);
         switch(propTypeStr){
          // case "Bomb":
          // break;
          case "Next":

              this.stopCountdown();//cancel current countdown
              this.findNextActivePlayer(this.curPlayerIndex);
             this.excuteNextPlayerMove(this.curPlayerIndex);
             client.send("S2C", JSON.stringify({ cmd: "S2C_usingProp", targetPropTypeStr:propTypeStr}));
             this.removeProp2Player(client.sessionId,propTypeStr);
          break;
          case "Zoom":
            const moveX = jsonObj.moveX;
            const moveY = jsonObj.moveY;
            const pt = this.Bomb2dArray[moveX][moveY].propType;
            client.send("S2C", JSON.stringify({ cmd: "S2C_usingProp", targetPropTypeStr:propTypeStr,openedPropTypeStr:pt, moveX:moveX, moveY:moveY }));
            this.removeProp2Player(client.sessionId,propTypeStr);
          break;
         }

      }
      // }else if(jsonObj.cmd == "C2S_playerUseProp"){ 
      // }

    });



    this.onMessage("unReady", (client, message) => {
      //
      // handle "type" message
      //
      if (!this.state.players.has(client.sessionId))
        return;
      const p = this.state.players.get(client.sessionId);
      p.isReady = false;
      // this.broadcast("S2C", JSON.stringify({ cmd: "S2C_unReady", sessionId: client.sessionId }));
    });

  //  this.testMatrix();
  }

  getPlayerCount():number{
    return this.state.players.size;
  }

  changeMovingPlayerSessionId(sessionId: string) {
    this.state.movingPlayerSessionId = sessionId;
    this.c2sMovedSessionId="";
  }


  findNextActiveIndexBySessionId(sessionId: string): number {

    for (let i = 0; i < this.sortedPlayerList.length; i++) {
      const p = this.sortedPlayerList[i]
      if (p.sessionId == sessionId) {

        this.findNextActivePlayer(i);
        return this.curPlayerIndex;
      }
    }
    return -1;
  }
  addRobotsPlayer(count:number,aftetAddAction: () => void) {
    if (this.clients.length > 0) {

      //let count = this.maxClients - this.clients.length;
      if (count <= 0)//说明当前人数已经满了，不需要从超时这里开始下一阶段
        return false;
      console.log("will add robot player count=="+count);
      this.curRobotManager.addRobotPlayer(count).then((data => {
        // console.log("parray length==" + data.length);
        if (data && data.length > 0) {
          data.forEach((p: any) => {
            const player = new Player();
            // player.sessionId = p.sessionId; // Assign a unique ID to the player
            player.name = p.nickname; // Assign the name of the player
            player.userId = p.id; // Assign the user ID of the player
            player.avatar = p.avatar;
            // console.log("player.avatar===" + player.avatar);
            player.seatSeq = this.state.players.size + 1; //
            //  player.coins = 0; // Initial goal
            player.isReady = true;
            player.isOnline = true;
            player.sessionId = p.id.toString();
            this.state.players.set(player.sessionId, player);
          });
          //  return true;
          aftetAddAction();
        }
      }
      ));



    } else {
      console.log("this.clients.lengh<=0 and false");
      //  return false;
    }
  }
  ///is every one ready，or set readystate of player
  ///when all ready,start game broadcast
  checkReady(client: Client, isReady: boolean) {
    console.log("===start checkReady===");
    this.state.players.get(client.sessionId).isReady = isReady;
    let isAllReady = true;
    this.state.players.forEach((player) => {
      if (player.isReady == false) {
        isAllReady = false;
      }
    });

    if (isAllReady) {
      this.stopCountdown();
      this.startCurrentGamePhrase3();
      return;
    }

  }

  findUserIdBySessionId(sessionId: string) {
    let userId = -1;
    this.state.players.forEach((player) => {
      if (player.sessionId === sessionId) {
        userId = player.userId;
      }
    });
    return userId;

  }



  //options{"userName":"test1","userId":1,"betCoins":10,"maxClients":8}
  onJoin(client: Client, options: any) {
    const player = new Player();
    player.sessionId = client.sessionId; // Assign a unique ID to the player
    player.name = options.userName; // Assign the name of the player
    player.userId = options.userId; // Assign the user ID of the player
    player.avatar = options.avatar;
    player.coins = options.coin;
    player.seatSeq = this.state.players.size + 1; // 
    player.status = 0;
  //  player.coins = 0; // Initial goal
    player.isReady = false;
    player.isOnline = true;
    this.state.players.set(client.sessionId, player);
    if (this.clients.length >= this.maxClients) {
     
      //进入准备倒计时阶段
      this.startCurrentGamePhrase2();
    }
    console.log(client.sessionId, "joined!");
  }

  sortPlayersBySeatSeq(): Player[] {
    let ps: Player[] = [];
    //nbs.sort
    // 复制 players 数组以避免修改原始数据
    //  const ps =this.state.players.values();
    this.state.players.forEach(item => {
      // console.log(item); // 输出数组中的每个元素
      ps.push(item);
    });

    // 按照 seatSeq 从小到大排序
    ps.sort((a: Player, b: Player) => a.seatSeq - b.seatSeq);

    return ps;
  }

  updatePlayerCoinByUserId(userId: number, coins: number) {
    this.state.players.forEach((player) => {
      if (player.userId === userId) {
        player.coins = coins;
      }
    });
  }

  startCurrentGamePhrase2() {
    this.lock();

    console.log("Room locked!");
    this.broadcast("S2C", JSON.stringify({ cmd: "S2C_allMached" }));
    console.log("===startCurrentGamePhrase2===");
    this.currentGamePhrase = 2;

    this.startCountdown(this.playerGlobalReadyTime, () => {
      let playerCount = this.getPlayerCount();
      
      if (playerCount < this.maxClients) {
        this.addRobotsPlayer(playerCount,() => {
          this.state.players.forEach((player) => {
            if (player.isReady == false)
              player.isReady = true;
          });
          this.startCurrentGamePhrase3();
        });
        return;
      }

      this.state.players.forEach((player) => {
        if (player.isReady == false)
          player.isReady = true;
      });
      this.startCurrentGamePhrase3();
      //whenallready than start game
    });
  }

  getAUnOpenGridInGame(): Bomb2dUnit {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.Bomb2dArray[i][j].userId == -1) {
          return this.Bomb2dArray[i][j];
        }
      }
    }

    return null;
  }

  testMatrix() {

    // this.Bomb2dArray = this.createBomb2dArray();
    // this.createProps();
    let mStr = "";
    let bombC =0;
    let coinC =0;
    let nextC =0;
    let zoomC = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        //console.log("i=" + i + " j=" + j + " propType=" + this.Bomb2dArray[i][j].propType);
        mStr += this.Bomb2dArray[i][j].propType + " ";
        if(this.Bomb2dArray[i][j].propType == "Bomb")
          bombC++;
        if(this.Bomb2dArray[i][j].propType == "Coin")
          coinC++;
        if(this.Bomb2dArray[i][j].propType == "Next")
          nextC++;
        if(this.Bomb2dArray[i][j].propType == "Zoom")
          zoomC++;
      }
      mStr += "\n";
    }
    console.log(mStr);
    console.log("bombC=="+bombC+" coinC=="+coinC+" nextC=="+nextC+" zoomC=="+zoomC);
  }

  async startCurrentGamePhrase3() {
    this.sortedPlayerList = this.sortPlayersBySeatSeq();
    //请求访问一次后台是否可以正常开始游戏，如果可以就广播进入到游戏
    const res = await this.requestStartNewGame();
    if (res == true) {

      this.currentGamePhrase = 3;
      this.broadcast("S2C", JSON.stringify({ cmd: "S2C_allReady" }));
      console.log("===S2C S2C_allReady===");

      this.Bomb2dArray = this.createBomb2dArray();
      this.createProps();

      this.testMatrix();
      setTimeout(() => {
        this.excuteNextPlayerMove(0);
      }, 2000);

    } else {
      this.broadcast("S2C", JSON.stringify({ cmd: "S2C_startGameFailed" }));
    }
  }
  ///to excuteNextPlayerTimeoutMove
  excuteNextPlayerMove(index: number) {
    let curPlayer: Player = this.sortedPlayerList[index];
    this.changeMovingPlayerSessionId(curPlayer.sessionId);
   // this.state.movingPlayerSessionId = curPlayer.sessionId;
    console.log("===excuteNextPlayerMove===index==" + index + "===sessionId==" + curPlayer.sessionId);
    this.startCountdown(this.playerMoveCDTime, () => {


      this.openGridByPlayerIndex(index).then((gameOverRes) => {
        if (gameOverRes) {
          console.log("in====excuteNextPlayerMove===gameOverRes===true==curIndex==" + index);
          return;
        } else {
          console.log("in====excuteNextPlayerMove===index==before=" + index);
          const curPlayer = this.findNextActivePlayer(index);
          console.log("in====excuteNextPlayerMove===index==after=" + this.curPlayerIndex);
          this.excuteNextPlayerMove(this.curPlayerIndex);
        }
      });

    });
  }

  PlayerHasProp(sessionId:string, propTypeStr:string):boolean{
    if(this.mapPropData.has(sessionId)){
      let propDataArray = this.mapPropData.get(sessionId);
      for(let pd of propDataArray){
        if(pd.propTypeStr == propTypeStr){
          return true;
        }
      }
    }
    return false;
  }

  removeProp2Player(sessionId:string, propTypeStr:string){
    if(this.mapPropData.has(sessionId)){
      let propDataArray = this.mapPropData.get(sessionId);
      for(let pd of propDataArray){
        if(pd.propTypeStr == propTypeStr){
          pd.count--;
          if(pd.count == 0){
            propDataArray.splice(propDataArray.indexOf(pd),1);
          }
          return;
        }
      }
    }
  }

  assignProp2Player(sessionId:string, propTypeStr:string) {
    if(this.mapPropData.has(sessionId)){
      let propDataArray = this.mapPropData.get(sessionId);
      for(let pd of propDataArray){
        if(pd.propTypeStr == propTypeStr){
          pd.count++;
         // this.mapPropData.set(sessionId,propDataArray);
          return;
        }
      }
     // this.mapPropData.set(sessionId,pd);
    }else{
      this.mapPropData.set(sessionId,new Array<PropData>());
      let pd = new PropData();  pd.propTypeStr = propTypeStr; pd.count = 1;
      this.mapPropData.get(sessionId).push(pd);
      return;
    }
  //    let pd = this.mapPropData.get(sessionId);
  //    pd.count++;
  //    this.mapPropData.set(sessionId,pd);
  }

  async openGridByPlayerMove(moveX:number,moveY:number): Promise<boolean> {
    let curPlayer: Player = this.sortedPlayerList[this.curPlayerIndex];
    let bu = this.Bomb2dArray[moveX][moveY];
    if (bu.userId != -1) {
      return false;
    }
    bu.userId = curPlayer.userId;
    if (bu.propType == "Bomb") {
      this.state.bombCount++;
      curPlayer.status = 3;
    }
    if (bu.propType == "Next"){
      this.state.nextPropCount++;
      this.assignProp2Player(curPlayer.sessionId,"Next");
    }
    if (bu.propType == "Zoom"){
      this.state.zoomPropCount++;
      this.assignProp2Player(curPlayer.sessionId,"Zoom");
    }
    if (bu.propType == "Coin") {
      this.state.coinPropCount++;
      curPlayer.propCoins += 1;
    }

    this.broadcast("S2C", JSON.stringify({ cmd: "S2C_playerMove", sessionId: curPlayer.sessionId, moveX: bu.moveX, moveY: bu.moveY, propTypeStr: bu.propType }));
    const res = this.isGameOver();

    if (res) {
      const winner = this.findWinner();
      const rewardCoinsV = winner.propCoins + this.betCoins * this.maxClients;
      this.broadcast("S2C", JSON.stringify({ cmd: "S2C_gameOver", sessionId: winner.sessionId, rewardCoins: rewardCoinsV }));
      const res = await this.requestFinishGame();
      if (res) {
        console.log("===requestFinishGame success===");
      } else {
        console.log("===requestFinishGame failed===");
      }
      const res2 = this.curRobotManager.removeAllRobotPlayer();
      if (res) {
        console.log("===removeAllRobotPlayer success===");
      } else {
        console.log("===removeAllRobotPlayer failed===");
      }
      // addRobotsPlayers();
      //after 3s disconnect all players and destory this room
      setTimeout(() => {
        this.clients.forEach((client) => {
        
          client.leave();
          console.log("===client leave==="+client.sessionId);
        });
        this.disconnect();
      //  this.disconnect();
        //this.allowReconnection = false;
        //this.destroy();
      }, 3000);


    } else {
      const bombCount = this.state.maxBombCount - this.state.bombCount;
      console.log("===game is not over remain bomb count===", bombCount);
    }
    return res;
    }
  

  async openGridByPlayerIndex(index: number): Promise<boolean> {
    let curPlayer: Player = this.sortedPlayerList[index];

    let bu = this.getAUnOpenGridInGame();
    bu.userId = curPlayer.userId;
    if (bu.propType == "Bomb") {
      this.state.bombCount++;
      curPlayer.status = 3;
    }
    if (bu.propType == "Next")
      this.state.nextPropCount++;
    if (bu.propType == "Zoom")
      this.state.zoomPropCount++;
    if (bu.propType == "Coin") {
      this.state.coinPropCount++;
      curPlayer.propCoins += 1;
    }
    //  bu.userId = curPlayer.userId;

    // this.state.movingPlayerSessionId = curPlayer.sessionId;
    // curPlayer.userId = bu.userId;
    this.broadcast("S2C", JSON.stringify({ cmd: "S2C_playerMove", sessionId: curPlayer.sessionId, moveX: bu.moveX, moveY: bu.moveY, propTypeStr: bu.propType }));
    const res = this.isGameOver();

    if (res) {
      const winner = this.findWinner();
      const rewardCoinsV = winner.propCoins + this.betCoins * this.maxClients;
      this.broadcast("S2C", JSON.stringify({ cmd: "S2C_gameOver", sessionId: winner.sessionId, rewardCoins: rewardCoinsV }));
      const res = await this.requestFinishGame();
      if (res) {
        console.log("===requestFinishGame success===");
      } else {
        console.log("===requestFinishGame failed===");
      }
      const res2 = this.curRobotManager.removeAllRobotPlayer();
      if (res) {
        console.log("===removeAllRobotPlayer success===");
      } else {
        console.log("===removeAllRobotPlayer failed===");
      }
      // addRobotsPlayers();
      //after 3s disconnect all players and destory this room
      setTimeout(() => {
        //this.state.players.clear();
        this.clients.forEach((client) => {
          client.leave();
          console.log("===client leave==="+client.sessionId);
        });
        this.disconnect();
      //  this.disconnect();
        //this.allowReconnection = false;
        //this.destroy();
      }, 3000);


    } else {
      const bombCount = this.state.maxBombCount - this.state.bombCount;
      console.log("===game is not over remain bomb count===", bombCount);
    }
    return res;

  }

  isGameOver(): boolean {
    if (this.state.bombCount >= this.maxClients - 1) {
      return true;
    }
    return false;
  }

  findWinner(): Player {

    for(const p of this.sortedPlayerList){
      if(p.status != 3)
        return p;
    }
    return null;
  }

  findNextActivePlayer(index: number): Player {
   // console.log("===findNextActivePlayer==index==before" + index);
    let cIndex = index;
    do{
      if(cIndex < this.sortedPlayerList.length - 1){
        cIndex++;
      }else{
        cIndex = 0;
      }
    }while(this.sortedPlayerList[cIndex].status == 3);
    this.curPlayerIndex = cIndex;
     return this.sortedPlayerList[cIndex];
    // if (index < this.sortedPlayerList.length - 1) {
    //   this.curPlayerIndex = index;
    // } else {
    //   this.curPlayerIndex = index - this.sortedPlayerList.length;
    // }

    // for (let i = this.curPlayerIndex + 1; i < this.sortedPlayerList.length; i++) {
    //   const p = this.sortedPlayerList[i];
    //   if (p.status != 3) {
    //     this.curPlayerIndex = i;
    //     console.log("===findNextActivePlayer==index==after" + i);
    //     return p;
    //   }
    // }
    // return null;
  }


  // findNextActivePlayerIndex(index:number): Player {
  //   if (index < this.sortedPlayerList.length-1) {
  //     this.curPlayerIndex = index;
  //   }else{
  //     this.curPlayerIndex = index - this.sortedPlayerList.length;
  //   }

  //   for (let i = this.curPlayerIndex + 1; i < this.sortedPlayerList.length; i++) {
  //     if (this.sortedPlayerList[i].status != 3) {
  //       this.curPlayerIndex = i;
  //       return this.sortedPlayerList[i];
  //     }
  //   }
  //   return null;
  // }

  async requestStartNewGame(): Promise<boolean> {
    let userIdArray: string[] = [];
    this.state.players.forEach((player) => {
      if (player.userId.toString() == player.sessionId)
        userIdArray.push("rob_" + player.userId);
      else
        userIdArray.push(player.userId.toString());
    });
    // 定义你的JSON数据
    const data = {
      game_key: this.game_key,
      room_id: this.roomId,
      game_id: 'game_' + this.roomId,
      game_type: 'luckybooms_' + this.maxClients + '_player',
      bet_amount: this.betCoins,
      players: userIdArray,

    };
    try {
      const res = await axios.post('https://api.luckybooms.com/api/game/start', data);

      console.log("requestStartNewGame res===" + JSON.stringify(res.data));
      if (res.data.code == 0) {
        res.data.data.players.forEach((p: any) => {
          this.updatePlayerCoinByUserId(Number(p.id), p.remaining_coins)
        });
        return true;
      }

      console.log("requestStartNewGame===" + res.data);
      res.data.data.players.forEach((p: any) => {
        if (p.error == "金币不足")
          console.log("error 金币不足 玩家id===" + p.id);
        //this.updatePlayerCoinByUserId(Number(p.id), p.current_coins)
      });
      console.log("error requestStartNewGame msg===" + res.data.msg);
      //  this.broadcast("S2C", JSON.stringify({ cmd: "S2C_startGameFailed"}));
      this.broadcast("S2C", JSON.stringify({ cmd: "S2C_startGameFailed" }));

    } catch (error) {
      console.log(error);
    }
    return false;
  }

  async requestFinishGame(): Promise<boolean> {
   // let userIdArray: string[] = [];
    // this.state.players.forEach((player) => {
    //  // userIdArray.push(player.userId);
    //   if (player.userId.toString() == player.sessionId)
    //     userIdArray.push("rob_" + player.userId);
    //   else
    //     userIdArray.push(player.userId.toString());
    // });
    // 定义你的JSON数据
    let data = {
      game_key: this.game_key,
      room_id: this.roomId,
      game_id: 'game_' + this.roomId,
      game_type: 'luckybooms_' + this.maxClients + '_player',
      bet_amount: this.betCoins,
      total_pool: this.betCoins * this.maxClients,
      platform_rate: 0.1,
      players: ['']
    };
    let playerArray: any[] = [];
    this.sortedPlayerList.forEach((player) => {
      let idstr = player.userId.toString();
      if (player.userId.toString() == player.sessionId)
            idstr = "rob_" + player.userId;
      let isW = player.status != 3;
      playerArray.push({ id: idstr, is_winner: isW, extra_coins: player.propCoins });
    });
    data["players"] = playerArray;
    try {
      console.log("requestFinishGame data===" + JSON.stringify(data));
      // 发起POST请求
      const res = await axios.post('https://api.luckybooms.com/api/game/settle', data);


      if (res.data.code == 0) {
        res.data.data.players.forEach((p: any) => {

          this.updatePlayerCoinByUserId(Number(p.id), p.total_coins)
        });
        return true;
      }else if(res.data.code == 1){
        res.data.data.returned_coins.forEach((p: any) => {

          this.updatePlayerCoinByUserId(Number(p.id), p.current_coins)
        });
        console.log("error requestFinishNewGame msg===" + res.data.msg);
        return false;
      }
      // res.data.players.forEach((p: any) => {

      //   this.updatePlayerCoinByUserId(Number(p.id), p.current_coins)
      // });
      

    } catch (error) {
      console.log(error);
    }
    return false;
  }
  // 发起POST请求
  // axios.post('https://api.luckybooms.com/api/game/start', data)
  //   .then(response => {
  //     console.log('Response:', response.data);
  //   })
  //   .catch(error => {
  //     console.error('Error:', error);
  //   });
  //}

  createBomb2dArray(): Bomb2dUnit[][] {

    let array: Bomb2dUnit[][] = new Array(8).fill(0).map(() => new Array(8).fill(null));
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        array[i][j] = { propType: "None", moveX: i, moveY: j, userId: -1 };
      }
    }
    // createProps()
    return array;
  }


  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  ///random gen bomb
  createProps() {
    let maxPropCount = this.state.maxBombCount + this.state.maxCoinPropCount + this.state.maxNextPropCount + this.state.maxZoomPropCount;
    let rdArray = this.createRandomPositionsIn8x8Array(8, maxPropCount);
    let pArray: string[] = [];
    for (let i = 0; i < this.state.maxBombCount; i++) {
      pArray.push("Bomb");
    }
    for (let i = 0; i < this.state.maxCoinPropCount; i++) {
      pArray.push("Coin");
    }
    for (let i = 0; i < this.state.maxNextPropCount; i++) {
      pArray.push("Next");
    }
    for (let i = 0; i < this.state.maxZoomPropCount; i++) {
      pArray.push("Zoom");
    }
    console.log("===pArray.length===" + pArray.length);
    for (let i = 0; i < rdArray.length; i++) {
      let a2 = rdArray[i];
      let x = a2[0];
      let y = a2[1];

      let index = this.getRandomInt(0, pArray.length-1)
      let propTypeArray = pArray.splice(index, 1);
      this.Bomb2dArray[x][y].propType = propTypeArray[0];

    }
    //}
    //  while

  }


  createRandomPositionsIn8x8Array(arraySize: number, numPositions: number): number[][] {
    const positions: number[][] = [];
    const usedIndexes: { [key: string]: boolean } = {};

    while (positions.length < numPositions) {
      const x = Math.floor(Math.random() * arraySize);
      const y = Math.floor(Math.random() * arraySize);
      const index = `${x},${y}`;
      if (!usedIndexes[index]) {
        usedIndexes[index] = true;
        positions.push([x, y]);
      }
    }

    return positions;
  }


  delayedInterval!: Delayed;
  timeoutDelayedInterval!: Delayed;
  startCountdown(cdTime: number, method: () => void) {
    if (this.delayedInterval) {
      this.delayedInterval.clear();
    }
    this.state.countDownTime = cdTime; // Set initial countdown time
    this.clock.start();
    this.delayedInterval = this.clock.setInterval(() => {
      console.log("Time now " + this.state.countDownTime);
      if (this.state.countDownTime > 0)
        this.state.countDownTime -= 1;
    }, 1000);



    this.timeoutDelayedInterval = this.clock.setTimeout(() => {
      this.delayedInterval.clear();
      method();
    }, cdTime * 1000);


  }

  stopCountdown() {
    // this.state.countDownTime = 0;
    this.clock.stop();
    if (this.delayedInterval) {
      this.delayedInterval.clear();
    }
    if (this.timeoutDelayedInterval) {
      this.timeoutDelayedInterval.clear();
    }
  }

  isLeftRobot(exclusiveSessionId:string):boolean{
    let res = true;
    this.state.players.forEach((player, sessionId) => {
      if (sessionId != exclusiveSessionId && player.sessionId != player.userId.toString()) {

        res = false
        return;
      }
    });
    return res;
  }

  //中途有人离开则需要被机器人接管，自动下注，允许断线重连进来继续玩
  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    const leftAllRpobot = this.isLeftRobot(client.sessionId);

    if(leftAllRpobot){
      this.stopCountdown();
      this.disconnect();
      return;
     // this.state.countDownTime = 0;
    }
    if (this.currentGamePhrase == 1 || this.currentGamePhrase == 2) {
      this.state.players.delete(client.sessionId);
    }

    if (this.currentGamePhrase == 3) {//when game start,if player leave,then wait for his come back
      this.allowReconnection(client, 1000000).then((isReconnected) => {
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
