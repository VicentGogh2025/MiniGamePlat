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

  @type("boolean")
  isReady: boolean;

  @type("boolean")
  isOnline: boolean;
}

export class MyRoomState extends Schema {

  @type("string") mySynchronizedProperty: string = "Hello world";

  @type("uint8") countDownTime: number = -1;

  // @type([number]) hArrayOfGrids: ArraySchema<number> = new ArraySchema<number>();
  // @type("uint8") wArrayOfGrids: ArraySchema<number> = new ArraySchema<number>();

  @type({ map: Player }) players = new MapSchema<Player>();
}
