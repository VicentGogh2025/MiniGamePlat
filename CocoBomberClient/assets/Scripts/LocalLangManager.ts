import { _decorator, Component, Node } from 'cc';
import { LangBasic } from './Lang/LangJsonReflecion';
const { ccclass, property } = _decorator;

@ccclass('LocalLangManager')
export class LocalLangManager extends Component {
    private static _instance:LocalLangManager;
    public static get instance():LocalLangManager{
        return this._instance;
    }

    public langBasic:LangBasic
    start() {
        this.init();
    }

    public static resetInstance(){
        LocalLangManager._instance = null;
    }

    private loadLangConfig(){
        fetch("https://api.luckybooms.com/api/config/game_center").then((response: Response) => {
            return response.text()
        }).then((value) => {
            var jsonObj = JSON.parse(value);
          //  console.log("langvalue=="+jsonObj.code);
            if(jsonObj.code != 200){
                console.log("请求游戏语言配置失败："+jsonObj.message);
                return;
            }
            console.log("请求游戏语言配置成功");
            this.langBasic = LangBasic.fromJSON(jsonObj.data.basic);
            console.log("langvalue=="+this.langBasic.phoneCode);
        })
    }
    
    private init(){
            if(!LocalLangManager.instance){
                LocalLangManager._instance = this;
               // director.addPersistRootNode(this.node);
            }

            this.loadLangConfig()
        }

        

    update(deltaTime: number) {
        
    }
}

// {
//     "code": 200, // 接口状态码
//     "message": "请求成功", // 接口响应信息
//     "data": {
//         "basic": { // 基础信息配置
//             "languagecode": "zh", // 语言代码（中文）
//             "nativeName": "中国", // 本地语言名称
//             "flagUrl": "https://cdn.example.com/flags/cn.png", // 国旗图片地址
//             "phoneCode": "86", // 国际电话区号
//             "countryCode": "CN", // 国家二字码
//             "countryName": "China", // 英文国家名称
//             "chineseName": "中国", // 中文国家名称
//             "currencyCode": "CNY", // 货币代码（人民币）
//             "currencySymbol": "¥" // 货币符号
//         },
//         "luckyBooms": { // 幸运爆炸游戏相关配置
//             "home": { // 首页配置
//                 "roomNumberPlaceholder": "请输入房间号码", // 房间号输入框占位文本
//                 "roomNumberPlaceholderButton": "搜索", // 搜索按钮文本
//                 "demoAreaTitle": "五人房立即开始试玩", // 试玩区域标题
//                 "demoAreaButton": "立即试试", // 试玩按钮文本
//                 "inviteAreaText": "请邀请你的好友一起加入吧！", // 邀请区域文本
//                 "playerCount": "-人数" // 玩家数量显示格式
//             },
//             "createRoom": { // 创建房间配置
//                 "title": "创建房间", // 页面标题
//                 "roomName": "房间名称", // 房间名称标签
//                 "roomId": "房间ID", // 房间ID标签
//                 "playerCount": "人数", // 人数标签
//                 "entryFee": "入场费", // 入场费标签
//                 "minCoins": "最低5金币" // 最低金币要求提示
//             },
//             "share": { // 分享功能配置
//                 "shareButton": "分享", // 分享按钮文本
//                 "copyButton": "复制" // 复制按钮文本
//             },
//             "matching": { // 匹配系统配置
//                 "tip": "提示", // 提示标签
//                 "playerUnit": "人", // 人数单位
//                 "entryFee": "入场费", // 入场费标签
//                 "matchingText": "匹配中...", // 匹配状态文本
//                 "buttons": {
//                     "cancel": "取消匹配" // 取消匹配按钮文本
//                 }
//             },
//             "preparation": { // 准备阶段配置
//                 "readyTip": "做好准备，马上开始...", // 准备提示文本
//                 "readyButton": "准备好了" // 准备按钮文本
//             }
//         },
//         "gamePage": { // 游戏页面配置
//             "win": "获胜", // 获胜状态文本
//             "out": "淘汰" // 淘汰状态文本
//         },
//         "winPage": { // 胜利页面配置
//             "congratsMessage": "获胜者", // 胜利提示文本
//             "buttons": {
//                 "again": "再来一局", // 再玩一次按钮文本
//                 "quit": "退出游戏" // 退出游戏按钮文本
//             }
//         },
//         "propsPage": { // 道具页面配置
//             "title": "道具页面", // 页面标题
//             "props": {
//                 "prop1": {
//                     "name": "跳过道具", // 道具1名称
//                     "description": "道具说明" // 道具1描述
//                 },
//                 "prop2": {
//                     "name": "透视镜", // 道具2名称
//                     "description": "道具说明" // 道具2描述
//                 }
//             },
//             "buttons": {
//                 "use": "使用道具" // 使用道具按钮文本
//             }
//         }
//     }
// }