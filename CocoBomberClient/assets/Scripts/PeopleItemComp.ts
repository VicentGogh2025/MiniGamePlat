import { _decorator, Component, Node, Sprite, assetManager, Texture2D, SpriteFrame,Color, Label, ImageAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PeopleItemComp')
export class PeopleItemComp extends Component {
    @property(Sprite) circleSp;
    @property(Sprite) avatarSp;
    @property(Node) wrongNode;
    @property(Node) rightNode;
    @property(Label) nameLabel;

    @property(Node) failedNode;
    @property(Label) countDownLabel;
    @property(Sprite) countDownSprite;
    private _isCurrentPlayer = false;

    public sessionId: string;
    public seatSeq:number;
    start() {
        //this.rightNode.active = false;
      //  this.setReady(false);
     //   this.setIsCurrentPlayer(true);

   // this.CancelCountDownTime();
    }

    hexToColor(hex: string): Color {
        hex = hex.replace(/^#/, '');
        if (hex.length === 6) {
            return new Color(
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16)
            );
        } else if (hex.length === 8) {
            return new Color(
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16),
                parseInt(hex.slice(6, 8), 16)
            );
        } else {
            throw new Error("Invalid hex color format");
        }
    }

    public setFailed(){
        this.failedNode.active = true;
    }

    public setReady(isReady: boolean) {

        if(!this.isDisableRightWrongNode){
            this.setRightIcon(isReady);
        }
       
        if(this._isCurrentPlayer){
            this.setCircleColor(this.hexToColor("#FF9F04"));
            return;
        }
        if (isReady) {
            this.setCircleColor(this.hexToColor("#13CE20"));
        } else {
            this.setCircleColor(this.hexToColor("#FFFFFF"));
        }
      
    }
    private isDisableRightWrongNode = false;
    public disableRightWrongNode(){
        this.rightNode.active = false;
        this.wrongNode.active = false;
        this.isDisableRightWrongNode = true;
    }

    public setCountDownTime(timeStr:string){
        this.countDownSprite.color = new Color(255,255,255,255);
        // if(this.countDownNode.node.active == false){
        //     this.countDownNode.node.active = true;
        // }
        this.countDownLabel.string = timeStr;
    }

    public CancelCountDownTime(){
        this.countDownSprite.color = new Color(255,255,255,0);
    }

    private setRightIcon(isRight: boolean) {
        if(isRight){
        this.rightNode.active = true;
        this.wrongNode.active = false;
        }else{
            this.rightNode.active = false;
            this.wrongNode.active = true;
        }
    }

    public setLeave(isLeave: boolean) {
        if (isLeave) {
            this.setCircleColor(this.hexToColor("#C1C1C1"));
        } else {
            this.setCircleColor(this.hexToColor("#FFFFFF"));
        }
    }

    public setNickName(name: string) {
        if(name.length > 6)
            name = name.slice(0,6) + "...";
        this.nameLabel.string = name;
    }

    public getNickName(): string {
        return this.nameLabel.string;
    }

    public setIsCurrentPlayer(isCurrentPlayer: boolean) {
        this._isCurrentPlayer = isCurrentPlayer;
        if(this._isCurrentPlayer){
            this.nameLabel.color = this.hexToColor("#FFC003");
           // this.circleSp.node.color = this.hexToColor("#FF9F04");
            this.setCircleColor(this.hexToColor("#FF9F04"));
        }
    }
    public setAvatar(url: string) {
        const urlD =  decodeURI(url);
        try{
        assetManager.loadRemote(urlD, { ext: '.png' }, (err, img: ImageAsset) => {
            console.log('url', urlD);
            if (err) {
                console.error('Failed to load image:', err);
                return;
            }

            // 创建一个新的 SpriteFrame 并设置纹理
            const spriteFrame = new SpriteFrame();
            let tex = new Texture2D();
            tex.image = img;
            spriteFrame.texture = tex;
            // 将 SpriteFrame 设置到 Sprite 组件上
            this.avatarSp.spriteFrame = spriteFrame;
            this.avatarSp.node.width = 47.47;
            this.avatarSp.node.height = 72;
            
        });
    }catch(e){
        console.log("===set avatar==="+e);
    }
    }

    private setCircleColor(color: Color) {
        this.circleSp.color = color;
        console.log("setcirclecolor=="+color);
    }


    update(deltaTime: number) {

    }
}

