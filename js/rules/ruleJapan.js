/**
 * 日本麻将规则（立直麻将/ Riichi Mahjong）
 * 特点：
 * - 136张牌
 * - 支持立直、振听、流局满贯
 * - 番数复杂（役种多）
 * - 支持宝牌（悬赏牌）
 */

const RuleJapan = {
    id: 'japan',
    mingCheng: '日本麻将',
    miaoShu: '立直麻将，136张牌，支持立直和宝牌',
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

    // 宝牌
    baoPai: [],
    liBaoPai: [],
    
    // 玩家状态
    wanJiaZhuangTai: {},

    /**
     * 初始化规则
     */
    chuShiHua: function() {
        this.baoPai = [];
        this.liBaoPai = [];
        this.wanJiaZhuangTai = {
            0: { liZhi: false, liZhiTunShu: 0, menQian: true },
            1: { liZhi: false, liZhiTunShu: 0, menQian: true },
            2: { liZhi: false, liZhiTunShu: 0, menQian: true },
            3: { liZhi: false, liZhiTunShu: 0, menQian: true }
        };
    },

    /**
     * 设置宝牌
     */
    sheZhiBaoPai: function(baoPaiList, liBaoPaiList = []) {
        this.baoPai = baoPaiList;
        this.liBaoPai = liBaoPaiList;
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

        // 检查十三幺
        if (RuleEngine.shiShiSanYao(shouPai)) {
            return { keYiHu: true, leiXing: 'guo_shi_wu_shuang', yiZhong: '役满' };
        }

        // 检查七对
        if (RuleEngine.shiQiDui(shouPai)) {
            return { keYiHu: true, leiXing: 'qi_dui_zi', yiZhong: '2番' };
        }

        // 检查标准胡牌
        if (this.shiBiaoZhunHu(shouPai)) {
            return { keYiHu: true, leiXing: 'biao_zhun', yiZhong: '基础' };
        }

        return { keYiHu: false, yuan: '未成胡牌型' };
    },

    /**
     * 判断是否标准胡牌型
     */
    shiBiaoZhunHu: function(shouPai) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        
        for (const [key, count] of tongJi) {
            if (count >= 2) {
                const xinTongJi = new Map(tongJi);
                xinTongJi.set(key, count - 2);
                
                if (this.quanShiMiaoShun(xinTongJi)) {
                    return true;
                }
            }
        }
        
        return false;
    },

    /**
     * 检查是否全是面子
     */
    quanShiMiaoShun: function(tongJi) {
        const paiList = [];
        for (const [key, count] of tongJi) {
            if (count > 0) {
                const [hua, dian] = key.split('_');
                paiList.push({ hua, dian: parseInt(dian), count, key });
            }
        }
        
        if (paiList.length === 0) return true;
        
        paiList.sort((a, b) => {
            if (a.hua !== b.hua) return a.hua.localeCompare(b.hua);
            return a.dian - b.dian;
        });

        const pai = paiList[0];
        const count = tongJi.get(pai.key) || 0;
        
        if (count === 0) {
            paiList.shift();
            return this.quanShiMiaoShun(tongJi);
        }

        // 尝试刻子
        if (count >= 3) {
            const xinTongJi = new Map(tongJi);
            xinTongJi.set(pai.key, count - 3);
            if (this.quanShiMiaoShun(xinTongJi)) return true;
        }

        // 尝试顺子（只有数牌可以）
        if (MahjongTiles.shiShuPai({ hua: pai.hua, dian: pai.dian }) && pai.dian <= 7) {
            const key2 = `${pai.hua}_${pai.dian + 1}`;
            const key3 = `${pai.hua}_${pai.dian + 2}`;
            const c2 = tongJi.get(key2) || 0;
            const c3 = tongJi.get(key3) || 0;
            
            if (c2 >= 1 && c3 >= 1) {
                const xinTongJi = new Map(tongJi);
                xinTongJi.set(pai.key, count - 1);
                xinTongJi.set(key2, c2 - 1);
                xinTongJi.set(key3, c3 - 1);
                if (this.quanShiMiaoShun(xinTongJi)) return true;
            }
        }

        return false;
    },

    /**
     * 计算番数和符数
     */
    jiSuanFanShu: function(shouPai, options = {}) {
        const fanXing = [];
        let fanShu = 0;
        let fuShu = 20; // 基础符

        const huJieGuo = this.panDingHuPai(shouPai, options);
        if (!huJieGuo.keYiHu) {
            return { fanShu: 0, fuShu: 0, fanXing: [] };
        }

        // 十三幺
        if (huJieGuo.leiXing === 'guo_shi_wu_shuang') {
            fanXing.push('国士无双');
            fanShu = 13;
            return { fanShu, fuShu: 30, fanXing };
        }

        // 七对
        if (huJieGuo.leiXing === 'qi_dui_zi') {
            fanXing.push('七对子');
            fanShu = 2;
            fuShu = 25;
        }

        // 标准胡牌
        if (huJieGuo.leiXing === 'biao_zhun') {
            // 检查各种役
            fanShu = this.jianChaYiZhong(shouPai, options, fanXing, fanShu);
        }

        // 立直
        if (options.liZhi) {
            fanXing.push('立直');
            fanShu += 1;
        }

        // 双立直
        if (options.shuangLiZhi) {
            fanXing.push('两立直');
            fanShu += 1;
        }

        // 一发
        if (options.yiFa) {
            fanXing.push('一发');
            fanShu += 1;
        }

        // 自摸
        if (options.ziMo) {
            fanXing.push('门前清自摸和');
            fanShu += 1;
        }

        // 杠上开花
        if (options.gangShangKaiHua) {
            fanXing.push('岭上开花');
            fanShu += 1;
        }

        // 抢杠
        if (options.qiangGang) {
            fanXing.push('抢杠');
            fanShu += 1;
        }

        // 海底摸月/河底捞鱼
        if (options.haiDi) {
            fanXing.push(options.ziMo ? '海底摸月' : '河底捞鱼');
            fanShu += 1;
        }

        // 宝牌
        const baoPaiShu = this.jiSuanBaoPai(shouPai, options);
        if (baoPaiShu > 0) {
            fanXing.push(`宝牌×${baoPaiShu}`);
            fanShu += baoPaiShu;
        }

        // 里宝牌
        if (options.liZhi && this.liBaoPai.length > 0) {
            const liBaoPaiShu = this.jiSuanLiBaoPai(shouPai);
            if (liBaoPaiShu > 0) {
                fanXing.push(`里宝牌×${liBaoPaiShu}`);
                fanShu += liBaoPaiShu;
            }
        }

        // 没有任何役，不能胡
        if (fanShu === 0 && huJieGuo.leiXing === 'biao_zhun') {
            return { fanShu: 0, fuShu: 0, fanXing: [], yuan: '无役' };
        }

        return { fanShu, fuShu, fanXing };
    },

    /**
     * 检查役种
     */
    jianChaYiZhong: function(shouPai, options, fanXing, fanShu) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);

        // 断幺九
        if (this.shiDuanYaoJiu(shouPai)) {
            fanXing.push('断幺九');
            fanShu += 1;
        }

        // 平和
        if (this.shiPingHe(shouPai, options)) {
            fanXing.push('平和');
            fanShu += 1;
        }

        // 一杯口
        if (this.shiYiBeiKou(shouPai)) {
            fanXing.push('一杯口');
            fanShu += 1;
        }

        // 三色同顺
        if (this.shiSanSeTongShun(shouPai)) {
            fanXing.push('三色同顺');
            fanShu += 2;
        }

        // 一气通贯
        if (this.shiYiQiTongGuan(shouPai)) {
            fanXing.push('一气通贯');
            fanShu += 2;
        }

        // 混全带幺九
        if (this.shiHunQuanDaiYaoJiu(shouPai)) {
            fanXing.push('混全带幺九');
            fanShu += 2;
        }

        // 对对和
        if (this.shiDuiDuiHe(shouPai)) {
            fanXing.push('对对和');
            fanShu += 2;
        }

        // 三暗刻
        if (this.shiSanAnKe(shouPai, options)) {
            fanXing.push('三暗刻');
            fanShu += 2;
        }

        // 混一色
        if (this.shiHunYiSe(shouPai)) {
            fanXing.push('混一色');
            fanShu += 3;
        }

        // 清一色
        if (this.shiQingYiSe(shouPai)) {
            fanXing.push('清一色');
            fanShu += 6;
        }

        return fanShu;
    },

    /**
     * 判断断幺九
     */
    shiDuanYaoJiu: function(shouPai) {
        for (const pai of shouPai) {
            // 字牌
            if (MahjongTiles.shiZiPai(pai)) return false;
            // 幺九牌
            if (MahjongTiles.shiShuPai(pai) && (pai.dian === 1 || pai.dian === 9)) return false;
        }
        return true;
    },

    /**
     * 判断平和
     */
    shiPingHe: function(shouPai, options) {
        // 需要门清
        if (!options.menQian) return false;
        
        // TODO: 完整的平和判定
        return false;
    },

    /**
     * 判断一杯口
     */
    shiYiBeiKou: function(shouPai) {
        // TODO: 一杯口判定
        return false;
    },

    /**
     * 判断三色同顺
     */
    shiSanSeTongShun: function(shouPai) {
        // TODO: 三色同顺判定
        return false;
    },

    /**
     * 判断一气通贯
     */
    shiYiQiTongGuan: function(shouPai) {
        // TODO: 一气通贯判定
        return false;
    },

    /**
     * 判断混全带幺九
     */
    shiHunQuanDaiYaoJiu: function(shouPai) {
        // TODO: 混全带幺九判定
        return false;
    },

    /**
     * 判断对对和
     */
    shiDuiDuiHe: function(shouPai) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        let keZiShu = 0;
        let jiangPaiShu = 0;
        
        for (const [key, count] of tongJi) {
            if (count === 3) keZiShu++;
            else if (count === 2) jiangPaiShu++;
            else if (count === 4) keZiShu++;
        }
        
        return keZiShu === 4 && jiangPaiShu === 1;
    },

    /**
     * 判断三暗刻
     */
    shiSanAnKe: function(shouPai, options) {
        // TODO: 三暗刻判定
        return false;
    },

    /**
     * 判断混一色
     */
    shiHunYiSe: function(shouPai) {
        let huaSeSet = new Set();
        let youZiPai = false;
        
        for (const pai of shouPai) {
            if (MahjongTiles.shiShuPai(pai)) {
                huaSeSet.add(pai.hua);
            } else {
                youZiPai = true;
            }
        }
        
        return huaSeSet.size === 1 && youZiPai;
    },

    /**
     * 判断清一色
     */
    shiQingYiSe: function(shouPai) {
        let huaSeSet = new Set();
        
        for (const pai of shouPai) {
            if (MahjongTiles.shiShuPai(pai)) {
                huaSeSet.add(pai.hua);
            } else {
                return false;
            }
        }
        
        return huaSeSet.size === 1;
    },

    /**
     * 计算宝牌数量
     */
    jiSuanBaoPai: function(shouPai, options) {
        let count = 0;
        
        for (const pai of shouPai) {
            for (const bao of this.baoPai) {
                if (MahjongTiles.paiXiangTong(pai, bao)) {
                    count++;
                }
            }
        }
        
        // 包含杠牌中的宝牌
        if (options.gangPai) {
            for (const pai of options.gangPai) {
                for (const bao of this.baoPai) {
                    if (MahjongTiles.paiXiangTong(pai, bao)) {
                        count++;
                    }
                }
            }
        }
        
        return count;
    },

    /**
     * 计算里宝牌数量
     */
    jiSuanLiBaoPai: function(shouPai) {
        let count = 0;
        
        for (const pai of shouPai) {
            for (const bao of this.liBaoPai) {
                if (MahjongTiles.paiXiangTong(pai, bao)) {
                    count++;
                }
            }
        }
        
        return count;
    },

    /**
     * 获取听牌列表
     */
    huoQuTingPai: function(shouPai) {
        const tingPaiList = [];
        
        if (shouPai.length !== 13) return tingPaiList;

        const huaList = [
            MahjongTiles.HUA_SE.WAN, 
            MahjongTiles.HUA_SE.TIAO, 
            MahjongTiles.HUA_SE.TONG
        ];
        
        for (const hua of huaList) {
            for (let dian = 1; dian <= 9; dian++) {
                const testPai = { hua, dian, id: -1 };
                const testShouPai = [...shouPai, testPai];
                
                if (this.panDingHuPai(testShouPai).keYiHu) {
                    tingPaiList.push(testPai);
                }
            }
        }

        // 字牌
        for (let dian = 1; dian <= 4; dian++) {
            const testPai = { hua: MahjongTiles.HUA_SE.FENG, dian, id: -1 };
            const testShouPai = [...shouPai, testPai];
            if (this.panDingHuPai(testShouPai).keYiHu) {
                tingPaiList.push(testPai);
            }
        }
        
        for (let dian = 1; dian <= 3; dian++) {
            const testPai = { hua: MahjongTiles.HUA_SE.JIAN, dian, id: -1 };
            const testShouPai = [...shouPai, testPai];
            if (this.panDingHuPai(testShouPai).keYiHu) {
                tingPaiList.push(testPai);
            }
        }

        return tingPaiList;
    },

    /**
     * 判定是否可以吃
     */
    panDingChi: function(shouPai, chuPai, wanJiaFangWei) {
        if (!chuPai || !MahjongTiles.shiShuPai(chuPai)) {
            return { keYiChi: false };
        }

        // 只能吃上家打出的牌
        if (wanJiaFangWei !== 3) {
            return { keYiChi: false };
        }

        const chiList = [];
        const { hua, dian } = chuPai;

        // 检查三种吃法：ABC, BCD, CDE
        // 左吃：用7-8吃9
        if (dian >= 3) {
            const p1 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 2);
            const p2 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 1);
            if (p1.length > 0 && p2.length > 0) {
                chiList.push({ 
                    leiXing: 'chi_zuo', 
                    pai: [p1[0], p2[0], chuPai],
                    xianShi: `${dian-2}-${dian-1}-${dian}`
                });
            }
        }

        // 中吃：用6-8吃7
        if (dian >= 2 && dian <= 8) {
            const p1 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 1);
            const p2 = MahjongTiles.chaZhaoPai(shouPai, hua, dian + 1);
            if (p1.length > 0 && p2.length > 0) {
                chiList.push({ 
                    leiXing: 'chi_zhong', 
                    pai: [p1[0], chuPai, p2[0]],
                    xianShi: `${dian-1}-${dian}-${dian+1}`
                });
            }
        }

        // 右吃：用8-9吃7
        if (dian <= 7) {
            const p1 = MahjongTiles.chaZhaoPai(shouPai, hua, dian + 1);
            const p2 = MahjongTiles.chaZhaoPai(shouPai, hua, dian + 2);
            if (p1.length > 0 && p2.length > 0) {
                chiList.push({ 
                    leiXing: 'chi_you', 
                    pai: [chuPai, p1[0], p2[0]],
                    xianShi: `${dian}-${dian+1}-${dian+2}`
                });
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
                gangList.push({ 
                    leiXing: 'an_gang', 
                    pai: { hua, dian: parseInt(dian) } 
                });
            }
        }
        
        return { keYiGang: gangList.length > 0, gangList };
    },

    /**
     * 判定是否流局
     */
    panDingLiuJu: function(zhuangTai) {
        // 牌摸完
        if (zhuangTai.shengYuPaiShu <= 0) {
            return { liuJu: true, yuan: '牌摸完' };
        }

        // 四风连打
        if (zhuangTai.siFengLianDa) {
            return { liuJu: true, yuan: '四风连打' };
        }

        // 四杠散了
        if (zhuangTai.gangShu >= 4) {
            return { liuJu: true, yuan: '四杠散了' };
        }

        // 四家立直
        if (zhuangTai.liZhiShu >= 4) {
            return { liuJu: true, yuan: '四家立直' };
        }

        return { liuJu: false };
    },

    /**
     * 计算结算
     */
    jiSuanJieSuan: function(huPaiZhe, shouPai, options = {}) {
        const fanJieGuo = this.jiSuanFanShu(shouPai, options);
        
        // 计算点数
        let dianShu = this.jiSuanDianShu(fanJieGuo.fanShu, fanJieGuo.fuShu, options.ziMo);
        
        return {
            fenShu: dianShu,
            fanShu: fanJieGuo.fanShu,
            fuShu: fanJieGuo.fuShu,
            fanXing: fanJieGuo.fanXing,
            huPaiZhe
        };
    },

    /**
     * 计算点数
     */
    jiSuanDianShu: function(fanShu, fuShu, ziMo) {
        if (fanShu >= 13) {
            // 役满
            return 8000;
        } else if (fanShu >= 11) {
            return 6000;
        } else if (fanShu >= 8) {
            return 4000;
        } else if (fanShu >= 6) {
            return 3000;
        } else if (fanShu >= 5 || (fanShu >= 4 && fuShu >= 40) || (fanShu >= 3 && fuShu >= 70)) {
            return 2000;
        } else {
            // 基本点
            return Math.min(2000, fuShu * Math.pow(2, fanShu + 2));
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuleJapan;
}
