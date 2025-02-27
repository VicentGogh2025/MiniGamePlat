import { _decorator, Component, director, Node, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InitComp')
export class InitComp extends Component {
    @property({
        type:ProgressBar
    })
    private myProgressBar;


    start() {
       // this.myProgressBar.progress = 100;
       // cc.log("ssss");
        director.loadScene("MainScene");
        console.log("ssss");
    }

    update(deltaTime: number) {
        // this.myProgressBar.progress = this.myProgressBar.progress - 0.1;
        // console.log(this.myProgressBar.progress)
     //   console.log("ssss");
    }
}

