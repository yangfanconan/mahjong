/**
 * 麻将规则引擎核心模块
 * 提供统一的规则调用接口，支持多规则切换
 * 所有规则必须实现的标准接口定义
 */

const RuleEngine = (function() {
    'use strict';

    let dangQianGuiZe = null;
    let guiZeZhuCeBiao = new Map();

    /**
     * 规则接口定义（所有规则必须实现）
     */
    const GUI_ZE_JIE_KOU = {
        id: '',                    // 规则唯一标识
        mingCheng: '',             // 规则名称
        miaoShu: '',               // 规则描述
        paiShu: 136,               // 牌数（136/108/144）
        zhiChiHuaPai: false,       // 是否支持花牌
        zhiChiChi: true,           // 是否支持吃牌
        zhiChipeng: true,          // 是否支持碰牌
        zhiChiGang: true,          // 是否支持杠牌
        zhiChiAnGang: true,        // 是否支持暗杠
        zhiChiJiaGang: true,       // 是否支持加杠
        xuYaoMenQing: false,       // 是否需要门清
        xuYaoJiangPai: true,       // 是否需要将牌
        zhiChiQiDui: true,         // 是否支持七对
        zhiChiShiSanYao: true,     // 是否支持十三幺
        xueZhanDaoDi: false,       // 是否血战到底
        zhaJiao: false,            // 是否查叫
        diFen: 1,                  // 底分
        
        // 核心方法
        chuShiHua: function() {},           // 初始化规则
        panDingHuPai: function() {},        // 判定胡牌
        jiSuanFanShu: function() {},        // 计算番数
        huoQuTingPai: function() {},        // 获取听牌列表
        panDingChi: function() {},          // 判定是否可以吃
        panDingPeng: function() {},         // 判定是否可以碰
        panDingGang: function() {},         // 判定是否可以杠
        panDingLiuJu: function() {},        // 判定是否流局
        jiSuanJieSuan: function() {}        // 计算结算
    };

    /**
     * 注册规则
     */
    function zhuCeGuiZe(guiZe) {
        if (!guiZe || !guiZe.id) {
            console.error('规则注册失败：缺少规则ID');
            return false;
        }
        
        if (guiZeZhuCeBiao.has(guiZe.id)) {
            console.warn(`规则 ${guiZe.id} 已存在，将被覆盖`);
        }
        
        guiZeZhuCeBiao.set(guiZe.id, guiZe);
        console.log(`规则 ${guiZe.mingCheng} (${guiZe.id}) 注册成功`);
        
        return true;
    }

    /**
     * 注销规则
     */
    function zhuXiaoGuiZe(guiZeId) {
        return guiZeZhuCeBiao.delete(guiZeId);
    }

    /**
     * 获取所有已注册规则
     */
    function huoQuSuoYouGuiZe() {
        const guiZeLieBiao = [];
        for (const [id, guiZe] of guiZeZhuCeBiao) {
            guiZeLieBiao.push({
                id: guiZe.id,
                mingCheng: guiZe.mingCheng,
                miaoShu: guiZe.miaoShu,
                paiShu: guiZe.paiShu
            });
        }
        return guiZeLieBiao;
    }

    /**
     * 切换当前规则
     */
    function qieHuanGuiZe(guiZeId) {
        const guiZe = guiZeZhuCeBiao.get(guiZeId);
        if (!guiZe) {
            console.error(`切换规则失败：找不到规则 ${guiZeId}`);
            return false;
        }
        
        dangQianGuiZe = guiZe;
        
        if (typeof dangQianGuiZe.chuShiHua === 'function') {
            dangQianGuiZe.chuShiHua();
        }
        
        console.log(`当前规则已切换为：${dangQianGuiZe.mingCheng}`);
        return true;
    }

    /**
     * 获取当前规则
     */
    function huoQuDangQianGuiZe() {
        return dangQianGuiZe;
    }

    /**
     * 获取当前规则配置
     */
    function huoQuGuiZePeiZhi() {
        if (!dangQianGuiZe) return null;
        
        return {
            id: dangQianGuiZe.id,
            mingCheng: dangQianGuiZe.mingCheng,
            paiShu: dangQianGuiZe.paiShu,
            zhiChiChi: dangQianGuiZe.zhiChiChi,
            zhiChipeng: dangQianGuiZe.zhiChipeng,
            zhiChiGang: dangQianGuiZe.zhiChiGang,
            xueZhanDaoDi: dangQianGuiZe.xueZhanDaoDi,
            diFen: dangQianGuiZe.diFen
        };
    }

    /**
     * 创建牌组（根据当前规则）
     */
    function chuangJianPaiZu() {
        if (!dangQianGuiZe) {
            console.error('请先选择规则');
            return null;
        }
        
        const paiShu = dangQianGuiZe.paiShu;
        
        if (paiShu === 108) {
            return MahjongTiles.chuangJian108PaiZu();
        } else if (paiShu === 144) {
            return MahjongTiles.chuangJian144PaiZu();
        } else {
            return MahjongTiles.chuangJian136PaiZu();
        }
    }

    /**
     * 判定胡牌
     * @param {Array} shouPai - 手牌
     * @param {Object} options - 附加选项（自摸/点炮/杠上花等）
     */
    function panDingHuPai(shouPai, options = {}) {
        if (!dangQianGuiZe || !dangQianGuiZe.panDingHuPai) {
            return { keYiHu: false, yuan: '规则未配置' };
        }
        return dangQianGuiZe.panDingHuPai(shouPai, options);
    }

    /**
     * 计算番数
     * @param {Array} shouPai - 手牌
     * @param {Object} options - 附加选项
     */
    function jiSuanFanShu(shouPai, options = {}) {
        if (!dangQianGuiZe || !dangQianGuiZe.jiSuanFanShu) {
            return { fanShu: 0, fanXing: [] };
        }
        return dangQianGuiZe.jiSuanFanShu(shouPai, options);
    }

    /**
     * 获取听牌列表
     */
    function huoQuTingPai(shouPai) {
        if (!dangQianGuiZe || !dangQianGuiZe.huoQuTingPai) {
            return [];
        }
        return dangQianGuiZe.huoQuTingPai(shouPai);
    }

    /**
     * 判定是否可以吃牌
     */
    function panDingChi(shouPai, chuPai, wanJiaFangWei) {
        if (!dangQianGuiZe || !dangQianGuiZe.zhiChiChi) {
            return { keYiChi: false };
        }
        if (!dangQianGuiZe.panDingChi) {
            return { keYiChi: false };
        }
        return dangQianGuiZe.panDingChi(shouPai, chuPai, wanJiaFangWei);
    }

    /**
     * 判定是否可以碰牌
     */
    function panDingPeng(shouPai, chuPai) {
        if (!dangQianGuiZe || !dangQianGuiZe.zhiChipeng) {
            return { keYiPeng: false };
        }
        if (!dangQianGuiZe.panDingPeng) {
            return { keYiPeng: false };
        }
        return dangQianGuiZe.panDingPeng(shouPai, chuPai);
    }

    /**
     * 判定是否可以杠牌
     */
    function panDingGang(shouPai, chuPai, options = {}) {
        if (!dangQianGuiZe || !dangQianGuiZe.zhiChiGang) {
            return { keYiGang: false };
        }
        if (!dangQianGuiZe.panDingGang) {
            return { keYiGang: false };
        }
        return dangQianGuiZe.panDingGang(shouPai, chuPai, options);
    }

    /**
     * 判定是否流局
     */
    function panDingLiuJu(zhuangTai) {
        if (!dangQianGuiZe || !dangQianGuiZe.panDingLiuJu) {
            return { liuJu: false };
        }
        return dangQianGuiZe.panDingLiuJu(zhuangTai);
    }

    /**
     * 计算结算
     */
    function jiSuanJieSuan(huPaiZhe, shouPai, options = {}) {
        if (!dangQianGuiZe || !dangQianGuiZe.jiSuanJieSuan) {
            return { fenShu: 0 };
        }
        return dangQianGuiZe.jiSuanJieSuan(huPaiZhe, shouPai, options);
    }

    /**
     * 基础胡牌判定算法（标准胡牌型：4组+1对将）
     * 各规则可复用或重写
     */
    function jiChuHuPaiPanDing(shouPai, xuYaoJiangPai = true) {
        if (!shouPai || shouPai.length < 1) {
            return false;
        }

        const paiShu = shouPai.length;
        
        // 标准胡牌：14张（含将）或13张（等一张）
        if (xuYaoJiangPai && paiShu % 3 !== 2) {
            // 尝试七对
            if (paiShu === 14) {
                return shiQiDui(shouPai);
            }
            return false;
        }

        const tongJi = MahjongTiles.tongJiPai(shouPai);
        return keYiFenZu(tongJi, xuYaoJiangPai);
    }

    /**
     * 判断是否可以分组（递归算法）
     */
    function keYiFenZu(tongJi, xuYaoJiang) {
        const paiList = [];
        for (const [key, count] of tongJi) {
            if (count > 0) {
                const [hua, dian] = key.split('_');
                paiList.push({ hua, dian: parseInt(dian), count });
            }
        }
        
        if (paiList.length === 0) {
            return !xuYaoJiang;
        }

        paiList.sort((a, b) => {
            if (a.hua !== b.hua) return a.hua.localeCompare(b.hua);
            return a.dian - b.dian;
        });

        return fenZuDiGui(paiList, tongJi, xuYaoJiang, 0);
    }

    /**
     * 分组递归
     */
    function fenZuDiGui(paiList, tongJi, xuYaoJiang, index) {
        if (index >= paiList.length) {
            return !xuYaoJiang;
        }

        const pai = paiList[index];
        const key = `${pai.hua}_${pai.dian}`;
        const count = tongJi.get(key) || 0;

        if (count === 0) {
            return fenZuDiGui(paiList, tongJi, xuYaoJiang, index + 1);
        }

        // 尝试作为将牌
        if (xuYaoJiang && count >= 2) {
            tongJi.set(key, count - 2);
            if (fenZuDiGui(paiList, tongJi, false, index)) {
                tongJi.set(key, count);
                return true;
            }
            tongJi.set(key, count);
        }

        // 尝试作为刻子
        if (count >= 3) {
            tongJi.set(key, count - 3);
            if (fenZuDiGui(paiList, tongJi, xuYaoJiang, index)) {
                tongJi.set(key, count);
                return true;
            }
            tongJi.set(key, count);
        }

        // 尝试作为顺子（只有数牌可以）
        if (MahjongTiles.shiShuPai({ hua: pai.hua, dian: pai.dian }) && pai.dian <= 7) {
            const key1 = `${pai.hua}_${pai.dian}`;
            const key2 = `${pai.hua}_${pai.dian + 1}`;
            const key3 = `${pai.hua}_${pai.dian + 2}`;
            
            const c1 = tongJi.get(key1) || 0;
            const c2 = tongJi.get(key2) || 0;
            const c3 = tongJi.get(key3) || 0;
            
            if (c1 >= 1 && c2 >= 1 && c3 >= 1) {
                tongJi.set(key1, c1 - 1);
                tongJi.set(key2, c2 - 1);
                tongJi.set(key3, c3 - 1);
                if (fenZuDiGui(paiList, tongJi, xuYaoJiang, index)) {
                    tongJi.set(key1, c1);
                    tongJi.set(key2, c2);
                    tongJi.set(key3, c3);
                    return true;
                }
                tongJi.set(key1, c1);
                tongJi.set(key2, c2);
                tongJi.set(key3, c3);
            }
        }

        return false;
    }

    /**
     * 判断是否七对
     */
    function shiQiDui(shouPai) {
        if (shouPai.length !== 14) return false;
        
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        
        for (const [key, count] of tongJi) {
            if (count % 2 !== 0) return false;
        }
        
        const duiShu = tongJi.size;
        return duiShu === 7;
    }

    /**
     * 判断是否十三幺
     */
    function shiShiSanYao(shouPai) {
        if (shouPai.length !== 14) return false;
        
        const yaoPai = [
            { hua: 'wan', dian: 1 }, { hua: 'wan', dian: 9 },
            { hua: 'tiao', dian: 1 }, { hua: 'tiao', dian: 9 },
            { hua: 'tong', dian: 1 }, { hua: 'tong', dian: 9 },
            { hua: 'feng', dian: 1 }, { hua: 'feng', dian: 2 },
            { hua: 'feng', dian: 3 }, { hua: 'feng', dian: 4 },
            { hua: 'jian', dian: 1 }, { hua: 'jian', dian: 2 },
            { hua: 'jian', dian: 3 }
        ];
        
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        let youYaoJiang = false;
        
        for (const yao of yaoPai) {
            const key = MahjongTiles.huoQuPaiId(yao);
            const count = tongJi.get(key) || 0;
            if (count === 0) return false;
            if (count === 2) youYaoJiang = true;
        }
        
        return youYaoJiang;
    }

    return {
        GUI_ZE_JIE_KOU,
        zhuCeGuiZe,
        zhuXiaoGuiZe,
        huoQuSuoYouGuiZe,
        qieHuanGuiZe,
        huoQuDangQianGuiZe,
        huoQuGuiZePeiZhi,
        chuangJianPaiZu,
        panDingHuPai,
        jiSuanFanShu,
        huoQuTingPai,
        panDingChi,
        panDingPeng,
        panDingGang,
        panDingLiuJu,
        jiSuanJieSuan,
        jiChuHuPaiPanDing,
        shiQiDui,
        shiShiSanYao
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuleEngine;
}
