/**
 * 麻将UI渲染模块 - Canvas绘制麻将牌
 * 优化版：更美观的麻将牌设计
 */

const MahjongUI = (function() {
    'use strict';

    let canvas = null;
    let ctx = null;
    let currentTheme = 'guofeng';
    let selectedCards = [];

    let cardWidth = 45;
    let cardHeight = 65;
    let cardGap = 5;

    const themes = {
        guofeng: {
            tableBg: '#1a5c36',
            tableBg2: '#0d3d1f',
            cardBg: '#fffff5',
            cardBgDark: '#e8e8d8',
            cardBorder: '#8b7355',
            textRed: '#c41e3a',
            textBlack: '#1a1a1a',
            textBlue: '#1e90ff',
            shadow: 'rgba(0,0,0,0.4)',
            highlight: 'rgba(255,215,0,0.6)'
        },
        japanese: {
            tableBg: '#2d5a3d',
            tableBg2: '#1e4030',
            cardBg: '#faf8f0',
            cardBgDark: '#e0ddd0',
            cardBorder: '#666',
            textRed: '#e53935',
            textBlack: '#333',
            textBlue: '#2196f3',
            shadow: 'rgba(0,0,0,0.3)',
            highlight: 'rgba(100,200,255,0.5)'
        },
        modern: {
            tableBg: '#1a237e',
            tableBg2: '#0d1642',
            cardBg: '#ffffff',
            cardBgDark: '#f0f0f0',
            cardBorder: '#9c27b0',
            textRed: '#e91e63',
            textBlack: '#212121',
            textBlue: '#00bcd4',
            shadow: 'rgba(0,0,0,0.4)',
            highlight: 'rgba(156,39,176,0.5)'
        }
    };

    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas初始化失败');
            return false;
        }
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchstart', handleTouch, { passive: false });
        console.log('UI初始化完成: canvas=' + canvasId);
        return true;
    }

    function resize() {
        if (!canvas) return;
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth * dpr;
        canvas.height = container.clientHeight * dpr;
        canvas.style.width = container.clientWidth + 'px';
        canvas.style.height = container.clientHeight + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const w = container.clientWidth;
        const h = container.clientHeight;
        
        if (w < 600) {
            cardWidth = 32;
            cardHeight = 46;
            cardGap = 2;
        } else if (w < 1000) {
            cardWidth = 38;
            cardHeight = 54;
            cardGap = 3;
        } else {
            cardWidth = 44;
            cardHeight = 62;
            cardGap = 4;
        }
    }

    function setTheme(theme) {
        if (themes[theme]) currentTheme = theme;
    }

    function getThemeConfig() {
        return themes[currentTheme];
    }

    function clear() {
        if (!canvas) return;
        const container = canvas.parentElement;
        ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
    }

    function drawTable() {
        if (!canvas) return;
        const container = canvas.parentElement;
        const theme = getThemeConfig();
        const w = container.clientWidth;
        const h = container.clientHeight;

        // 渐变背景
        const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
        gradient.addColorStop(0, theme.tableBg);
        gradient.addColorStop(1, theme.tableBg2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // 桌面纹理
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
        }
        for (let i = 0; i < h; i += 20) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
            ctx.stroke();
        }

        // 中央区域
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, w*0.28, h*0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255,215,0,0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawCard(x, y, pai, options = {}) {
        const theme = getThemeConfig();
        const { selected = false, faceDown = false, small = false } = options;
        
        const w = small ? cardWidth * 0.7 : cardWidth;
        const h = small ? cardHeight * 0.7 : cardHeight;
        const drawY = selected ? y - 15 : y;

        ctx.save();

        // 阴影
        ctx.shadowColor = theme.shadow;
        ctx.shadowBlur = selected ? 12 : 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = selected ? 4 : 2;

        // 牌底
        if (faceDown) {
            const grad = ctx.createLinearGradient(x, drawY, x + w, drawY + h);
            grad.addColorStop(0, '#2e7d32');
            grad.addColorStop(1, '#1b5e20');
            ctx.fillStyle = grad;
        } else {
            const grad = ctx.createLinearGradient(x, drawY, x, drawY + h);
            grad.addColorStop(0, theme.cardBg);
            grad.addColorStop(1, theme.cardBgDark);
            ctx.fillStyle = grad;
        }
        
        roundRect(x, drawY, w, h, 4);
        ctx.fill();

        ctx.shadowColor = 'transparent';

        // 边框
        ctx.strokeStyle = selected ? '#ffd700' : theme.cardBorder;
        ctx.lineWidth = selected ? 2 : 1;
        roundRect(x, drawY, w, h, 4);
        ctx.stroke();

        // 选中高亮
        if (selected) {
            ctx.fillStyle = theme.highlight;
            roundRect(x, drawY, w, h, 4);
            ctx.fill();
        }

        // 牌面内容
        if (!faceDown && pai) {
            drawCardContent(x, drawY, w, h, pai, theme);
        } else if (faceDown) {
            // 背面花纹
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            ctx.arc(x + w/2, drawY + h/2, Math.min(w, h) * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawCardContent(x, y, w, h, pai, theme) {
        if (SkinManager.isEmojiSkin()) {
            var tileCanvas = SkinManager.getEmojiTileImage(pai, w, h);
            if (tileCanvas) {
                ctx.drawImage(tileCanvas, x, y, w, h);
                return;
            }
        }
        
        var unicode = MahjongTiles.huoQuUnicode(pai);
        if (unicode) {
            ctx.save();
            var fontSize = Math.min(w, h);
            ctx.font = fontSize + 'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(unicode, x + w / 2, y + h / 2 + fontSize * 0.12);
            ctx.restore();
        } else {
            var cx = x + w / 2;
            var cy = y + h / 2;
            var isRed = isRedCard(pai);
            ctx.fillStyle = isRed ? theme.textRed : theme.textBlack;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (pai.hua === 'feng') {
                ctx.font = 'bold ' + (h * 0.45) + 'px "SimSun", serif';
                ctx.fillText(getCardDisplay(pai), cx, cy);
            } else if (pai.hua === 'jian') {
                ctx.font = 'bold ' + (h * 0.4) + 'px "SimSun", serif';
                var text = getCardDisplay(pai);
                ctx.fillText(text, cx, cy);
                
                if (pai.dian === 1) {
                    ctx.strokeStyle = theme.textRed;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(cx - h*0.25, cy - h*0.15, h*0.5, h*0.3);
                }
            } else {
                ctx.font = 'bold ' + (h * 0.38) + 'px Arial';
                var num = getCardDisplay(pai);
                var suit = getHuaSeText(pai.hua);
                
                ctx.fillText(num, cx, cy - h * 0.08);
                ctx.font = (h * 0.22) + 'px Arial';
                ctx.fillText(suit, cx, cy + h * 0.25);
            }
        }
    }

    function isRedCard(pai) {
        if (pai.hua === 'jian') {
            return pai.dian === 1 || pai.dian === 2;
        }
        return false;
    }

    function getCardDisplay(pai) {
        const nums = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
        if (pai.hua === 'feng') return ['東', '南', '西', '北'][pai.dian - 1];
        if (pai.hua === 'jian') return ['中', '發', '白'][pai.dian - 1];
        return nums[pai.dian - 1] || String(pai.dian);
    }

    function getHuaSeText(hua) {
        return { 'wan': '萬', 'tiao': '條', 'tong': '筒' }[hua] || '';
    }

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function drawPlayerHand(shouPai, selectedIds = []) {
        if (!shouPai || shouPai.length === 0) return;

        const container = canvas.parentElement;
        const totalWidth = (shouPai.length - 1) * (cardWidth + cardGap) + cardWidth;
        let startX = (container.clientWidth - totalWidth) / 2;
        let startY = container.clientHeight - cardHeight - 80;

        selectedCards = [];

        for (let i = 0; i < shouPai.length; i++) {
            const pai = shouPai[i];
            const isSelected = selectedIds.includes(pai.id);
            const cardX = startX + i * (cardWidth + cardGap);
            
            if (isSelected) {
                selectedCards.push({ pai, x: cardX, y: startY - 15, w: cardWidth, h: cardHeight });
            }
            
            drawCard(cardX, startY, pai, { selected: isSelected });
        }
    }

    function drawOpponentHand(count, position) {
        if (count === 0) return;

        const container = canvas.parentElement;
        const sw = cardWidth * 0.55;
        const sh = cardHeight * 0.55;
        const gap = 2;
        
        let startX, startY;

        switch (position) {
            case 'right':
                startX = container.clientWidth - sw - 15;
                startY = (container.clientHeight - count * (sw + gap)) / 2;
                for (let i = 0; i < count; i++) {
                    drawCard(startX, startY + i * (sw + gap), null, { faceDown: true, small: true });
                }
                break;
            case 'top':
                startX = (container.clientWidth - count * (sw + gap)) / 2;
                startY = 55;
                for (let i = 0; i < count; i++) {
                    drawCard(startX + i * (sw + gap), startY, null, { faceDown: true, small: true });
                }
                break;
            case 'left':
                startX = 15;
                startY = (container.clientHeight - count * (sw + gap)) / 2;
                for (let i = 0; i < count; i++) {
                    drawCard(startX, startY + i * (sw + gap), null, { faceDown: true, small: true });
                }
                break;
        }
    }

    function drawDiscCards(cards, position) {
        if (!cards || cards.length === 0) return;

        const container = canvas.parentElement;
        const sw = cardWidth * 0.45;
        const sh = cardHeight * 0.45;
        const gapX = 3;
        const gapY = 3;
        const maxPerLine = 9;
        
        const w = container.clientWidth;
        const h = container.clientHeight;
        const centerX = w / 2;
        const centerY = h / 2;

        const lines = Math.ceil(cards.length / maxPerLine);

        for (let i = 0; i < cards.length; i++) {
            const lineNum = Math.floor(i / maxPerLine);
            const posInLine = i % maxPerLine;
            let x, y;
            
            switch (position) {
                case 'bottom':
                    x = centerX - (maxPerLine * (sw + gapX)) / 2 + posInLine * (sw + gapX);
                    y = h - cardHeight - 160 + lineNum * (sh + gapY);
                    break;
                case 'top':
                    x = centerX - (maxPerLine * (sw + gapX)) / 2 + posInLine * (sw + gapX);
                    y = 95 + lineNum * (sh + gapY);
                    break;
                case 'left':
                    x = 90 + lineNum * (sw + gapX);
                    y = centerY - (maxPerLine * (sh + gapY)) / 2 + posInLine * (sh + gapY);
                    break;
                case 'right':
                    x = w - 90 - sw - lineNum * (sw + gapX);
                    y = centerY - (maxPerLine * (sh + gapY)) / 2 + posInLine * (sh + gapY);
                    break;
            }
            drawCard(x, y, cards[i], { small: true });
        }
    }

    function drawPlayerInfo(name, count, isTeammate, position) {
        const container = canvas.parentElement;
        const theme = getThemeConfig();
        
        let x, y;
        const boxW = 70;
        const boxH = 35;

        switch (position) {
            case 'bottom':
                x = 15;
                y = container.clientHeight - boxH - 15;
                break;
            case 'right':
                x = container.clientWidth - boxW - 15;
                y = 55;
                break;
            case 'top':
                x = (container.clientWidth - boxW) / 2;
                y = 15;
                break;
            case 'left':
                x = 15;
                y = 55;
                break;
        }

        // 背景
        ctx.fillStyle = isTeammate ? 'rgba(76,175,80,0.7)' : 'rgba(33,33,33,0.7)';
        roundRect(x, y, boxW, boxH, 6);
        ctx.fill();

        // 文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, x + boxW/2, y + 12);
        
        ctx.font = '12px Arial';
        ctx.fillText(`${count}张`, x + boxW/2, y + 26);
    }

    let lastClickTime = 0;
    
    function handleClick(e) {
        const now = Date.now();
        if (now - lastClickTime < 200) return;
        lastClickTime = now;
        
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (window.onCardClick) {
            const clickedCard = getClickedCard(x, y);
            if (clickedCard && clickedCard.pai) {
                window.onCardClick(clickedCard, x, y);
            } else {
                console.log('点击了无效位置或无牌');
            }
        }
    }

    function handleTouch(e) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastClickTime < 200) return;
        lastClickTime = now;
        
        if (!canvas) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (window.onCardClick) {
            const clickedCard = getClickedCard(x, y);
            if (clickedCard && clickedCard.pai) {
                window.onCardClick(clickedCard, x, y);
            } else {
                console.log('触摸了无效位置或无牌');
            }
        }
    }

    function getClickedCard(x, y) {
        const container = canvas.parentElement;
        if (!window.currentHand || window.currentHand.length === 0) {
            console.log('No currentHand');
            return null;
        }
        
        const totalWidth = (window.currentHand.length - 1) * (cardWidth + cardGap) + cardWidth;
        const startX = (container.clientWidth - totalWidth) / 2;
        const startY = container.clientHeight - cardHeight - 80;

        console.log('getClickedCard - startX:', startX, 'startY:', startY, 'cardW:', cardWidth, 'cardH:', cardHeight);

        for (let i = window.currentHand.length - 1; i >= 0; i--) {
            const cardX = startX + i * (cardWidth + cardGap);
            const cardY = startY;
            
            if (x >= cardX && x <= cardX + cardWidth && y >= cardY - 15 && y <= cardY + cardHeight) {
                return { index: i, pai: window.currentHand[i] };
            }
        }
        return null;
    }

    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
    }

    function drawMingPai(mingPaiList, position) {
        if (!mingPaiList || mingPaiList.length === 0) return;

        const container = canvas.parentElement;
        const sw = cardWidth * 0.45;
        const sh = cardHeight * 0.45;
        const gap = 2;
        const groupGap = 8;
        
        const w = container.clientWidth;
        const h = container.clientHeight;
        const centerX = w / 2;
        const centerY = h / 2;

        let startX, startY, direction;

        switch (position) {
            case 'bottom':
                startX = 15;
                startY = h - cardHeight - 100;
                direction = 'horizontal';
                break;
            case 'top':
                startX = 15;
                startY = 55;
                direction = 'horizontal';
                break;
            case 'left':
                startX = 15;
                startY = h - 100;
                direction = 'vertical';
                break;
            case 'right':
                startX = w - sw - 15;
                startY = h - 100;
                direction = 'vertical';
                break;
        }

        let offsetX = 0;
        let offsetY = 0;

        for (const group of mingPaiList) {
            const paiZu = group.paiZu || [];
            
            for (let i = 0; i < paiZu.length; i++) {
                const pai = paiZu[i];
                let x, y;
                
                if (direction === 'horizontal') {
                    x = startX + offsetX + i * (sw + gap);
                    y = startY;
                    
                    if (group.leiXing === 'gang' && i === paiZu.length - 1) {
                        y -= 10;
                    }
                } else {
                    x = startX;
                    y = startY - offsetY - i * (sh + gap);
                    
                    if (group.leiXing === 'gang' && i === paiZu.length - 1) {
                        x += 10;
                    }
                }
                
                drawCard(x, y, pai, { small: true });
            }
            
            if (direction === 'horizontal') {
                offsetX += paiZu.length * (sw + gap) + groupGap;
            } else {
                offsetY += paiZu.length * (sh + gap) + groupGap;
            }
        }
    }

    let currentSkin = null;

    function loadSkin(skin) {
        if (!skin) return;
        currentSkin = skin;
        console.log('UI已切换到皮肤:', skin.displayName || skin.name);
    }

    function getCurrentSkin() {
        return currentSkin;
    }

    function getPaiFileName(pai) {
        if (!pai) return null;
        const hua = pai.hua;
        const dian = pai.dian;
        
        if (hua === 'wan') return dian + 'wan.png';
        if (hua === 'tiao') return dian + 'tiao.png';
        if (hua === 'tong') return dian + 'tong.png';
        
        if (hua === 'feng') {
            const fengNames = { 1: 'dong_feng', 2: 'nan_feng', 3: 'xi_feng', 4: 'bei_feng' };
            return fengNames[dian] + '.png';
        }
        
        if (hua === 'jian') {
            const jianNames = { 1: 'zhong', 2: 'fa', 3: 'bai' };
            return jianNames[dian] + '.png';
        }
        
        if (hua === 'hua') {
            const huaNames = { 1: 'chun', 2: 'xia', 3: 'qiu', 4: 'dong', 5: 'mei', 6: 'lan', 7: 'zhu', 8: 'ju' };
            return huaNames[dian] + '.png';
        }
        
        return null;
    }

    function getSkinResourceUrl(category, fileName) {
        if (!currentSkin) return null;
        return 'skin/' + currentSkin.name + '/' + category + '/' + fileName;
    }

    return {
        init,
        resize,
        setTheme,
        getThemeConfig,
        clear,
        drawTable,
        drawCard,
        drawPlayerHand,
        drawOpponentHand,
        drawDiscCards,
        drawPlayerInfo,
        drawMingPai,
        showToast,
        loadSkin,
        getCurrentSkin,
        get cardWidth() { return cardWidth; },
        get cardHeight() { return cardHeight; },
        setCardSize
    };
})();

/**
 * 设置麻将牌大小
 * @param {string} size - 'small', 'medium', 'large'
 */
function setCardSize(size) {
    switch(size) {
        case 'small':
            cardWidth = 32;
            cardHeight = 46;
            break;
        case 'medium':
            cardWidth = 38;
            cardHeight = 54;
            break;
        case 'large':
            cardWidth = 44;
            cardHeight = 62;
            break;
        default:
            cardWidth = 38;
            cardHeight = 54;
    }
    console.log('牌大小已设置为：' + size + ' (' + cardWidth + 'x' + cardHeight + ')');
}

// 导出函数
