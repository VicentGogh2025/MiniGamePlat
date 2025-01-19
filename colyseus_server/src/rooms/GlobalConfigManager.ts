import axios from 'axios';
export class GlobalConfigManager{
    private static instance: GlobalConfigManager;
    public static readonly gameKey = "abc123xyz789";
    public static readonly RobotURLPrefix = "https://api.luckybooms.com/api/robot";
   // public static readonly removeOneRobotPlayer = RobotURLPrefix+"/release_robots?game_key=abc123xyz789&ids=1";
   // public static readonly getOneRobotPlayer = "https://api.luckybooms.com/api/robot/get_robots?game_key=abc123xyz789&count=1";
    // 私有构造函数，防止外部实例化
    private constructor() {}

    // 获取单例实例的方法
    public static getInstance(): GlobalConfigManager {
        if (!GlobalConfigManager.instance) {
            GlobalConfigManager.instance = new GlobalConfigManager();
        }
        return GlobalConfigManager.instance;
    }

    public static getRobotsPlayerGetUrl(count:number):string{
        return `${GlobalConfigManager.RobotURLPrefix}/get_robots?game_key=${GlobalConfigManager.gameKey}&count=${count}`;
    }

    public static getRobotsPlayerReleaseUrl():string{
        return `${GlobalConfigManager.RobotURLPrefix}/release_robots`;
    }
}
// {
// 	"code": 0,
// 	"data": {
// 		"robots": [
// 			{
// 				"id": 2099,
// 				"nickname": "Ipaldi Rikardo",
// 				"avatar": "https://lucky-us.oss-us-east-1.aliyuncs.com/robotavatar/Ipaldi_Rikardo.jpg",
// 				"countryCode": "ID"
// 			},
// 			{
// 				"id": 2100,
// 				"nickname": "user1839508626819",
// 				"avatar": "https://lucky-us.oss-us-east-1.aliyuncs.com/robotavatar/user1839508626819.jpg",
// 				"countryCode": "ID"
// 			}
// 		],
// 		"count": 2
// 	}
// }
//release robot
// {
// 	"code": 0,
// 	"message": "成功释放 2 个机器人",
// 	"data": {
// 		"total_requested": 2,
// 		"successfully_released": 2,
// 		"already_idle": [],
// 		"released_ids": [
// 			2099,
// 			2100
// 		]
// 	}
// }