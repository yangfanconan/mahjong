/**
 * 麻将存储模块
 * 负责对局状态、战绩记录、设置的存储
 * 兼容 Cordova 和浏览器环境
 */

const MahjongStorage = (function() {
    'use strict';

    const STORAGE_KEYS = {
        GAME_STATE: 'mahjong_game_state',
        STATS: 'mahjong_stats',
        SETTINGS: 'mahjong_settings'
    };

    let isCordova = false;

    /**
     * 初始化存储
     */
    function init() {
        isCordova = typeof cordova !== 'undefined';
        if (isCordova) {
            document.addEventListener('deviceready', function() {
                console.log('Cordova storage ready');
            });
        }
    }

    /**
     * 保存数据
     */
    function save(key, data) {
        try {
            const json = JSON.stringify(data);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, json);
            }
            return true;
        } catch (e) {
            console.error('存储失败:', e);
            return false;
        }
    }

    /**
     * 加载数据
     */
    function load(key) {
        try {
            if (typeof localStorage !== 'undefined') {
                const json = localStorage.getItem(key);
                return json ? JSON.parse(json) : null;
            }
        } catch (e) {
            console.error('加载失败:', e);
            return null;
        }
    }

    /**
     * 删除数据
     */
    function remove(key) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 保存游戏状态
     */
    function saveGameState(state) {
        return save(STORAGE_KEYS.GAME_STATE, {
            wanJiaShouPai: state.wanJiaShouPai,
            duiShouShouPai: state.duiShouShouPai,
            shengYuPaiZu: state.shengYuPaiZu,
            chuPaiDui: state.chuPaiDui,
            gangPai: state.gangPai,
            pengPai: state.pengPai,
            chiPai: state.chiPai,
            dangQianGuiZe: state.dangQianGuiZe,
            zhuangJia: state.zhuangJia,
            dangQianWanJia: state.dangQianWanJia,
            huiHeShu: state.huiHeShu,
            timestamp: Date.now()
        });
    }

    /**
     * 加载游戏状态
     */
    function loadGameState() {
        return load(STORAGE_KEYS.GAME_STATE);
    }

    /**
     * 清除游戏状态
     */
    function clearGameState() {
        return remove(STORAGE_KEYS.GAME_STATE);
    }

    /**
     * 加载战绩
     */
    function loadStats() {
        const defaultStats = {
            totalGames: 0,
            wins: 0,
            losses: 0,
            zimoCount: 0,
            dianPaoCount: 0,
            maxFanShu: 0,
            guanZhan: 0,
            ruleStats: {}
        };
        const saved = load(STORAGE_KEYS.STATS);
        return saved ? { ...defaultStats, ...saved } : defaultStats;
    }

    /**
     * 保存战绩
     */
    function saveStats(stats) {
        return save(STORAGE_KEYS.STATS, stats);
    }

    /**
     * 更新战绩
     */
    function updateStats(result) {
        const stats = loadStats();
        
        stats.totalGames++;
        
        if (result.shengLi) {
            stats.wins++;
            if (result.ziMo) stats.zimoCount++;
        } else {
            stats.losses++;
            if (result.dianPao) stats.dianPaoCount++;
        }
        
        if (result.guanZhan) stats.guanZhan++;
        
        stats.maxFanShu = Math.max(stats.maxFanShu, result.fanShu || 0);
        
        // 按规则统计
        const guiZeId = result.guiZeId || 'unknown';
        if (!stats.ruleStats[guiZeId]) {
            stats.ruleStats[guiZeId] = { games: 0, wins: 0 };
        }
        stats.ruleStats[guiZeId].games++;
        if (result.shengLi) {
            stats.ruleStats[guiZeId].wins++;
        }
        
        saveStats(stats);
        return stats;
    }

    /**
     * 清除战绩
     */
    function clearStats() {
        return remove(STORAGE_KEYS.STATS);
    }

    /**
     * 加载设置
     */
    function loadSettings() {
        const defaultSettings = {
            theme: 'guofeng',
            soundEnabled: true,
            language: 'zh',
            nanDu: 2,
            guiZeId: 'sichuan',
            huaShu: 0
        };
        const saved = load(STORAGE_KEYS.SETTINGS);
        return saved ? { ...defaultSettings, ...saved } : defaultSettings;
    }

    /**
     * 保存设置
     */
    function saveSettings(settings) {
        return save(STORAGE_KEYS.SETTINGS, settings);
    }

    return {
        init,
        save,
        load,
        remove,
        saveGameState,
        loadGameState,
        clearGameState,
        loadStats,
        saveStats,
        updateStats,
        clearStats,
        loadSettings,
        saveSettings
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MahjongStorage;
}
