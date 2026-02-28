/**
 * 国际麻将规则（通用规则）
 * 特点：
 * - 136张牌
 * - 基础规则，适合新手
 * - 支持所有基本操作
 * - 番型简化
 */

const RuleInternational = {
    id: 'international',
    mingCheng: '国际麻将',
    miaoShu: '通用规则，136张牌，适合新手',
    paiShu: 136,
    zhiChiHuaPai: false,
    zhiChiChi: true,
    zhiChipeng: true,
    zhiChiGang: true,
    zhiChiAnGang: true,
    zhiChiJiaGang: true,
    xuYaoMenQing: false,
    xuYaoJiangPai: true,
    zhiChiQiDui: true,
    zhiChiShiSanYao: true,
    xueZhanDaoDi: false,
    zhaJiao: false,
    diFen: 1,

    /**
     * 初始化规则
     */
    chuShiHua: function() {
        // 无特殊初始化
    },

    /**
     * 判定胡牌
     */
    panDingHuPai: function(shouPai, options = {}) {
        if (!shouPai || shouPai.length === 0) {
            return { keYiHu: false, yuan: '无手牌' };
        }

        const paiShu = shouPai.length;
        
        if (paiShu !== 14) {
            return { keYiHu: false, yuan: '牌数不对' };
        }

        // 十三幺
        if (RuleEngine.shiShiSanYao(shouPai)) {
            return { keYiHu: true, leiXing: 'shi_san_yao' };
        }

        // 七对
        if (RuleEngine.shiQiDui(shouPai)) {
            return { keYiHu: true, leiXing: 'qi_dui' };
        }

        // 标准胡牌
        if (RuleEngine.jiChuHuPaiPanDing(shouPai, true)) {
            return { keYiHu: true, leiXing: 'biao_zhun' };
        }

        return { keYiHu: false, yuan: '未成胡牌型' };
    },

    /**
     * 计算番数
     */
    jiSuanFanShu: function(shouPai, options = {}) {
        const fanXing = [];
        let fanShu = 1;

        const huJieGuo = this.panDingHuPai(shouPai, options);
        if (!huJieGuo.keYiHu) {
            return { fanShu: 0, fanXing: [] };
        }

        // 十三幺
        if (huJieGuo.leiXing === 'shi_san_yao') {
            fanXing.push('十三幺');
            return { fanShu: 13, fanXing };
        }

        // 七对
        if (huJieGuo.leiXing === 'qi_dui') {
            fanXing.push('七对');
            fanShu = 2;
        }

        // 检查特殊番型
        if (huJieGuo.leiXing === 'biao_zhun') {
            // 清一色
            if (this.shiQingYiSe(shouPai)) {
                fanXing.push('清一色');
                fanShu = Math.max(fanShu, 6);
            }
            // 混一色
            else if (this.shiHunYiSe(shouPai)) {
                fanXing.push('混一色');
                fanShu = Math.max(fanShu, 3);
            }

            // 对对胡
            if (this.shiDuiDuiHe(shouPai)) {
                fanXing.push('对对胡');
                fanShu = Math.max(fanShu, 3);
            }
        }

        // 自摸
        if (options.ziMo) {
            fanXing.push('自摸');
            fanShu += 1;
        }

        // 门清
        if (options.menQian && !options.ziMo) {
            fanXing.push('门清');
            fanShu += 1;
        }

        // 杠上开花
        if (options.gangShangKaiHua) {
            fanXing.push('杠上开花');
            fanShu += 2;
        }

        // 抢杠胡
        if (options.qiangGangHu) {
            fanXing.push('抢杠胡');
            fanShu += 2;
        }

        // 天胡/地胡
        if (options.tianHu) {
            fanXing.push('天胡');
            fanShu += 10;
        } else if (options.diHu) {
            fanXing.push('地胡');
            fanShu += 10;
        }

        // 海底捞月
        if (options.haiDi) {
            fanXing.push('海底捞月');
            fanShu += 1;
        }

        return { fanShu, fanXing };
    },

    /**
     * 判断清一色
     */
    shiQingYiSe: function(shouPai) {
        let huaSet = new Set();
        for (const pai of shouPai) {
            if (MahjongTiles.shiShuPai(pai)) {
                huaSet.add(pai.hua);
            } else {
                return false;
            }
        }
        return huaSet.size === 1;
    },

    /**
     * 判断混一色
     */
    shiHunYiSe: function(shouPai) {
        let huaSet = new Set();
        let ziPai = false;
        for (const pai of shouPai) {
            if (MahjongTiles.shiShuPai(pai)) {
                huaSet.add(pai.hua);
            } else {
                ziPai = true;
            }
        }
        return huaSet.size === 1 && ziPai;
    },

    /**
     * 判断对对胡
     */
    shiDuiDuiHe: function(shouPai) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        let keZiShu = 0;
        let jiangShu = 0;
        
        for (const [key, count] of tongJi) {
            if (count >= 3) keZiShu++;
            if (count === 2 || count === 4) jiangShu++;
        }
        
        return keZiShu >= 4 && jiangShu >= 1;
    },

    /**
     * 获取听牌列表
     */
    huoQuTingPai: function(shouPai) {
        const tingPaiList = [];
        if (shouPai.length !== 13) return tingPaiList;

        const allPai = this.huoQuSuoYouKeNengPai();
        
        for (const testPai of allPai) {
            const testShouPai = [...shouPai, testPai];
            if (this.panDingHuPai(testShouPai).keYiHu) {
                tingPaiList.push(testPai);
            }
        }

        return tingPaiList;
    },

    /**
     * 获取所有可能的牌
     */
    huoQuSuoYouKeNengPai: function() {
        const paiList = [];
        
        // 数牌
        const huaList = [MahjongTiles.HUA_SE.WAN, MahjongTiles.HUA_SE.TIAO, MahjongTiles.HUA_SE.TONG];
        for (const hua of huaList) {
            for (let dian = 1; dian <= 9; dian++) {
                paiList.push({ hua, dian, id: -1 });
            }
        }
        
        // 字牌
        for (let dian = 1; dian <= 4; dian++) {
            paiList.push({ hua: MahjongTiles.HUA_SE.FENG, dian, id: -1 });
        }
        for (let dian = 1; dian <= 3; dian++) {
            paiList.push({ hua: MahjongTiles.HUA_SE.JIAN, dian, id: -1 });
        }

        return paiList;
    },

    /**
     * 判定是否可以吃
     */
    panDingChi: function(shouPai, chuPai, wanJiaFangWei) {
        if (!chuPai || !MahjongTiles.shiShuPai(chuPai)) {
            return { keYiChi: false };
        }

        if (wanJiaFangWei !== 3) {
            return { keYiChi: false };
        }

        const chiList = [];
        const { hua, dian } = chuPai;

        // 左吃
        if (dian >= 3) {
            const p1 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 2);
            const p2 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 1);
            if (p1.length > 0 && p2.length > 0) {
                chiList.push({ leiXing: 'chi_zuo', pai: [p1[0], p2[0], chuPai] });
            }
        }

        // 中吃
        if (dian >= 2 && dian <= 8) {
            const p1 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 1);
            const p2 = MahjongTiles.chaZhaoPai(shouPai, hua, dian + 1);
            if (p1.length > 0 && p2.length > 0) {
                chiList.push({ leiXing: 'chi_zhong', pai: [p1[0], chuPai, p2[0]] });
            }
        }

        // 右吃
        if (dian <= 7) {
            const p1 = MahjongTiles.chaZhaoPai(shouPai, hua, dian + 1);
            const p2 = MahjongTiles.chaZhaoPai(shouPai, hua, dian + 2);
            if (p1.length > 0 && p2.length > 0) {
                chiList.push({ leiXing: 'chi_you', pai: [chuPai, p1[0], p2[0]] });
            }
        }

        return { keYiChi: chiList.length > 0, chiList };
    },

    /**
     * 判定是否可以碰
     */
    panDingPeng: function(shouPai, chuPai) {
        if (!chuPai) return { keYiPeng: false };
        
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const key = MahjongTiles.huoQuPaiId(chuPai);
        const count = tongJi.get(key) || 0;
        
        if (count >= 2) {
            return { keYiPeng: true, pai: chuPai };
        }
        
        return { keYiPeng: false };
    },

    /**
     * 判定是否可以杠
     */
    panDingGang: function(shouPai, chuPai, options = {}) {
        const gangList = [];
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        
        // 明杠
        if (chuPai) {
            const key = MahjongTiles.huoQuPaiId(chuPai);
            const count = tongJi.get(key) || 0;
            if (count >= 3) {
                gangList.push({ leiXing: 'ming_gang', pai: chuPai });
            }
        }
        
        // 暗杠
        for (const [key, count] of tongJi) {
            if (count >= 4) {
                const [hua, dian] = key.split('_');
                gangList.push({ leiXing: 'an_gang', pai: { hua, dian: parseInt(dian) } });
            }
        }
        
        return { keYiGang: gangList.length > 0, gangList };
    },

    /**
     * 判定是否流局
     */
    panDingLiuJu: function(zhuangTai) {
        if (zhuangTai.shengYuPaiShu <= 0) {
            return { liuJu: true, yuan: '牌摸完' };
        }
        return { liuJu: false };
    },

    /**
     * 计算结算
     */
    jiSuanJieSuan: function(huPaiZhe, shouPai, options = {}) {
        const fanJieGuo = this.jiSuanFanShu(shouPai, options);
        
        return {
            fenShu: fanJieGuo.fanShu * this.diFen,
            fanShu: fanJieGuo.fanShu,
            fanXing: fanJieGuo.fanXing,
            huPaiZhe
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuleInternational;
}
