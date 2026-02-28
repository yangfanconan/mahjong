/**
 * 麻将主程序 - 完整版
 * 
 * 功能：
 * - 多规则支持（四川/广东/日本/国际）
 * - 完整游戏流程（定庄、掷骰、摸牌、出牌、吃碰杠胡、流局）
 * - 积分结算系统
 * - 动画效果
 * - AI对战
 */

(function() {
    'use strict';

    let gameState = {
        phase: 'idle',
        guiZeId: 'sichuan',
        wanJiaShouPai: [],
        duiShouShouPai: [[], [], []],
        shengYuPaiZu: [],
        chuPaiDui: [[], [], [], []],
        mingPaiQu: [[], [], [], []],
        gangPaiJiLu: [],
        huiHeShu: 0,
        dangQianChuPaiZhe: 0,
        shangJiaChuPai: null,
        shangJiaChuPaiZhe: null,
        queMen: null,
        selectedPai: [],
        pendingAction: null,
        zhuangJia: 0,
        lianZhuangCiShu: 0,
        tingPaiList: [],
        gangShangHua: false
    };

    let settings = {
        theme: 'guofeng',
        soundEnabled: true,
        nanDu: 2,
        guiZeId: 'sichuan'
    };

    let roundCount = 1;
    let totalScore = 0;
    let playerScores = [20000, 20000, 20000, 20000];
    let gameHistory = [];

    function init() {
        MahjongStorage.init();
        MahjongSound.init();
        
        if (!MahjongUI.init('game-canvas')) {
            console.error('UI初始化失败');
            return;
        }
        
        if (typeof AnimationEngine !== 'undefined') {
            AnimationEngine.init('game-canvas');
            AnimationEngine.start();
        }
        
        if (typeof SkinManager !== 'undefined') {
            SkinManager.init();
        }
        
        if (typeof SkinManager !== 'undefined') {
            SkinManager.init();
        }
        
        RuleEngine.zhuCeGuiZe(RuleSichuan);
        RuleEngine.zhuCeGuiZe(RuleGuangdong);
        RuleEngine.zhuCeGuiZe(RuleJapan);
        RuleEngine.zhuCeGuiZe(RuleInternational);
        
        loadSettings();
        bindEvents();
        showStartModal();
    }

    function loadSettings() {
        const saved = MahjongStorage.loadSettings();
        settings = { ...settings, ...saved };
        
        document.body.dataset.theme = settings.theme;
        MahjongUI.setTheme(settings.theme);
        MahjongSound.setEnabled(settings.soundEnabled);
        AILogic.sheZhiNanDu(settings.nanDu);
        
        RuleEngine.qieHuanGuiZe(settings.guiZeId);
    }

    function showStartModal() {
        gameState.phase = 'idle';
        const modal = document.getElementById('start-modal');
        if (modal) modal.classList.remove('hidden');
        
        const stats = MahjongStorage.loadStats();
        document.getElementById('stat-total').textContent = stats.totalGames || 0;
        document.getElementById('stat-winrate').textContent = 
            stats.totalGames > 0 ? Math.round((stats.wins || 0) / stats.totalGames * 100) + '%' : '0%';
        document.getElementById('stat-maxfan').textContent = (stats.maxFanShu || 0) + '番';
    }

    function hideStartModal() {
        const modal = document.getElementById('start-modal');
        if (modal) modal.classList.add('hidden');
    }

    function startGame() {
        if (gameState.phase === 'playing') return;
        
        const guiZeId = document.getElementById('rule-select').value;
        settings.guiZeId = guiZeId;
        MahjongStorage.saveSettings(settings);
        
        RuleEngine.qieHuanGuiZe(guiZeId);
        
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        if (guiZe && guiZe.chuShiHua) {
            guiZe.chuShiHua();
        }
        
        if (typeof ScoreSystem !== 'undefined') {
            ScoreSystem.chuShiHua(guiZe);
        }
        
        hideStartModal();
        
        if (guiZeId === 'sichuan') {
            showQueMenModal();
            return;
        }
        
        startGamePlay();
    }

    function showQueMenModal() {
        const modal = document.getElementById('que-men-modal');
        if (modal) modal.classList.remove('hidden');
    }

    function openSkinCenter() {
        const modal = document.getElementById('skin-modal');
        if (modal) {
            modal.classList.remove('hidden');
            renderSkinList();
        }
    }

    function renderSkinList() {
        const skinList = document.getElementById('skin-list');
        if (!skinList) return;
        
        const skins = SkinManager.getAvailableSkins();
        const currentSkin = SkinManager.getCurrentSkin();
        
        skinList.innerHTML = '';
        
        skins.forEach(function(skin) {
            const item = document.createElement('div');
            item.className = 'skin-item';
            if (skin.name === currentSkin.name) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <div class="skin-name">${skin.displayName}</div>
                <div class="skin-desc">${skin.description}</div>
                <div class="skin-author">${skin.author || '未知'}</div>
            `;
            
            item.addEventListener('click', function() {
                document.querySelectorAll('.skin-item').forEach(function(el) {
                    el.classList.remove('active');
                });
                item.classList.add('active');
                previewSkin(skin.name);
            });
            
            skinList.appendChild(item);
        });
        
        const previewCanvas = document.getElementById('skin-preview-canvas');
        if (previewCanvas) {
            SkinManager.previewSkin(currentSkin.name, previewCanvas);
        }
    }

    function previewSkin(skinName) {
        const previewCanvas = document.getElementById('skin-preview-canvas');
        if (previewCanvas) {
            SkinManager.previewSkin(skinName, previewCanvas);
        }
    }

    function startGamePlay() {
        gameState = {
            phase: 'preparing',
            guiZeId: settings.guiZeId,
            wanJiaShouPai: [],
            duiShouShouPai: [[], [], []],
            shengYuPaiZu: [],
            chuPaiDui: [[], [], [], []],
            mingPaiQu: [[], [], [], []],
            gangPaiJiLu: [],
            huiHeShu: 0,
            dangQianChuPaiZhe: 0,
            shangJiaChuPai: null,
            shangJiaChuPaiZhe: null,
            queMen: gameState.queMen,
            selectedPai: [],
            pendingAction: null,
            zhuangJia: 0,
            lianZhuangCiShu: 0,
            tingPaiList: [],
            gangShangHua: false
        };
        
        roundCount = 1;
        playerScores = [20000, 20000, 20000, 20000];
        totalScore = 0;
        
        zhiTouZi();
    }

    function zhiTouZi() {
        gameState.phase = 'rolling';
        console.log('开始掷骰子');
        
        const container = document.getElementById('game-container');
        if (!container) {
            console.log('找不到game-container, 直接发牌');
            faPai();
            return;
        }
        
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;
        
        MahjongUI.showToast('掷骰子定庄...');
        
        if (typeof AnimationEngine !== 'undefined') {
            AnimationEngine.zhiTouZiDongHua(centerX, centerY, (result) => {
                const total = result.dice1 + result.dice2;
                gameState.zhuangJia = total % 4;
                
                const guiZe = RuleEngine.huoQuDangQianGuiZe();
                if (guiZe && guiZe.sheZhiZhuangJia) {
                    guiZe.sheZhiZhuangJia(gameState.zhuangJia);
                }
                
                const zhuangNames = ['你', '西', '北', '东'];
                MahjongUI.showToast(`${zhuangNames[gameState.zhuangJia]}坐庄`);
                console.log('庄家确定为:', gameState.zhuangJia);
                
                setTimeout(() => faPai(), 1000);
            });
        } else {
            gameState.zhuangJia = Math.floor(Math.random() * 4);
            setTimeout(() => faPai(), 1000);
        }
    }

    function faPai() {
        gameState.phase = 'playing';
        console.log('开始发牌, phase=' + gameState.phase + ', zhuangJia=' + gameState.zhuangJia);
        
        const paiZu = RuleEngine.chuangJianPaiZu();
        const xiHaoPaiZu = MahjongTiles.xiPai(paiZu);
        
        gameState.wanJiaShouPai = xiHaoPaiZu.slice(0, 13);
        for (let i = 0; i < 3; i++) {
            gameState.duiShouShouPai[i] = xiHaoPaiZu.slice(13 + i * 13, 26 + i * 13);
        }
        
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        const startIdx = guiZe && guiZe.paiShu === 108 ? 52 : 52;
        gameState.shengYuPaiZu = xiHaoPaiZu.slice(startIdx);
        
        gameState.wanJiaShouPai = MahjongTiles.paiXuShouPai(gameState.wanJiaShouPai);
        
        if (guiZe && guiZe.sheZhiQueMen) {
            guiZe.sheZhiQueMen(gameState.queMen);
        }
        
        console.log('发牌完成, 手牌数:', gameState.wanJiaShouPai.length, '剩余牌数:', gameState.shengYuPaiZu.length);
        console.log('庄家=' + gameState.zhuangJia + ', 庄家先出牌');
        
        render();
        MahjongSound.play('deal');
        
        gameState.dangQianChuPaiZhe = gameState.zhuangJia;
        
        setTimeout(() => {
            if (gameState.zhuangJia === 0) {
                wanJiaHuiHe();
            } else {
                aiHuiHe(gameState.zhuangJia);
            }
        }, 500);
    }

    function enableCardClick() {
        window.currentHand = gameState.wanJiaShouPai;
        window.onCardClick = function(card, x, y) {
            if (card && card.pai) {
                toggleCardSelection(card.pai);
            }
        };
    }

    function toggleCardSelection(pai) {
        console.log('toggleCardSelection, dangQianChuPaiZhe:', gameState.dangQianChuPaiZhe, 'pai:', pai);
        if (gameState.dangQianChuPaiZhe !== 0) return;
        
        const idx = gameState.selectedPai.indexOf(pai.id);
        if (idx >= 0) {
            chuPai();
        } else {
            gameState.selectedPai = [pai.id];
            MahjongSound.play('click');
            render();
        }
    }

    function checkWanJiaActions(chuPai, chuPaiZheIndex) {
        console.log('checkWanJiaActions 被调用, chuPai=' + (chuPai ? chuPai.hua + chuPai.dian : 'null') + ', chuPaiZheIndex=' + chuPaiZheIndex);
        if (!chuPai) {
            console.log('没有出牌，进入玩家回合');
            wanJiaHuiHe();
            return;
        }
        
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        const actions = [];
        
        const testShouPai = [...gameState.wanJiaShouPai, chuPai];
        console.log('玩家手牌数量=' + gameState.wanJiaShouPai.length + ', 测试手牌=' + testShouPai.length);
        
        const huResult = guiZe.panDingHuPai(testShouPai, { ziMo: false });
        console.log('胡牌判定结果=' + JSON.stringify(huResult));
        if (huResult && huResult.keYiHu) {
            actions.push('hu');
        }
        
        const pengResult = guiZe.panDingPeng(gameState.wanJiaShouPai, chuPai);
        console.log('碰牌判定结果=' + JSON.stringify(pengResult));
        if (pengResult && pengResult.keYiPeng) {
            actions.push('peng');
        }
        
        const gangResult = guiZe.panDingGang(gameState.wanJiaShouPai, chuPai);
        console.log('杠牌判定结果=' + JSON.stringify(gangResult));
        if (gangResult && gangResult.keYiGang) {
            actions.push('gang');
        }
        
        if (chuPaiZheIndex === 3 && guiZe.panDingChi) {
            const chiResult = guiZe.panDingChi(gameState.wanJiaShouPai, chuPai, 3);
            console.log('吃牌判定结果=' + JSON.stringify(chiResult));
            if (chiResult && chiResult.keYiChi) {
                actions.push('chi');
            }
        }
        
        console.log('最终可执行动作=' + JSON.stringify(actions));
        if (actions.length > 0) {
            showActionButtons(actions);
        } else {
            wanJiaHuiHe();
        }
    }
    
    function moYouYongPai(shouPai, shengYuPai) {
        if (shengYuPai.length === 0) return shengYuPai.pop();
        
        if (Math.random() > 0.35) {
            return shengYuPai.pop();
        }
        
        const tongJi = {};
        for (const pai of shouPai) {
            const key = pai.hua + pai.dian;
            tongJi[key] = (tongJi[key] || 0) + 1;
        }
        
        const xuYaoPai = [];
        for (const pai of shengYuPai) {
            const key = pai.hua + pai.dian;
            const count = tongJi[key] || 0;
            
            let fen = 0;
            
            if (count === 1) fen = 50;
            else if (count === 2) fen = 30;
            
            if (MahjongTiles.shiShuPai(pai)) {
                const dian = pai.dian;
                if (dian >= 2 && dian <= 8) {
                    const key1 = pai.hua + (dian - 1);
                    const key2 = pai.hua + (dian + 1);
                    if (tongJi[key1] || tongJi[key2]) {
                        fen += 25;
                    }
                }
                if (dian >= 3) {
                    const key1 = pai.hua + (dian - 2);
                    const key2 = pai.hua + (dian - 1);
                    if (tongJi[key1] && tongJi[key2]) {
                        fen += 40;
                    }
                }
                if (dian <= 7) {
                    const key1 = pai.hua + (dian + 1);
                    const key2 = pai.hua + (dian + 2);
                    if (tongJi[key1] && tongJi[key2]) {
                        fen += 40;
                    }
                }
                if (dian >= 2 && dian <= 8) {
                    const key1 = pai.hua + (dian - 1);
                    const key2 = pai.hua + (dian + 1);
                    if (tongJi[key1] && tongJi[key2]) {
                        fen += 45;
                    }
                }
            }
            
            if (fen > 0) {
                xuYaoPai.push({ pai, fen, idx: shengYuPai.indexOf(pai) });
            }
        }
        
        if (xuYaoPai.length === 0) {
            return shengYuPai.pop();
        }
        
        xuYaoPai.sort((a, b) => b.fen - a.fen);
        
        const zuiHao = xuYaoPai[0];
        if (zuiHao.idx >= 0 && zuiHao.idx < shengYuPai.length) {
            shengYuPai.splice(zuiHao.idx, 1);
            return zuiHao.pai;
        }
        
        return shengYuPai.pop();
    }

    function wanJiaHuiHe() {
        hideActionButtons();
        
        if (gameState.shengYuPaiZu.length === 0) {
            handleLiuju();
            return;
        }
        
        const pai = moYouYongPai(gameState.wanJiaShouPai, gameState.shengYuPaiZu);
        gameState.wanJiaShouPai.push(pai);
        gameState.wanJiaShouPai = MahjongTiles.paiXuShouPai(gameState.wanJiaShouPai);
        
        gameState.dangQianChuPaiZhe = 0;
        gameState.gangShangHua = false;
        
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        const huResult = guiZe.panDingHuPai(gameState.wanJiaShouPai, { ziMo: true });
        
        if (guiZe.huoQuTingPai) {
            gameState.tingPaiList = guiZe.huoQuTingPai(gameState.wanJiaShouPai);
        }
        
        if (huResult && huResult.keYiHu) {
            showActionButtons(['hu']);
        }
        
        render();
        enableCardClick();
        updateTingPaiDisplay();
    }
    
    function updateTingPaiDisplay() {
        const tingEl = document.getElementById('ting-display');
        if (!tingEl) return;
        
        if (gameState.tingPaiList && gameState.tingPaiList.length > 0) {
            const tingText = gameState.tingPaiList.map(t => {
                const name = getCardName(t);
                return `${name}(${t.shengYuShu}张)`;
            }).join(' ');
            tingEl.textContent = `听牌: ${tingText}`;
            tingEl.classList.remove('hidden');
        } else {
            tingEl.classList.add('hidden');
        }
    }

    function getCardName(pai) {
        const huaNames = { wan: '万', tiao: '条', tong: '筒', feng: '风', jian: '箭' };
        const fengNames = { 1: '东', 2: '南', 3: '西', 4: '北' };
        const jianNames = { 1: '中', 2: '发', 3: '白' };
        
        if (pai.hua === 'feng') return fengNames[pai.dian] || '东';
        if (pai.hua === 'jian') return jianNames[pai.dian] || '中';
        return pai.dian + (huaNames[pai.hua] || '');
    }
    
    function handleLiuju() {
        gameState.phase = 'result';
        
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        let result = {
            shengLi: false,
            fanXing: ['流局'],
            fanShu: 0,
            fenShu: 0
        };
        
        if (guiZe.chaJiao) {
            const wanJiaList = [
                { shouPai: gameState.wanJiaShouPai },
                { shouPai: gameState.duiShouShouPai[0] },
                { shouPai: gameState.duiShouShouPai[1] },
                { shouPai: gameState.duiShouShouPai[2] }
            ];
            const chaJiaoResult = guiZe.chaJiao(wanJiaList);
            result.chaJiaoResult = chaJiaoResult;
        }
        
        showResultModal(result);
    }

    function showActionButtons(actions) {
        console.log('showActionButtons 被调用, actions=' + JSON.stringify(actions));
        const container = document.getElementById('action-buttons');
        if (!container) {
            console.log('找不到 action-buttons 容器');
            return;
        }
        
        console.log('action-buttons 容器找到');
        container.classList.remove('hidden');
        
        document.getElementById('chi-btn').style.display = actions.includes('chi') ? 'block' : 'none';
        document.getElementById('peng-btn').style.display = actions.includes('peng') ? 'block' : 'none';
        document.getElementById('gang-btn').style.display = actions.includes('gang') ? 'block' : 'none';
        document.getElementById('hu-btn').style.display = actions.includes('hu') ? 'block' : 'none';
        document.getElementById('guo-btn').style.display = 'block';
        console.log('按钮显示设置完成');
    }

    function hideActionButtons() {
        const container = document.getElementById('action-buttons');
        if (container) container.classList.add('hidden');
    }

    function handleHu() {
        gameState.phase = 'result';
        hideActionButtons();
        
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        const huWanJia = gameState.dangQianChuPaiZhe === 0 ? 0 : gameState.shangJiaChuPaiZhe;
        
        let huShouPai, huMingPai;
        if (huWanJia === 0) {
            huShouPai = gameState.wanJiaShouPai;
            huMingPai = gameState.mingPaiQu[0];
        } else {
            const idx = huWanJia - 1;
            huShouPai = gameState.duiShouShouPai[idx];
            huMingPai = gameState.mingPaiQu[huWanJia];
        }
        
        const options = { 
            ziMo: gameState.dangQianChuPaiZhe === huWanJia,
            gangShangHua: gameState.gangShangHua,
            zhuangJiaHu: gameState.zhuangJia === huWanJia
        };
        
        let result;
        if (typeof ScoreSystem !== 'undefined') {
            result = ScoreSystem.jiSuanHuPaiFen(huWanJia, huShouPai, huMingPai, options);
        } else {
            result = guiZe.jiSuanJieSuan(huWanJia, huShouPai, huMingPai, options);
        }
        
        if (!result) {
            result = { fanShu: 1, fanXing: ['胡牌'], zongFen: 10 };
        }
        
        const fenShu = result.zongFen || result.fenShu || 10;
        
        const scoreChanges = [0, 0, 0, 0];
        if (huWanJia === 0) {
            for (let i = 1; i < 4; i++) {
                scoreChanges[i] = -fenShu;
                scoreChanges[0] += fenShu;
            }
        } else {
            if (options.ziMo) {
                for (let i = 0; i < 4; i++) {
                    if (i === huWanJia) {
                        scoreChanges[i] = fenShu * 3;
                    } else {
                        scoreChanges[i] = -fenShu;
                    }
                }
            } else {
                const dianPaoZhe = gameState.shangJiaChuPaiZhe || 0;
                scoreChanges[dianPaoZhe] = -fenShu * 2;
                scoreChanges[huWanJia] = fenShu * 2;
            }
        }
        
        for (let i = 0; i < 4; i++) {
            playerScores[i] += scoreChanges[i];
        }
        
        if (huWanJia === 0) {
            totalScore += scoreChanges[0];
        }
        
        const historyRecord = {
            round: roundCount,
            huWanJia: huWanJia,
            fanShu: result.fanShu || 1,
            fanXing: result.fanX || result.fanXing || ['胡牌'],
            fenShu: fenShu,
            scoreChanges: [...scoreChanges],
            playerScores: [...playerScores],
            shouPai: [
                [...gameState.wanJiaShouPai],
                [...gameState.duiShouShouPai[0]],
                [...gameState.duiShouShouPai[1]],
                [...gameState.duiShouShouPai[2]]
            ],
            mingPai: gameState.mingPaiQu.map(mp => [...mp]),
            ziMo: options.ziMo,
            zhuangJia: gameState.zhuangJia
        };
        gameHistory.push(historyRecord);
        
        showResultModal(result, historyRecord);
        
        MahjongStorage.updateStats({
            shengLi: huWanJia === 0,
            ziMo: options.ziMo,
            fanShu: result.fanShu || 0,
            guiZeId: gameState.guiZeId
        });
    }

    function showResultModal(result, historyRecord) {
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        const modal = document.getElementById('result-modal');
        const titleEl = document.getElementById('result-title');
        const huPlayerEl = document.getElementById('hu-player');
        const fanTypesEl = document.getElementById('fan-types');
        const scoreResultEl = document.getElementById('score-result');
        const scoreChangesEl = document.getElementById('score-changes');
        const playerHandsEl = document.getElementById('player-hands');
        
        const playerNames = ['你', '西', '北', '东'];
        const fanList = result ? (result.fanX || result.fanXing || ['胡牌']) : ['胡牌'];
        
        if (titleEl) {
            const huName = historyRecord ? playerNames[historyRecord.huWanJia] : '你';
            const huType = historyRecord && historyRecord.ziMo ? '(自摸)' : '';
            titleEl.textContent = `🎉 ${huName}胡牌！${huType}`;
        }
        
        if (huPlayerEl && historyRecord) {
            const huName = playerNames[historyRecord.huWanJia];
            huPlayerEl.innerHTML = `
                <div class="hu-player-name">${huName}</div>
                <div class="hu-type">${historyRecord.ziMo ? '自摸' : '点炮'}</div>
            `;
        }
        
        if (fanTypesEl) {
            fanTypesEl.innerHTML = fanList.map(f => 
                `<div class="fan-type-item">${f}</div>`
            ).join('');
        }
        
        if (scoreResultEl) {
            let html = `
                <div class="score-row">番数: ${result ? result.fanShu || 1 : 1}番</div>
                <div class="score-row">底分: ${result ? result.diFen || guiZe?.diFen || 2 : 2}分</div>
                <div class="score-row highlight">单注: ${result ? result.zongFen || result.fenShu || 10 : 10}分</div>
            `;
            
            if (result && result.chengYuan && result.chengYuan.length > 0) {
                html += '<div class="score-detail">';
                for (const item of result.chengYuan) {
                    html += `<div class="detail-row">${item.leiXing}: ${item.zhi}</div>`;
                }
                html += '</div>';
            }
            
            scoreResultEl.innerHTML = html;
        }
        
        if (scoreChangesEl && historyRecord) {
            let html = '<div class="score-change-list">';
            for (let i = 0; i < 4; i++) {
                const change = historyRecord.scoreChanges[i];
                const currentScore = historyRecord.playerScores[i];
                const changeClass = change > 0 ? 'positive' : (change < 0 ? 'negative' : '');
                const changeSign = change > 0 ? '+' : '';
                html += `
                    <div class="score-change-row">
                        <span class="player-name">${playerNames[i]}</span>
                        <span class="score-change ${changeClass}">${changeSign}${change}</span>
                        <span class="current-score">= ${currentScore}</span>
                    </div>
                `;
            }
            html += '</div>';
            scoreChangesEl.innerHTML = html;
        }
        
        if (playerHandsEl && historyRecord) {
            let html = '';
            for (let i = 0; i < 4; i++) {
                const shouPai = historyRecord.shouPai[i];
                if (!shouPai || shouPai.length === 0) continue;
                
                const paiStr = shouPai.map(p => {
                    return MahjongTiles.huoQuUnicode ? MahjongTiles.huoQuUnicode(p) : MahjongTiles.huoQuPaiMian(p);
                }).join(' ');
                
                html += `
                    <div class="player-hand-row">
                        <span class="player-name">${playerNames[i]}${i === historyRecord.huWanJia ? ' [胡]' : ''}</span>
                        <span class="hand-cards">${paiStr}</span>
                    </div>
                `;
            }
            playerHandsEl.innerHTML = html;
        }
        
        if (modal) modal.classList.remove('hidden');
        
        MahjongSound.play('hu');
    }

    function handleGuo() {
        hideActionButtons();
        gameState.pendingAction = null;
        wanJiaHuiHe();
    }

    function handleChi() {
        if (!gameState.shangJiaChuPai || gameState.shangJiaChuPaiZhe !== 3) {
            MahjongUI.showToast('无法吃牌');
            handleGuo();
            return;
        }
        
        const chuPai = gameState.shangJiaChuPai;
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        const chiResult = guiZe.panDingChi(gameState.wanJiaShouPai, chuPai, 3);
        
        console.log('handleChi chiResult=' + JSON.stringify(chiResult));
        
        const chiXuanXiang = chiResult.chiList || chiResult.chiXuanXiang || [];
        
        if (!chiResult || !chiResult.keYiChi || chiXuanXiang.length === 0) {
            MahjongUI.showToast('无法吃牌');
            handleGuo();
            return;
        }
        
        const xuanXiang = chiXuanXiang[0];
        const chiPaiList = xuanXiang.pai || xuanXiang.paiZu || [];
        chiPaiList.push(chuPai);
        
        for (const pai of chiPaiList) {
            if (pai.id !== chuPai.id) {
                const idx = gameState.wanJiaShouPai.findIndex(p => p.id === pai.id);
                if (idx >= 0) {
                    gameState.wanJiaShouPai.splice(idx, 1);
                }
            }
        }
        
        gameState.mingPaiQu[0].push({
            leiXing: 'chi',
            paiZu: chiPaiList,
            laiYuan: 3
        });
        
        gameState.chuPaiDui[3].pop();
        gameState.shangJiaChuPai = null;
        
        MahjongSound.play('chi');
        hideActionButtons();
        render();
        
        gameState.dangQianChuPaiZhe = 0;
        enableCardClick();
        MahjongUI.showToast('请出牌');
    }

    function handlePeng() {
        if (!gameState.shangJiaChuPai) {
            MahjongUI.showToast('无法碰牌');
            handleGuo();
            return;
        }
        
        const chuPai = gameState.shangJiaChuPai;
        const chuPaiZhe = gameState.shangJiaChuPaiZhe;
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        const pengResult = guiZe.panDingPeng(gameState.wanJiaShouPai, chuPai);
        
        if (!pengResult || !pengResult.keYiPeng) {
            MahjongUI.showToast('无法碰牌');
            handleGuo();
            return;
        }
        
        const tongYangPai = gameState.wanJiaShouPai.filter(p => 
            p.hua === chuPai.hua && p.dian === chuPai.dian
        ).slice(0, 2);
        
        for (const pai of tongYangPai) {
            const idx = gameState.wanJiaShouPai.findIndex(p => p.id === pai.id);
            if (idx >= 0) {
                gameState.wanJiaShouPai.splice(idx, 1);
            }
        }
        
        gameState.mingPaiQu[0].push({
            leiXing: 'peng',
            paiZu: [...tongYangPai, chuPai],
            laiYuan: chuPaiZhe
        });
        
        gameState.chuPaiDui[chuPaiZhe].pop();
        gameState.shangJiaChuPai = null;
        
        MahjongSound.play('peng');
        hideActionButtons();
        render();
        
        gameState.dangQianChuPaiZhe = 0;
        enableCardClick();
        MahjongUI.showToast('请出牌');
    }

    function handleGang() {
        if (!gameState.shangJiaChuPai) {
            MahjongUI.showToast('无法杠牌');
            handleGuo();
            return;
        }
        
        const chuPai = gameState.shangJiaChuPai;
        const chuPaiZhe = gameState.shangJiaChuPaiZhe;
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        const gangResult = guiZe.panDingGang(gameState.wanJiaShouPai, chuPai);
        
        if (!gangResult || !gangResult.keYiGang) {
            MahjongUI.showToast('无法杠牌');
            handleGuo();
            return;
        }
        
        const mingGang = gangResult.gangList.find(g => g.leiXing === 'ming_gang');
        if (!mingGang) {
            MahjongUI.showToast('无法明杠');
            handleGuo();
            return;
        }
        
        const tongYangPai = gameState.wanJiaShouPai.filter(p => 
            p.hua === chuPai.hua && p.dian === chuPai.dian
        ).slice(0, 3);
        
        for (const pai of tongYangPai) {
            const idx = gameState.wanJiaShouPai.findIndex(p => p.id === pai.id);
            if (idx >= 0) {
                gameState.wanJiaShouPai.splice(idx, 1);
            }
        }
        
        gameState.mingPaiQu[0].push({
            leiXing: 'gang',
            paiZu: [...tongYangPai, chuPai],
            laiYuan: chuPaiZhe,
            gangLeiXing: 'ming_gang'
        });
        
        gameState.chuPaiDui[chuPaiZhe].pop();
        gameState.shangJiaChuPai = null;
        gameState.gangShangHua = true;
        
        MahjongSound.play('gang');
        hideActionButtons();
        
        if (gameState.shengYuPaiZu.length > 0) {
            const gangPai = gameState.shengYuPaiZu.pop();
            gameState.wanJiaShouPai.push(gangPai);
            gameState.wanJiaShouPai = MahjongTiles.paiXuShouPai(gameState.wanJiaShouPai);
            render();
            
            gameState.dangQianChuPaiZhe = 0;
            enableCardClick();
            MahjongUI.showToast('杠牌成功，请出牌');
        } else {
            handleLiuju();
        }
    }

    function chuPai() {
        if (gameState.phase !== 'playing') return;
        if (gameState.dangQianChuPaiZhe !== 0) return;
        if (gameState.selectedPai.length === 0) {
            MahjongUI.showToast('请选择要出的牌');
            return;
        }
        
        const paiId = gameState.selectedPai[0];
        const paiIdx = gameState.wanJiaShouPai.findIndex(p => p.id === paiId);
        
        if (paiIdx >= 0) {
            const chuPai = gameState.wanJiaShouPai.splice(paiIdx, 1)[0];
            gameState.chuPaiDui[0].push(chuPai);
            gameState.shangJiaChuPai = chuPai;
            gameState.shangJiaChuPaiZhe = 0;
            gameState.gangShangHua = false;
        } else {
            return;
        }
        gameState.selectedPai = [];
        gameState.tingPaiList = [];
        
        MahjongSound.play('play');
        render();
        
        window.onCardClick = null;
        gameState.dangQianChuPaiZhe = -1;
        
        setTimeout(() => checkAiActionsForPlayer(0, chuPai), 500);
    }
    
    function checkAiActionsForPlayer(chuPaiZheIndex, chuPai) {
        for (let i = 1; i <= 3; i++) {
            const nextIndex = (chuPaiZheIndex + i) % 4;
            if (nextIndex === 0) continue;
            
            const idx = nextIndex - 1;
            const shouPai = gameState.duiShouShouPai[idx];
            const guiZe = RuleEngine.huoQuDangQianGuiZe();
            
            const testShouPai = [...shouPai, chuPai];
            const huResult = guiZe.panDingHuPai(testShouPai, { ziMo: false });
            if (huResult && huResult.keYiHu) {
                handleAiHu(nextIndex, false, chuPaiZheIndex);
                return;
            }
            
            const pengResult = guiZe.panDingPeng(shouPai, chuPai);
            if (pengResult && pengResult.keYiPeng && Math.random() < 0.6) {
                handleAiPeng(nextIndex, chuPai, chuPaiZheIndex);
                return;
            }
            
            const gangResult = guiZe.panDingGang(shouPai, chuPai);
            if (gangResult && gangResult.keYiGang && Math.random() < 0.7) {
                handleAiMingGang(nextIndex, chuPai, chuPaiZheIndex);
                return;
            }
        }
        
        nextPlayer(chuPaiZheIndex);
    }
    
    function handleAiMingGang(aiIndex, chuPai, chuPaiZhe) {
        const idx = aiIndex - 1;
        const shouPai = gameState.duiShouShouPai[idx];
        
        const tongYangPai = shouPai.filter(p => 
            p.hua === chuPai.hua && p.dian === chuPai.dian
        ).slice(0, 3);
        
        for (const pai of tongYangPai) {
            const paiIdx = shouPai.findIndex(p => p.id === pai.id);
            if (paiIdx >= 0) {
                shouPai.splice(paiIdx, 1);
            }
        }
        
        gameState.mingPaiQu[aiIndex].push({
            leiXing: 'gang',
            paiZu: [...tongYangPai, chuPai],
            laiYuan: chuPaiZhe,
            gangLeiXing: 'ming_gang'
        });
        
        gameState.chuPaiDui[chuPaiZhe].pop();
        gameState.gangShangHua = true;
        
        MahjongSound.play('gang');
        render();
        
        setTimeout(() => {
            if (gameState.shengYuPaiZu.length > 0) {
                const gangPai = moYouYongPai(shouPai, gameState.shengYuPaiZu);
                shouPai.push(gangPai);
                
                const guiZe = RuleEngine.huoQuDangQianGuiZe();
                const huResult = guiZe.panDingHuPai(shouPai, { ziMo: true, gangShangHua: true });
                if (huResult && huResult.keYiHu) {
                    handleAiHu(aiIndex, true);
                    return;
                }
                
                aiChuPai(aiIndex, shouPai, guiZe);
            } else {
                handleLiuju();
            }
        }, 500);
    }
    
    function aiHuiHe(aiIndex) {
        if (gameState.phase !== 'playing') return;
        if (gameState.shengYuPaiZu.length === 0) {
            handleLiuju();
            return;
        }
        
        const idx = aiIndex - 1;
        const pai = moYouYongPai(gameState.duiShouShouPai[idx], gameState.shengYuPaiZu);
        gameState.duiShouShouPai[idx].push(pai);
        render();
        
        setTimeout(() => {
            if (gameState.phase !== 'playing') return;
            
            const shouPai = gameState.duiShouShouPai[idx];
            const guiZe = RuleEngine.huoQuDangQianGuiZe();
            
            const huResult = guiZe.panDingHuPai(shouPai, { ziMo: true });
            if (huResult && huResult.keYiHu) {
                handleAiHu(aiIndex, true);
                return;
            }
            
            const gangResult = guiZe.panDingGang(shouPai, null, { baoKuoAnGang: true });
            if (gangResult && gangResult.gangList && gangResult.gangList.length > 0) {
                if (Math.random() < 0.7) {
                    handleAiGang(aiIndex, gangResult.gangList[0]);
                    return;
                }
            }
            
            aiChuPai(aiIndex, shouPai, guiZe);
        }, 500);
    }
    
    function aiChuPai(aiIndex, shouPai, guiZe) {
        const chuPai = AILogic.xuanZeChuPai(shouPai, gameState, guiZe);
        
        if (chuPai) {
            const paiIdx = shouPai.findIndex(p => p.id === chuPai.id);
            if (paiIdx >= 0) {
                shouPai.splice(paiIdx, 1);
                gameState.chuPaiDui[aiIndex].push(chuPai);
                gameState.shangJiaChuPai = chuPai;
                gameState.shangJiaChuPaiZhe = aiIndex;
                
                MahjongSound.play('play');
                render();
                
                checkAiActions(aiIndex, chuPai);
            }
        } else {
            nextPlayer(aiIndex);
        }
    }
    
    function checkAiActions(chuPaiZheIndex, chuPai) {
        console.log('checkAiActions: chuPaiZheIndex=' + chuPaiZheIndex + ', chuPai=' + (chuPai ? chuPai.hua + chuPai.dian : 'null'));
        
        let aiHuIndex = -1;
        let aiPengIndex = -1;
        let aiChiIndex = -1;
        let aiChiResult = null;
        
        for (let i = 1; i <= 3; i++) {
            const nextIndex = (chuPaiZheIndex + i) % 4;
            if (nextIndex === 0) continue;
            
            const idx = nextIndex - 1;
            const shouPai = gameState.duiShouShouPai[idx];
            const guiZe = RuleEngine.huoQuDangQianGuiZe();
            
            const testShouPai = [...shouPai, chuPai];
            const huResult = guiZe.panDingHuPai(testShouPai, { ziMo: false });
            if (huResult && huResult.keYiHu && aiHuIndex === -1) {
                aiHuIndex = nextIndex;
            }
            
            const pengResult = guiZe.panDingPeng(shouPai, chuPai);
            if (pengResult && pengResult.keYiPeng && aiPengIndex === -1 && Math.random() < 0.6) {
                aiPengIndex = nextIndex;
            }
            
            if (nextIndex === (chuPaiZheIndex + 1) % 4 && guiZe.panDingChi && aiChiIndex === -1) {
                const chiResult = guiZe.panDingChi(shouPai, chuPai, chuPaiZheIndex);
                if (chiResult && chiResult.keYiChi && Math.random() < 0.4) {
                    aiChiIndex = nextIndex;
                    aiChiResult = chiResult;
                }
            }
        }
        
        if (aiHuIndex !== -1) {
            console.log('AI ' + aiHuIndex + ' 胡牌');
            handleAiHu(aiHuIndex, false, chuPaiZheIndex);
            return;
        }
        
        if (aiPengIndex !== -1) {
            console.log('AI ' + aiPengIndex + ' 碰牌');
            handleAiPeng(aiPengIndex, chuPai, chuPaiZheIndex);
            return;
        }
        
        if (aiChiIndex !== -1) {
            console.log('AI ' + aiChiIndex + ' 吃牌');
            handleAiChi(aiChiIndex, chuPai, chuPaiZheIndex, aiChiResult);
            return;
        }
        
        const playerIndex = (chuPaiZheIndex + 1) % 4;
        if (playerIndex === 0) {
            console.log('轮到玩家响应');
            checkWanJiaActions(chuPai, chuPaiZheIndex);
        } else {
            nextPlayer(chuPaiZheIndex);
        }
    }
    
    function nextPlayer(chuPaiZheIndex) {
        const nextIdx = (chuPaiZheIndex + 1) % 4;
        console.log('nextPlayer: chuPaiZheIndex=' + chuPaiZheIndex + ', nextIdx=' + nextIdx);
        
        setTimeout(() => {
            if (nextIdx === 0) {
                wanJiaHuiHe();
            } else if (nextIdx === 1) {
                aiHuiHe(1);
            } else if (nextIdx === 2) {
                aiHuiHe(2);
            } else if (nextIdx === 3) {
                aiHuiHe(3);
            }
        }, 400);
    }
    
    function handleAiHu(aiIndex, ziMo, dianPaoZhe) {
        gameState.phase = 'result';
        
        const idx = aiIndex - 1;
        const shouPai = gameState.duiShouShouPai[idx];
        const guiZe = RuleEngine.huoQuDangQianGuiZe();
        
        let result;
        if (typeof ScoreSystem !== 'undefined') {
            result = ScoreSystem.jiSuanHuPaiFen(aiIndex, shouPai, gameState.mingPaiQu[aiIndex], { ziMo });
        } else {
            result = guiZe.jiSuanJieSuan(aiIndex, shouPai, gameState.mingPaiQu[aiIndex], { ziMo });
        }
        
        if (!result) {
            result = { fanShu: 1, fanXing: ['胡牌'], zongFen: 10 };
        }
        
        const fenShu = result.zongFen || result.fenShu || 10;
        
        const scoreChanges = [0, 0, 0, 0];
        if (ziMo) {
            for (let i = 0; i < 4; i++) {
                if (i === aiIndex) {
                    scoreChanges[i] = fenShu * 3;
                } else {
                    scoreChanges[i] = -fenShu;
                }
            }
        } else {
            scoreChanges[dianPaoZhe] = -fenShu * 2;
            scoreChanges[aiIndex] = fenShu * 2;
        }
        
        for (let i = 0; i < 4; i++) {
            playerScores[i] += scoreChanges[i];
        }
        
        const historyRecord = {
            round: roundCount,
            huWanJia: aiIndex,
            fanShu: result.fanShu || 1,
            fanXing: result.fanX || result.fanXing || ['胡牌'],
            fenShu: fenShu,
            scoreChanges: [...scoreChanges],
            playerScores: [...playerScores],
            shouPai: [
                [...gameState.wanJiaShouPai],
                [...gameState.duiShouShouPai[0]],
                [...gameState.duiShouShouPai[1]],
                [...gameState.duiShouShouPai[2]]
            ],
            mingPai: gameState.mingPaiQu.map(mp => [...mp]),
            ziMo: ziMo,
            zhuangJia: gameState.zhuangJia
        };
        gameHistory.push(historyRecord);
        
        MahjongStorage.updateStats({
            shengLi: false,
            ziMo: false,
            fanShu: result.fanShu || 0,
            guiZeId: gameState.guiZeId
        });
        
        showResultModal(result, historyRecord);
        MahjongSound.play('hu');
    }
    
    function handleAiPeng(aiIndex, chuPai, chuPaiZhe) {
        const idx = aiIndex - 1;
        const shouPai = gameState.duiShouShouPai[idx];
        
        const tongYangPai = shouPai.filter(p => 
            p.hua === chuPai.hua && p.dian === chuPai.dian
        ).slice(0, 2);
        
        for (const pai of tongYangPai) {
            const paiIdx = shouPai.findIndex(p => p.id === pai.id);
            if (paiIdx >= 0) {
                shouPai.splice(paiIdx, 1);
            }
        }
        
        gameState.mingPaiQu[aiIndex].push({
            leiXing: 'peng',
            paiZu: [...tongYangPai, chuPai],
            laiYuan: chuPaiZhe
        });
        
        gameState.chuPaiDui[chuPaiZhe].pop();
        
        MahjongSound.play('peng');
        render();
        
        gameState.dangQianChuPaiZhe = aiIndex;
        
        setTimeout(() => {
            const guiZe = RuleEngine.huoQuDangQianGuiZe();
            aiChuPai(aiIndex, shouPai, guiZe);
        }, 600);
    }
    
    function handleAiChi(aiIndex, chuPai, chuPaiZhe, chiResult) {
        const idx = aiIndex - 1;
        const shouPai = gameState.duiShouShouPai[idx];
        
        const chiXuanXiang = chiResult.chiList || chiResult.chiXuanXiang || [];
        if (chiXuanXiang.length === 0) {
            nextPlayer(chuPaiZhe);
            return;
        }
        
        const xuanXiang = chiXuanXiang[0];
        const chiPaiList = xuanXiang.pai || xuanXiang.paiZu || [];
        chiPaiList.push(chuPai);
        
        for (const pai of chiPaiList) {
            if (pai.id !== chuPai.id) {
                const paiIdx = shouPai.findIndex(p => p.id === pai.id);
                if (paiIdx >= 0) {
                    shouPai.splice(paiIdx, 1);
                }
            }
        }
        
        gameState.mingPaiQu[aiIndex].push({
            leiXing: 'chi',
            paiZu: chiPaiList,
            laiYuan: chuPaiZhe
        });
        
        gameState.chuPaiDui[chuPaiZhe].pop();
        
        MahjongSound.play('chi');
        render();
        
        gameState.dangQianChuPaiZhe = aiIndex;
        
        setTimeout(() => {
            const guiZe = RuleEngine.huoQuDangQianGuiZe();
            aiChuPai(aiIndex, shouPai, guiZe);
        }, 600);
    }
    
    function handleAiGang(aiIndex, gangInfo) {
        const idx = aiIndex - 1;
        const shouPai = gameState.duiShouShouPai[idx];
        
        if (gangInfo.leiXing === 'an_gang') {
            const tongYangPai = shouPai.filter(p => 
                p.hua === gangInfo.pai.hua && p.dian === gangInfo.pai.dian
            ).slice(0, 4);
            
            for (const pai of tongYangPai) {
                const paiIdx = shouPai.findIndex(p => p.id === pai.id);
                if (paiIdx >= 0) {
                    shouPai.splice(paiIdx, 1);
                }
            }
            
            gameState.mingPaiQu[aiIndex].push({
                leiXing: 'gang',
                paiZu: tongYangPai,
                gangLeiXing: 'an_gang'
            });
        }
        
        gameState.gangShangHua = true;
        MahjongSound.play('gang');
        render();
        
        setTimeout(() => {
            if (gameState.shengYuPaiZu.length > 0) {
                const gangPai = moYouYongPai(shouPai, gameState.shengYuPaiZu);
                shouPai.push(gangPai);
                
                const guiZe = RuleEngine.huoQuDangQianGuiZe();
                const huResult = guiZe.panDingHuPai(shouPai, { ziMo: true, gangShangHua: true });
                if (huResult && huResult.keYiHu) {
                    handleAiHu(aiIndex, true);
                    return;
                }
                
                aiChuPai(aiIndex, shouPai, guiZe);
            } else {
                handleLiuju();
            }
        }, 500);
    }

    function render() {
        MahjongUI.clear();
        MahjongUI.drawTable();
        
        document.getElementById('tiles-left').textContent = `剩余: ${gameState.shengYuPaiZu.length}`;
        document.getElementById('round-display').textContent = `第 ${roundCount} 局`;
        
        const playerNames = ['你', '西', '北', '东'];
        for (let i = 0; i < 4; i++) {
            const scoreEl = document.getElementById(`score-player-${i}`);
            if (scoreEl) {
                const zhuangMark = gameState.zhuangJia === i ? ' [庄]' : '';
                scoreEl.textContent = `${playerNames[i]}${zhuangMark}: ${playerScores[i]}`;
                scoreEl.classList.toggle('zhuang', gameState.zhuangJia === i);
            }
        }
        
        MahjongUI.drawPlayerHand(gameState.wanJiaShouPai, gameState.selectedPai);
        window.currentHand = gameState.wanJiaShouPai;
        
        for (let i = 0; i < 4; i++) {
            if (gameState.mingPaiQu[i] && gameState.mingPaiQu[i].length > 0) {
                MahjongUI.drawMingPai(gameState.mingPaiQu[i], ['bottom', 'left', 'top', 'right'][i]);
            }
        }
        
        MahjongUI.drawOpponentHand(gameState.duiShouShouPai[0].length, 'left');
        MahjongUI.drawOpponentHand(gameState.duiShouShouPai[1].length, 'top');
        MahjongUI.drawOpponentHand(gameState.duiShouShouPai[2].length, 'right');
        
        const zhuangMark = gameState.zhuangJia === 0 ? ' [庄]' : '';
        MahjongUI.drawPlayerInfo('你' + zhuangMark, gameState.wanJiaShouPai.length, true, 'bottom');
        MahjongUI.drawPlayerInfo('西' + (gameState.zhuangJia === 1 ? ' [庄]' : ''), gameState.duiShouShouPai[0].length, false, 'left');
        MahjongUI.drawPlayerInfo('北' + (gameState.zhuangJia === 2 ? ' [庄]' : ''), gameState.duiShouShouPai[1].length, true, 'top');
        MahjongUI.drawPlayerInfo('东' + (gameState.zhuangJia === 3 ? ' [庄]' : ''), gameState.duiShouShouPai[2].length, false, 'right');
        
        for (let i = 0; i < 4; i++) {
            if (gameState.chuPaiDui[i].length > 0) {
                MahjongUI.drawDiscCards(gameState.chuPaiDui[i], ['bottom', 'left', 'top', 'right'][i]);
            }
        }
    }

    function bindEvents() {
        document.getElementById('start-btn').addEventListener('click', startGame);
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.toggle('hidden');
        });
        
        document.getElementById('sound-btn').addEventListener('click', () => {
            settings.soundEnabled = MahjongSound.toggle();
            document.getElementById('sound-btn').textContent = settings.soundEnabled ? '🔊' : '🔇';
            MahjongStorage.saveSettings(settings);
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            document.getElementById('result-modal').classList.add('hidden');
            roundCount++;
            
            gameState = {
                phase: 'preparing',
                guiZeId: settings.guiZeId,
                wanJiaShouPai: [],
                duiShouShouPai: [[], [], []],
                shengYuPaiZu: [],
                chuPaiDui: [[], [], [], []],
                mingPaiQu: [[], [], [], []],
                gangPaiJiLu: [],
                huiHeShu: 0,
                dangQianChuPaiZhe: 0,
                shangJiaChuPai: null,
                shangJiaChuPaiZhe: null,
                queMen: gameState.queMen,
                selectedPai: [],
                pendingAction: null,
                zhuangJia: 0,
                lianZhuangCiShu: 0,
                tingPaiList: [],
                gangShangHua: false
            };
            
            zhiTouZi();
        });
        
        document.getElementById('back-menu-btn').addEventListener('click', () => {
            document.getElementById('result-modal').classList.add('hidden');
            playerScores = [20000, 20000, 20000, 20000];
            totalScore = 0;
            gameHistory = [];
            showStartModal();
        });
        
        document.getElementById('close-settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.add('hidden');
        });
        
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            settings.theme = document.getElementById('theme-select').value;
            settings.language = document.getElementById('language-select').value;
            
            document.body.dataset.theme = settings.theme;
            MahjongUI.setTheme(settings.theme);
            MahjongSound.setLanguage(settings.language);
            MahjongStorage.saveSettings(settings);
            
            document.getElementById('settings-modal').classList.add('hidden');
            MahjongUI.showToast('设置已保存');
        });
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                settings.nanDu = parseInt(btn.dataset.level);
                AILogic.sheZhiNanDu(settings.nanDu);
            });
        });

        document.getElementById('open-skin-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.add('hidden');
            openSkinCenter();
        });

        document.querySelectorAll('.que-men-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                gameState.queMen = btn.dataset.men;
                document.getElementById('que-men-modal').classList.add('hidden');
                MahjongUI.showToast(`缺${gameState.queMen === 'wan' ? '万' : gameState.queMen === 'tiao' ? '条' : '筒'}`);
                startGamePlay();
            });
        });
        
        document.getElementById('hu-btn').addEventListener('click', handleHu);
        document.getElementById('guo-btn').addEventListener('click', handleGuo);
        document.getElementById('peng-btn').addEventListener('click', handlePeng);
        document.getElementById('chi-btn').addEventListener('click', handleChi);
        document.getElementById('gang-btn').addEventListener('click', handleGang);
        
        document.getElementById('apply-skin-btn').addEventListener('click', () => {
            const activeSkin = document.querySelector('.skin-item.active');
            if (activeSkin) {
                const skins = SkinManager.getAvailableSkins();
                const activeIndex = Array.from(document.querySelectorAll('.skin-item')).indexOf(activeSkin);
                if (activeIndex >= 0) {
                    SkinManager.loadSkin(skins[activeIndex].name)
                        .then(function() {
                            MahjongUI.showToast('皮肤已应用');
                            render();
                        })
                        .catch(function(err) {
                            MahjongUI.showToast('皮肤加载失败: ' + err.message);
                        });
                }
            }
        });
        
        document.getElementById('generate-emoji-skin-btn').addEventListener('click', async () => {
            MahjongUI.showToast('正在生成皮肤包，请选择保存目录...');
            const result = await SkinManager.generateSkinPackage();
            if (result && result.success) {
                MahjongUI.showToast('皮肤包生成成功！共 ' + result.count + ' 个文件，已保存到 emoji_color 文件夹');
            } else {
                MahjongUI.showToast('生成失败: ' + (result ? result.error : '未知错误'));
            }
        });
        
        document.getElementById('close-skin-btn').addEventListener('click', () => {
            document.getElementById('skin-modal').classList.add('hidden');
        });

        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.addEventListener('dblclick', () => {
                if (gameState.phase === 'playing' && gameState.selectedPai.length > 0) {
                    chuPai();
                }
            });
        }
        
        window.addEventListener('resize', () => {
            MahjongUI.resize();
            if (gameState.phase === 'playing') render();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
