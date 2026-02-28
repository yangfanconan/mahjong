/**
 * 动画引擎
 * 
 * 支持动画：
 * - 出牌动画：手牌飞至出牌区
 * - 摸牌动画：牌从牌墙飞至手牌区
 * - 吃碰杠动画：明牌效果
 * - 胡牌动画：胡牌牌型放大闪烁
 * - 掷骰子动画：3D骰子滚动效果
 * - 结算动画：积分滚动显示
 */

const AnimationEngine = {
    canvas: null,
    ctx: null,
    animations: [],
    lastTime: 0,
    running: false,

    init: function(canvasId) {
        console.log('AnimationEngine.init 开始, canvasId=' + canvasId);
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('动画引擎初始化失败：找不到canvas');
            return false;
        }
        this.ctx = this.canvas.getContext('2d');
        this.animations = [];
        this.lastTime = 0;
        console.log('AnimationEngine.init 成功');
        return true;
    },

    start: function() {
        console.log('AnimationEngine.start 调用, running=' + this.running);
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
        console.log('AnimationEngine.start 完成');
    },

    stop: function() {
        console.log('AnimationEngine.stop 调用');
        this.running = false;
    },

    loop: function() {
        if (!this.running) return;
        
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        
        this.update(delta);
        this.render();
        
        requestAnimationFrame(() => this.loop());
    },

    update: function(delta) {
        this.animations = this.animations.filter(anim => {
            anim.elapsed += delta;
            if (anim.elapsed >= anim.duration) {
                anim.progress = 1;
                if (anim.render) {
                    anim.render(anim);
                }
                return false;
            }
            return true;
        });
    },

    render: function() {
        for (const anim of this.animations) {
            anim.render(anim);
        }
    },

    addAnimation: function(config) {
        console.log('AnimationEngine.addAnimation: type=' + config.type + ', duration=' + config.duration);
        const anim = {
            ...config,
            elapsed: 0,
            progress: 0
        };
        this.animations.push(anim);
        console.log('AnimationEngine.addAnimation: 完成后 animations数量=' + this.animations.length);
        
        if (!this.running) {
            console.log('AnimationEngine.addAnimation: 动画引擎未启动，自动启动');
            this.start();
        }
        
        return anim;
    },

    easeOutQuad: function(t) {
        return t * (2 - t);
    },

    easeOutBounce: function(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            t -= 1.5 / 2.75;
            return 7.5625 * t * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            t -= 2.25 / 2.75;
            return 7.5625 * t * t + 0.9375;
        } else {
            t -= 2.625 / 2.75;
            return 7.5625 * t * t + 0.984375;
        }
    },

    easeOutElastic: function(t) {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },

    chuPaiDongHua: function(fromX, fromY, toX, toY, pai, onComplete) {
        return this.addAnimation({
            type: 'chuPai',
            fromX,
            fromY,
            toX,
            toY,
            pai,
            duration: 300,
            rotation: 0,
            render: (anim) => {
                anim.progress = Math.min(anim.elapsed / anim.duration, 1);
                const ease = this.easeOutQuad(anim.progress);
                
                const x = fromX + (toX - fromX) * ease;
                const y = fromY + (toY - fromY) * ease;
                const scale = 1 + Math.sin(anim.progress * Math.PI) * 0.1;
                
                if (MahjongUI && MahjongUI.drawCard) {
                    this.ctx.save();
                    this.ctx.translate(x + MahjongUI.cardWidth / 2, y + MahjongUI.cardHeight / 2);
                    this.ctx.scale(scale, scale);
                    this.ctx.translate(-MahjongUI.cardWidth / 2, -MahjongUI.cardHeight / 2);
                    MahjongUI.drawCard(0, 0, pai, { selected: false });
                    this.ctx.restore();
                }
                
                if (anim.progress >= 1 && onComplete) {
                    onComplete();
                }
            }
        });
    },

    moPaiDongHua: function(toX, toY, pai, onComplete) {
        return this.addAnimation({
            type: 'moPai',
            toX,
            toY,
            pai,
            duration: 200,
            render: (anim) => {
                anim.progress = Math.min(anim.elapsed / anim.duration, 1);
                const ease = this.easeOutQuad(anim.progress);
                
                const startX = anim.toX;
                const startY = -MahjongUI.cardHeight;
                const x = startX + (anim.toX - startX) * ease;
                const y = startY + (anim.toY - startY) * ease;
                
                if (MahjongUI && MahjongUI.drawCard) {
                    MahjongUI.drawCard(x, y, pai, { selected: false });
                }
                
                if (anim.progress >= 1 && onComplete) {
                    onComplete();
                }
            }
        });
    },

    huPaiDongHua: function(x, y, paiList, onComplete) {
        return this.addAnimation({
            type: 'huPai',
            x,
            y,
            paiList,
            duration: 1500,
            render: (anim) => {
                anim.progress = Math.min(anim.elapsed / anim.duration, 1);
                
                const flash = Math.sin(anim.elapsed * 0.01) * 0.3 + 0.7;
                const scale = 1 + this.easeOutElastic(anim.progress) * 0.3;
                
                if (MahjongUI && MahjongUI.drawCard && paiList) {
                    const cardW = MahjongUI.cardWidth * 0.8;
                    const cardH = MahjongUI.cardHeight * 0.8;
                    const totalW = paiList.length * (cardW + 5);
                    const startX = x - totalW / 2;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = flash;
                    
                    for (let i = 0; i < paiList.length; i++) {
                        const px = startX + i * (cardW + 5);
                        const py = y - cardH / 2;
                        
                        this.ctx.save();
                        this.ctx.translate(px + cardW / 2, py + cardH / 2);
                        this.ctx.scale(scale, scale);
                        this.ctx.translate(-cardW / 2, -cardH / 2);
                        MahjongUI.drawCard(0, 0, paiList[i], { small: true });
                        this.ctx.restore();
                    }
                    
                    this.ctx.restore();
                }
                
                if (anim.progress >= 1 && onComplete) {
                    onComplete();
                }
            }
        });
    },

    zhiTouZiDongHua: function(x, y, onComplete) {
        console.log('zhiTouZiDongHua 开始, x=' + x + ', y=' + y);
        console.log('AnimationEngine.running=' + this.running + ', canvas=' + (this.canvas ? '存在' : '不存在'));
        return this.addAnimation({
            type: 'zhiTouZi',
            x,
            y,
            duration: 2000,
            dice1: Math.floor(Math.random() * 6) + 1,
            dice2: Math.floor(Math.random() * 6) + 1,
            render: (anim) => {
                anim.progress = Math.min(anim.elapsed / anim.duration, 1);
                
                const bounce = this.easeOutBounce(anim.progress);
                const rotation = (1 - anim.progress) * 20;
                
                if (anim.progress < 0.8) {
                    anim.dice1 = Math.floor(Math.random() * 6) + 1;
                    anim.dice2 = Math.floor(Math.random() * 6) + 1;
                }
                
                this.drawDice(x - 30, y, anim.dice1, rotation * 0.5);
                this.drawDice(x + 30, y, anim.dice2, -rotation * 0.7);
                
                if (anim.progress >= 1 && onComplete) {
                    console.log('骰子动画完成, dice1=' + anim.dice1 + ', dice2=' + anim.dice2);
                    onComplete({ dice1: anim.dice1, dice2: anim.dice2 });
                }
            }
        });
    },

    drawDice: function(x, y, value, rotation) {
        const size = 40;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation * Math.PI / 180);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetY = 3;
        this.ctx.fillRect(-size/2, -size/2, size, size);
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.fillStyle = '#d32f2f';
        
        const dotR = 4;
        const positions = this.getDiceDotPositions(value, size);
        for (const pos of positions) {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, dotR, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    },

    getDiceDotPositions: function(value, size) {
        const half = size / 4;
        const positions = [];
        
        switch(value) {
            case 1:
                positions.push({ x: 0, y: 0 });
                break;
            case 2:
                positions.push({ x: -half, y: -half });
                positions.push({ x: half, y: half });
                break;
            case 3:
                positions.push({ x: -half, y: -half });
                positions.push({ x: 0, y: 0 });
                positions.push({ x: half, y: half });
                break;
            case 4:
                positions.push({ x: -half, y: -half });
                positions.push({ x: half, y: -half });
                positions.push({ x: -half, y: half });
                positions.push({ x: half, y: half });
                break;
            case 5:
                positions.push({ x: -half, y: -half });
                positions.push({ x: half, y: -half });
                positions.push({ x: 0, y: 0 });
                positions.push({ x: -half, y: half });
                positions.push({ x: half, y: half });
                break;
            case 6:
                positions.push({ x: -half, y: -half });
                positions.push({ x: half, y: -half });
                positions.push({ x: -half, y: 0 });
                positions.push({ x: half, y: 0 });
                positions.push({ x: -half, y: half });
                positions.push({ x: half, y: half });
                break;
        }
        
        return positions;
    },

    fenShuGunDongDongHua: function(x, y, startScore, endScore, duration, onComplete) {
        return this.addAnimation({
            type: 'fenShuGunDong',
            x,
            y,
            startScore,
            endScore,
            duration: duration || 1000,
            render: (anim) => {
                anim.progress = Math.min(anim.elapsed / anim.duration, 1);
                const ease = this.easeOutQuad(anim.progress);
                
                const currentScore = Math.floor(startScore + (endScore - startScore) * ease);
                
                this.ctx.save();
                this.ctx.font = 'bold 32px Arial';
                this.ctx.fillStyle = endScore > 0 ? '#4caf50' : '#f44336';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                if (endScore > 0) {
                    this.ctx.shadowColor = '#4caf50';
                    this.ctx.shadowBlur = 10;
                }
                
                const prefix = endScore >= 0 ? '+' : '';
                this.ctx.fillText(prefix + currentScore, x, y);
                
                this.ctx.restore();
                
                if (anim.progress >= 1 && onComplete) {
                    onComplete();
                }
            }
        });
    },

    clearAnimations: function() {
        this.animations = [];
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationEngine;
}

// 牌大小缩放支持
(function() {
    var originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function() {
        if (arguments.length >= 5 && window.cardSizeScale && window.cardSizeScale !== 1.0) {
            // 检测是否是麻将牌绘制（根据宽高比）
            var w = arguments[3];
            var h = arguments[4];
            if (w > 20 && h > 30 && w/h > 0.5 && w/h < 1.0) {
                var scale = window.cardSizeScale;
                var args = Array.from(arguments);
                args[3] = w * scale;
                args[4] = h * scale;
                return originalDrawImage.apply(this, args);
            }
        }
        return originalDrawImage.apply(this, arguments);
    };
})();
