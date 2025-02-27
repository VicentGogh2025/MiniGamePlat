import { _decorator, Component, Node,Graphics,color, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DrawCicle')
export class DrawCicle extends Component {
    @property raius = 37;
    @property cbColor = Color.WHITE;
    start() {
        const graphics = this.getComponent(Graphics);
        if (graphics) {
            // 设置填充颜色为白色
            graphics.fillColor = this.cbColor;

            // 绘制一个 30x30 像素的矩形
            graphics.rect(0, 0, this.raius, this.raius);

            // 填充矩形
            graphics.fill();
        }
    }

    update(deltaTime: number) {
        
    }
}

