import axios from 'axios';
import { GlobalConfigManager } from './GlobalConfigManager';
export class RobotPlayerManager{
  //  private static instance: RobotPlayerManager;
 // 私有构造函数，防止外部实例化
 //private constructor() {}

 // 获取单例实例的方法
//  public static getInstance(): RobotPlayerManager {
//      if (!RobotPlayerManager.instance) {
//          RobotPlayerManager.instance = new RobotPlayerManager();
//      }
//      return RobotPlayerManager.instance;
//  }

 
// 		"id": 2099,
// 		"nickname": "Ipaldi Rikardo",
// 		"avatar": "https://lucky-us.oss-us-east-1.aliyuncs.com/robotavatar/Ipaldi_Rikardo.jpg",
// 		"countryCode": "ID"
// 			
 private RobotPlayerInUsedArray: any[] = [];
 public async addRobotPlayer(count:number):Promise<any>{
    console.log("addRobotPlayer");
    try {
        const data = await this.fetchRobotPlayer(count);
        console.log("Fetched RobotPlayerInUsedArray:");
        return data;
       
    } catch (error) {
        console.error("Error:", error);
        return null;
    }

}

///remove all fecthed robot player
public async removeAllRobotPlayer(){
    console.log("removeRobotPlayer");
    try {
        let RobotInUsedIds: number[] = [];
        this.RobotPlayerInUsedArray.forEach((robot) => {
            RobotInUsedIds.push(robot.id);
        });
        const data = await this.returnRobotPlayer(RobotInUsedIds);
        if(data.code == 0){
            this.RobotPlayerInUsedArray = [];
            console.log("Returned all robot success");
        }else{
            throw new Error("code is not 0 see message",data.message)
        }
        console.log("Returned robot player data:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

    // 获取机器人玩家的方法
    private async fetchRobotPlayer(count:number): Promise<any> {
        try {
            const getUrl = GlobalConfigManager.getRobotsPlayerGetUrl(count);
            console.log("getUrl=="+getUrl);
            const response = await axios.get(getUrl);
            if(response.data.code!=0)
                throw new Error("code is not 0 see message",response.data.message);
            console.log("fetchrobot=="+response.data);    
            response.data.data.robots.forEach((robot: any) => {
                this.RobotPlayerInUsedArray.push(robot);
            });
            console.log("this.RobotPlayerInUsedArray=="+this.RobotPlayerInUsedArray.length)
            return this.RobotPlayerInUsedArray;
        } catch (error) {
            console.error("Error fetching robot player:", error);
            throw error;
        }
    }

    private async returnRobotPlayer(idArray: number[]): Promise<any> {
        if(idArray.length == 0){
            return;
        }
        try {
            const postUrl = GlobalConfigManager.getRobotsPlayerReleaseUrl();
            const response = await axios.post(postUrl, {
                game_key: GlobalConfigManager.gameKey,
                robot_ids: idArray
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("returnRobotPlayer=="+JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error("Error returning robot player:", error);
            throw error;
        }
        // try {
        //     const postUrl = GlobalConfigManager.getRobotsPlayerReleaseUrl();
        //     const response = await axios.get(getUrl);
        //     return response.data;
        // } catch (error) {
        //     console.error("Error fetching robot player:", error);
        //     throw error;
        // }
    }
}