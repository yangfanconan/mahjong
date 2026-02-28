/**
 * 广东麻将规则（推倒胡）
 * 特点：
 * - 136张牌
 * - 支持买马（中马加分）
 * - 封顶（一般8番封顶）
 * - 支持多种番型
 */

const RuleGuangdong = {
    id: 'guangdong',
    mingCheng: '广东麻将',
    miaoShu: '推倒胡，136张牌，支持买马',
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
    zhiChiShiSanYao: false,
    xueZhanDaoDi: false,
    zhaJiao: false,
    diFen: 1,

    // 封顶番数
    fengDing: 8,
    
    // 马牌数量
    maShu: 0,
    maPai: [],

    /**
     * 初始化规则
     */
    chuShiHua: function() {
        this.maPai = [];
    },

    /**
     * 设置马牌
     */
    sheZhiMaPai: function(maList) {
        this.maPai = maList;
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

        // 检查七对
        if (RuleEngine.shiQiDui(shouPai)) {
            return { keYiHu: true, leiXing: 'qi_dui' };
        }

        // 检查标准胡牌
        if (this.shiBiaoZhunHu(shouPai)) {
            return { keYiHu: true, leiXing: 'biao_zhun' };
        }

        return { keYiHu: false, yuan: '未成胡牌型' };
    },

    /**
     * 判断标准胡牌
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

        if (count >= 3) {
            const xinTongJi = new Map(tongJi);
            xinTongJi.set(pai.key, count - 3);
            if (this.quanShiMiaoShun(xinTongJi)) return true;
        }

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
     * 计算番数
     */
    jiSuanFanShu: function(shouPai, options = {}) {
        const fanXing = [];
        let fanShu = 0;

        const huJieGuo = this.panDingHuPai(shouPai, options);
        if (!huJieGuo.keYiHu) {
            return { fanShu: 0, fanXing: [] };
        }

        // 基础胡
        fanShu = 1;
        fanXing.push('鸡胡');

        // 七对
        if (huJieGuo.leiXing === 'qi_dui') {
            fanXing.push('七对');
            fanShu = 3;
        }

        // 对对胡
        if (this.shiDuiDuiHe(shouPai)) {
            fanXing.push('对对胡');
            fanShu = Math.max(fanShu, 3);
        }

        // 混一色
        if (this.shiHunYiSe(shouPai)) {
            fanXing.push('混一色');
            fanShu = Math.max(fanShu, 3);
        }

        // 清一色
        if (this.shiQingYiSe(shouPai)) {
            fanXing.push('清一色');
            fanShu = Math.max(fanShu, 6);
        }

        // 大三元
        if (this.shiDaSanYuan(shouPai)) {
            fanXing.push('大三元');
            fanShu = Math.max(fanShu, 8);
        }

        // 小三元
        if (this.shiXiaoSanYuan(shouPai)) {
            fanXing.push('小三元');
            fanShu = Math.max(fanShu, 5);
        }

        // 大四喜
        if (this.shiDaSiXi(shouPai)) {
            fanXing.push('大四喜');
            fanShu = Math.max(fanShu, 8);
        }

        // 小四喜
        if (this.shiXiaoSiXi(shouPai)) {
            fanXing.push('小四喜');
            fanShu = Math.max(fanShu, 6);
        }

        // 字一色
        if (this.shiZiYiSe(shouPai)) {
            fanXing.push('字一色');
            fanShu = 8;
        }

        // 清老头
        if (this.shiQingLaoTou(shouPai)) {
            fanXing.push('清老头');
            fanShu = 8;
        }

        // 十三幺
        if (RuleEngine.shiShiSanYao(shouPai)) {
            fanXing.push('十三幺');
            fanShu = 8;
        }

        // 自摸
        if (options.ziMo) {
            fanXing.push('自摸');
            fanShu += 1;
        }

        // 门清
        if (options.menQian) {
            fanXing.push('门清');
            fanShu += 1;
        }

        // 杠上开花
        if (options.gangShangKaiHua) {
            fanXing.push('杠上开花');
            fanShu = Math.max(fanShu, 8);
        }

        // 抢杠胡
        if (options.qiangGangHu) {
            fanXing.push('抢杠胡');
            fanShu = Math.max(fanShu, 8);
        }

        // 天胡/地胡
        if (options.tianHu) {
            fanXing.push('天胡');
            fanShu = 8;
        } else if (options.diHu) {
            fanXing.push('地胡');
            fanShu = 8;
        }

        // 封顶
        fanShu = Math.min(fanShu, this.fengDing);

        // 计算中马
        const maFen = this.jiSuanMaFen(shouPai, options);
        if (maFen > 0) {
            fanXing.push(`中马+${maFen}`);
        }

        return { fanShu: fanShu + maFen, fanXing, jiChuFan: fanShu, maFen };
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
        
        return keZiShu >= 4;
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
     * 判断大三元
     */
    shiDaSanYuan: function(shouPai) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const zhong = tongJi.get('jian_1') || 0;
        const fa = tongJi.get('jian_2') || 0;
        const bai = tongJi.get('jian_3') || 0;
        
        return zhong >= 3 && fa >= 3 && bai >= 3;
    },

    /**
     * 判断小三元
     */
    shiXiaoSanYuan: function(shouPai) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const zhong = tongJi.get('jian_1') || 0;
        const fa = tongJi.get('jian_2') || 0;
        const bai = tongJi.get('jian_3') || 0;
        
        const keZiShu = (zhong >= 3 ? 1 : 0) + (fa >= 3 ? 1 : 0) + (bai >= 3 ? 1 : 0);
        const jiangShu = (zhong >= 2 ? 1 : 0) + (fa >= 2 ? 1 : 0) + (bai >= 2 ? 1 : 0);
        
        return keZiShu === 2 && jiangShu >= 3;
    },

    /**
     * 判断大四喜
     */
    shiDaSiXi: function(shouPai) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const dong = tongJi.get('feng_1') || 0;
        const nan = tongJi.get('feng_2') || 0;
        const xi = tongJi.get('feng_3') || 0;
        const bei = tongJi.get('feng_4') || 0;
        
        return dong >= 3 && nan >= 3 && xi >= 3 && bei >= 3;
    },

    /**
     * 判断小四喜
     */
    shiXiaoSiXi: function(shouPai) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const feng = [
            tongJi.get('feng_1') || 0,
            tongJi.get('feng_2') || 0,
            tongJi.get('feng_3') || 0,
            tongJi.get('feng_4') || 0
        ];
        
        const keZiShu = feng.filter(c => c >= 3).length;
        const jiangShu = feng.filter(c => c >= 2).length;
        
        return keZiShu === 3 && jiangShu === 4;
    },

    /**
     * 判断字一色
     */
    shiZiYiSe: function(shouPai) {
        for (const pai of shouPai) {
            if (!MahjongTiles.shiZiPai(pai)) return false;
        }
        return true;
    },

    /**
     * 判断清老头
     */
    shiQingLaoTou: function(shouPai) {
        for (const pai of shouPai) {
            if (!MahjongTiles.shiShuPai(pai)) return false;
            if (pai.dian !== 1 && pai.dian !== 9) return false;
        }
        return true;
    },

    /**
     * 计算中马加分
     */
    jiSuanMaFen: function(shouPai, options) {
        if (this.maPai.length === 0) return 0;
        
        let maFen = 0;
        const wanJiaWeiZhi = options.wanJiaWeiZhi || 0;
        
        for (const ma of this.maPai) {
            // 中马规则：根据马牌点数对应玩家位置
            const maWeiZhi = ma.dian % 4;
            if (maWeiZhi === wanJiaWeiZhi) {
                maFen += 1;
            }
        }
        
        return maFen;
    },

    /**
     * 获取听牌列表
     */
    huoQuTingPai: function(shouPai) {
        const tingPaiList = [];
        if (shouPai.length !== 13) return tingPaiList;

        // 尝试所有可能的牌
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

        if (wanJiaFangWei !== 3) {
            return { keYiChi: false };
        }

        const chiList = [];
        const { hua, dian } = chuPai;

        if (dian >= 3) {
            const p1 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 2);
            const p2 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 1);
            if (p1.length > 0 && p2.length > 0) {
                chiList.push({ leiXing: 'chi_zuo', pai: [p1[0], p2[0], chuPai] });
            }
        }

        if (dian >= 2 && dian <= 8) {
            const p1 = MahjongTiles.chaZhaoPai(shouPai, hua, dian - 1);
            const p2 = MahjongTiles.chaZhaoPai(shouPai, hua, dian + 1);
            if (p1.length > 0 && p2.length > 0) {
                chiList.push({ leiXing: 'chi_zhong', pai: [p1[0], chuPai, p2[0]] });
            }
        }

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
        
        if (chuPai) {
            const key = MahjongTiles.huoQuPaiId(chuPai);
            const count = tongJi.get(key) || 0;
            if (count >= 3) {
                gangList.push({ leiXing: 'ming_gang', pai: chuPai });
            }
        }
        
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
    module.exports = RuleGuangdong;
}
