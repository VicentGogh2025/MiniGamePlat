import { Schema, Context, type,ArraySchema, MapSchema } from "@colyseus/schema";
import { number } from "@colyseus/schema/lib/encoding/decode";

export class Player extends Schema {
  @type("uint32")
  userId: number;
  
  @type("string")
  sessionId: string;

  @type("string")
  name: string;

  @type("string")
  avatar: string;

  @type("number")
  seatSeq: number;
  // @type("number")
  // x: number;

  // @type("number")
  // y: number;

  @type("number")
  coins: number;

  @type("number")
  propCoins: number = 0;

  @type("boolean")
  isReady: boolean;

  @type("number")//0:waiting, 1:playing, 2:win, 3:lose
  status: number = 0;

  @type("boolean")
  isOnline: boolean;
}

export class MyRoomState extends Schema {

  @type("string") mySynchronizedProperty: string = "Hello world";

  @type("number") countDownTime: number = -1;

  @type("number") maxZoomPropCount: number = 20;

  @type("number") maxNextPropCount: number = 20;

  @type("number") maxCoinPropCount: number = 1;

  @type("number") maxBombCount: number = 10;
  @type("number") bombCount: number = 0;
  @type("number") coinPropCount: number = 0;
  @type("number") nextPropCount: number = 0;
  @type("number") zoomPropCount: number = 0;

  @type("string") movingPlayerSessionId:string;
  
  // @type([number]) hArrayOfGrids: ArraySchema<number> = new ArraySchema<number>();
  // @type("uint8") wArrayOfGrids: ArraySchema<number> = new ArraySchema<number>();

  @type({ map: Player }) players = new MapSchema<Player>();
}
