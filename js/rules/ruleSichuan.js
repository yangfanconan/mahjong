/**
 * 四川麻将规则（血战到底）
 * 
 * 特点：
 * - 108张牌（万/条/筒各36张），无东南西北中发白
 * - 必须缺一门才能胡牌
 * - 血战到底（一家胡牌后继续对局，直到牌摸完）
 * - 自摸加番
 * 
 * 番型表：
 * | 番型     | 番数 | 说明                          |
 * |----------|------|-------------------------------|
 * | 平胡     | 1    | 4顺+1对的基本胡牌             |
 * | 对子胡   | 1    | 7对子胡牌                     |
 * | 七对     | 2    | 7个对子                       |
 * | 龙七对   | 4    | 七对中有4张相同的牌           |
 * | 清一色   | 4    | 只有一种花色                  |
 * | 金钩钓   | 2    | 碰/杠后单吊一张牌胡           |
 * | 将对     | 2    | 对子胡且全是2/5/8             |
 * | 带幺     | 2    | 每组都有1或9                  |
 * | 天胡     | 16   | 庄家起手14张直接胡            |
 * | 地胡     | 16   | 闲家第一轮胡庄家打出的牌      |
 * 
 * 加番：
 * - 自摸：×2
 * - 杠上花：×2
 * - 杠上炮：×2
 * - 抢杠胡：×2
 */

const RuleSichuan = {
    id: 'sichuan',
    mingCheng: '四川麻将',
    miaoShu: '血战到底，缺一门，108张牌',
    paiShu: 108,
    
    zhiChiHuaPai: false,
    zhiChiChi: false,
    zhiChipeng: true,
    zhiChiGang: true,
    zhiChiAnGang: true,
    zhiChiJiaGang: true,
    xuYaoMenQing: false,
    xuYaoJiangPai: true,
    zhiChiQiDui: true,
    zhiChiShiSanYao: false,
    xueZhanDaoDi: true,
    zhaJiao: true,
    
    diFen: 2,
    queMen: null,
    zhuangJia: 0,
    lianZhuangCiShu: 0,

    fanXingBiao: {
        '平胡': { fanShu: 1, miaoShu: '4顺+1对的基本胡牌' },
        '对子胡': { fanShu: 1, miaoShu: '7对子胡牌' },
        '七对': { fanShu: 2, miaoShu: '7个对子' },
        '龙七对': { fanShu: 4, miaoShu: '七对中有4张相同的牌' },
        '清一色': { fanShu: 4, miaoShu: '只有一种花色' },
        '金钩钓': { fanShu: 2, miaoShu: '碰/杠后单吊一张牌胡' },
        '将对': { fanShu: 2, miaoShu: '对子胡且全是2/5/8' },
        '带幺': { fanShu: 2, miaoShu: '每组都有1或9' },
        '天胡': { fanShu: 16, miaoShu: '庄家起手14张直接胡' },
        '地胡': { fanShu: 16, miaoShu: '闲家第一轮胡庄家打出的牌' },
        '自摸': { fanShu: 2, miaoShu: '自己摸到的牌胡', shiJiaFan: true },
        '杠上花': { fanShu: 2, miaoShu: '杠后摸到的牌胡', shiJiaFan: true },
        '杠上炮': { fanShu: 2, miaoShu: '杠后打出的牌被胡', shiJiaFan: true },
        '抢杠胡': { fanShu: 2, miaoShu: '抢别人的加杠胡', shiJiaFan: true }
    },

    chuShiHua: function() {
        this.queMen = null;
        this.zhuangJia = 0;
        this.lianZhuangCiShu = 0;
    },

    sheZhiQueMen: function(men) {
        this.queMen = men;
    },

    sheZhiZhuangJia: function(wanJiaIndex) {
        this.zhuangJia = wanJiaIndex;
    },

    panDingHuPai: function(shouPai, options = {}) {
        if (!shouPai || shouPai.length < 14) {
            return { keYiHu: false, yuanYin: '牌数不足' };
        }

        if (this.queMen) {
            const hasQueMen = shouPai.some(p => p.hua === this.queMen);
            if (hasQueMen) {
                return { keYiHu: false, yuanYin: '还有缺门牌未打出' };
            }
        }

        if (this.shiQiDui(shouPai)) {
            return { keYiHu: true, leiXing: 'qi_dui' };
        }

        if (this.shiPuTongHu(shouPai)) {
            return { keYiHu: true, leiXing: 'pu_tong' };
        }

        return { keYiHu: false, yuanYin: '牌型不符合胡牌条件' };
    },

    shiQiDui: function(shouPai) {
        if (shouPai.length !== 14) return false;
        
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        let duiCount = 0;
        
        for (const [key, count] of tongJi) {
            if (count === 2) duiCount++;
            else if (count === 4) duiCount += 2;
            else if (count !== 4 && count % 2 !== 0) return false;
        }
        
        return duiCount === 7;
    },

    shiPuTongHu: function(shouPai) {
        if (shouPai.length !== 14) return false;
        
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        return this.changShiHu(tongJi);
    },

    changShiHu: function(tongJi) {
        const keys = Array.from(tongJi.keys());
        
        for (const key of keys) {
            const count = tongJi.get(key);
            if (count >= 2) {
                const xinTongJi = new Map(tongJi);
                xinTongJi.set(key, count - 2);
                if (this.quanShiMiaoShun(xinTongJi)) return true;
            }
        }
        return false;
    },

    quanShiMiaoShun: function(tongJi) {
        let hasPai = false;
        for (const [key, count] of tongJi) {
            if (count > 0) {
                hasPai = true;
                break;
            }
        }
        if (!hasPai) return true;

        const paiList = [];
        for (const [key, count] of tongJi) {
            if (count > 0) {
                const [hua, dian] = key.split('_');
                paiList.push({ hua, dian: parseInt(dian), count, key });
            }
        }
        
        paiList.sort((a, b) => {
            if (a.hua !== b.hua) return a.hua.localeCompare(b.hua);
            return a.dian - b.dian;
        });

        const pai = paiList[0];
        const count = tongJi.get(pai.key) || 0;
        
        if (count === 0) return this.quanShiMiaoShun(tongJi);

        if (count >= 3) {
            const xinTongJi = new Map(tongJi);
            xinTongJi.set(pai.key, count - 3);
            if (this.quanShiMiaoShun(xinTongJi)) return true;
        }

        if (pai.dian <= 7) {
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

    jiSuanFanShu: function(shouPai, mingPaiQu, options = {}) {
        const fanXing = [];
        let baseFanShu = 1;
        let fanShu = 1;

        const huJieGuo = this.panDingHuPai(shouPai, options);
        if (!huJieGuo.keYiHu) {
            return { fanShu: 0, fanXing: [], zongFen: 0 };
        }

        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const huaSet = new Set(shouPai.map(p => p.hua));
        const mingPaiCount = mingPaiQu ? mingPaiQu.reduce((sum, g) => sum + g.paiZu.length, 0) : 0;

        if (huJieGuo.leiXing === 'qi_dui') {
            let hasLongQiDui = false;
            for (const [key, count] of tongJi) {
                if (count === 4) {
                    hasLongQiDui = true;
                    break;
                }
            }
            
            if (hasLongQiDui) {
                fanXing.push('龙七对');
                baseFanShu = 4;
            } else {
                fanXing.push('七对');
                baseFanShu = 2;
            }

            if (this.shiJiangDui(shouPai)) {
                fanXing.push('将对');
                baseFanShu = Math.max(baseFanShu, 4);
            }
        } else {
            fanXing.push('平胡');
            baseFanShu = 1;

            if (huaSet.size === 1) {
                fanXing.push('清一色');
                baseFanShu = 4;
            }

            if (mingPaiCount > 0 && shouPai.length === 2) {
                fanXing.push('金钩钓');
                baseFanShu = Math.max(baseFanShu, 2);
            }

            if (this.shiDaiYao(tongJi, mingPaiQu)) {
                fanXing.push('带幺');
                baseFanShu = Math.max(baseFanShu, 2);
            }

            if (this.shiJiangDui(shouPai)) {
                fanXing.push('将对');
                baseFanShu = Math.max(baseFanShu, 2);
            }
        }

        fanShu = baseFanShu;

        if (options.ziMo) {
            fanXing.push('自摸');
            fanShu *= 2;
        }

        if (options.gangShangKaiHua || options.gangShangHua) {
            fanXing.push('杠上花');
            fanShu *= 2;
        }

        if (options.gangShangPao) {
            fanXing.push('杠上炮');
            fanShu *= 2;
        }

        if (options.qiangGangHu) {
            fanXing.push('抢杠胡');
            fanShu *= 2;
        }

        if (options.tianHu) {
            fanXing.length = 0;
            fanXing.push('天胡');
            fanShu = 16;
        } else if (options.diHu) {
            fanXing.length = 0;
            fanXing.push('地胡');
            fanShu = 16;
        }

        const zongFen = this.diFen * fanShu;

        return { 
            fanShu, 
            fanXing, 
            zongFen,
            baseFanShu,
            diFen: this.diFen,
            mingXi: this.shengChengMingXi(fanXing, baseFanShu, fanShu)
        };
    },

    shiJiangDui: function(shouPai) {
        const jiangPai = [2, 5, 8];
        for (const pai of shouPai) {
            if (!jiangPai.includes(pai.dian)) return false;
        }
        return true;
    },

    shiDaiYao: function(tongJi, mingPaiQu) {
        for (const [key, count] of tongJi) {
            if (count > 0) {
                const [hua, dian] = key.split('_');
                if (dian !== '1' && dian !== '9') {
                    return false;
                }
            }
        }
        
        if (mingPaiQu && mingPaiQu.length > 0) {
            for (const group of mingPaiQu) {
                for (const pai of group.paiZu) {
                    if (pai.dian !== 1 && pai.dian !== 9) return false;
                }
            }
        }
        
        return true;
    },

    shengChengMingXi: function(fanXing, baseFanShu, zongFanShu) {
        return fanXing.map(fx => {
            const config = this.fanXingBiao[fx];
            return {
                mingCheng: fx,
                fanShu: config ? config.fanShu : 1,
                miaoShu: config ? config.miaoShu : ''
            };
        });
    },

    jiSuanJieSuan: function(huPaiZhe, shouPai, mingPaiQu, options = {}) {
        const fanJieGuo = this.jiSuanFanShu(shouPai, mingPaiQu, options);
        
        return {
            fenShu: fanJieGuo.zongFen,
            fanShu: fanJieGuo.fanShu,
            fanXing: fanJieGuo.fanXing,
            mingXi: fanJieGuo.mingXi,
            huPaiZhe,
            ziMo: options.ziMo || false,
            diFen: this.diFen,
            shengLi: true
        };
    },

    huoQuTingPai: function(shouPai) {
        const tingPaiList = [];
        if (shouPai.length !== 13) return tingPaiList;

        const huaList = [MahjongTiles.HUA_SE.WAN, MahjongTiles.HUA_SE.TIAO, MahjongTiles.HUA_SE.TONG];
        
        for (const hua of huaList) {
            if (this.queMen === hua) continue;
            
            for (let dian = 1; dian <= 9; dian++) {
                const testPai = { hua, dian, id: -1 };
                const testShouPai = [...shouPai, testPai];
                
                if (this.panDingHuPai(testShouPai).keYiHu) {
                    const shengYuShu = this.jiSuanTingPaiShengYu(shouPai, testPai);
                    tingPaiList.push({ 
                        ...testPai, 
                        shengYuShu,
                        fanShu: this.guJiFanShu(testShouPai)
                    });
                }
            }
        }

        return tingPaiList.sort((a, b) => b.shengYuShu - a.shengYuShu);
    },

    jiSuanTingPaiShengYu: function(shouPai, tingPai) {
        let count = 4;
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const key = `${tingPai.hua}_${tingPai.dian}`;
        const existing = tongJi.get(key) || 0;
        count -= existing;
        return Math.max(0, count);
    },

    guJiFanShu: function(shouPai) {
        const result = this.jiSuanFanShu(shouPai, []);
        return result.fanShu;
    },

    panDingPeng: function(shouPai, chuPai) {
        if (!chuPai) return { keYiPeng: false };
        
        if (this.queMen && chuPai.hua === this.queMen) {
            return { keYiPeng: false };
        }
        
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const key = MahjongTiles.huoQuPaiId(chuPai);
        const count = tongJi.get(key) || 0;
        
        if (count >= 2) {
            return { keYiPeng: true, pai: chuPai };
        }
        
        return { keYiPeng: false };
    },

    panDingGang: function(shouPai, chuPai, options = {}) {
        const gangList = [];
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        
        if (chuPai) {
            if (this.queMen && chuPai.hua === this.queMen) {
                return { keYiGang: false, gangList: [] };
            }
            
            const key = MahjongTiles.huoQuPaiId(chuPai);
            const count = tongJi.get(key) || 0;
            if (count >= 3) {
                gangList.push({ leiXing: 'ming_gang', pai: chuPai });
            }
        }
        
        if (options.baoKuoAnGang !== false) {
            for (const [key, count] of tongJi) {
                if (count >= 4) {
                    const [hua, dian] = key.split('_');
                    if (this.queMen && hua === this.queMen) continue;
                    gangList.push({ 
                        leiXing: 'an_gang', 
                        pai: { hua, dian: parseInt(dian) } 
                    });
                }
            }
        }
        
        return { keYiGang: gangList.length > 0, gangList };
    },

    panDingLiuJu: function(zhuangTai) {
        if (zhuangTai.shengYuPaiShu <= 0) {
            return { liuJu: true, yuan: '牌摸完' };
        }
        return { liuJu: false };
    },

    chaJiao: function(wanJiaZhuangTai) {
        const jieGuo = [];
        
        for (let i = 0; i < wanJiaZhuangTai.length; i++) {
            const zhuangTai = wanJiaZhuangTai[i];
            const tingPai = this.huoQuTingPai(zhuangTai.shouPai);
            
            jieGuo.push({
                wanJia: i,
                tingPai: tingPai.length > 0,
                tingPaiList: tingPai,
                chaJiaoFen: tingPai.length > 0 ? 0 : -this.diFen * 2
            });
        }
        
        return jieGuo;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuleSichuan;
}
