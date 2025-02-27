import { PropType } from "./DataWarehouse";

export class JsonCMD {
    static CMD_S2C_allReady:string = "S2C_allReady";
    static CMD_S2C_allMached:string = "S2C_allMached";
    static CMD_S2C_playerMove:string = "S2C_playerMove";
    static CMD_S2C_gameOver:string = "S2C_gameOver";
    static CMD_S2C_startGameFailed:string = "S2C_startGameFailed";
    static CMD_S2C_usingProp:string = "S2C_usingProp";
    static CMD_C2S_isReady:string = "C2S_isReady";
    static CMD_C2S_playerMove:string = "C2S_playerMove";
    static CMD_C2S_usingProp:string = "C2S_usingProp";
    static Server_Property_countDownTime:string = "countDownTime";
    static Server_Property_movingPlayerSessionId:string = "movingPlayerSessionId";
    static Server_Property_playersIn:string = "playersIn";
    static Server_Property_playersOut:string = "playersOut";
    static Server_Property_isReady:string = "isReady";
    static Server_Property_playerStatus:string = "status";

    static Server_Property_coinPropCount:string = "coinPropCount";
    static Server_Property_nextPropCount:string = "nextPropCount";
    static Server_Property_zoomPropCount:string = "zoomPropCount";
    static Server_Property_bombCount:string = "bombCount";

    static C2S_isReady(isReady:boolean): string {
        // const json = JSON.parse(jsonString);
        const jsonObject = {
            cmd: JsonCMD.CMD_C2S_isReady,
            value:isReady
          };
          return JSON.stringify(jsonObject);
    }

    static S2C_allReady(): string {
        // const json = JSON.parse(jsonString);
        const jsonObject = {
            cmd: JsonCMD.CMD_S2C_allReady
       
          };
          return JSON.stringify(jsonObject);
    }

    static C2S_playerMove(moveX:number,moveY:number): string {
       //  const json = JSON.parse(jsonStr);
        const jsonObject = {
            cmd: JsonCMD.CMD_C2S_playerMove,
            moveX:moveX,
            moveY:moveY,
           
          };
          return JSON.stringify(jsonObject);
    }

    static C2S_usingProp(propType:PropType): string {
        //  const json = JSON.parse(jsonStr);

         const jsonObject = {
             cmd: JsonCMD.CMD_C2S_usingProp,
             propTypeStr:propType.toString()
          
           };
           return JSON.stringify(jsonObject);
     }

     static C2S_usingPropZoom(targetPropType:PropType,mx,my): string {
        //  const json = JSON.parse(jsonStr);

         const jsonObject = {
             cmd: JsonCMD.CMD_C2S_usingProp,
             propTypeStr:targetPropType.toString(),
             moveX:mx,
             moveY:my
          
           };
           return JSON.stringify(jsonObject);
     }
}