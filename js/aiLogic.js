/**
 * 麻将AI出牌逻辑模块
 * 支持多种难度级别的AI策略
 * 适配不同麻将规则
 */

const AILogic = (function() {
    'use strict';

    let nanDu = 2; // 1=简单, 2=中等, 3=困难

    /**
     * 设置AI难度
     */
    function sheZhiNanDu(level) {
        nanDu = Math.max(1, Math.min(3, level));
    }

    /**
     * AI选择出牌
     * @param {Array} shouPai - 手牌
     * @param {Object} zhuangTai - 游戏状态
     * @param {Object} guiZe - 当前规则
     * @returns {Object} 出牌结果
     */
    function xuanZeChuPai(shouPai, zhuangTai, guiZe) {
        if (!shouPai || shouPai.length === 0) {
            return null;
        }

        // 根据难度选择策略
        switch (nanDu) {
            case 1:
                return jianDanCeLue(shouPai, zhuangTai, guiZe);
            case 2:
                return zhongDengCeLue(shouPai, zhuangTai, guiZe);
            case 3:
                return kunNanCeLue(shouPai, zhuangTai, guiZe);
            default:
                return jianDanCeLue(shouPai, zhuangTai, guiZe);
        }
    }

    /**
     * 简单策略：随机出牌
     */
    function jianDanCeLue(shouPai, zhuangTai, guiZe) {
        // 优先出孤张牌
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const guZhangList = [];
        const qiTaList = [];

        for (const pai of shouPai) {
            const key = MahjongTiles.huoQuPaiId(pai);
            const count = tongJi.get(key) || 0;
            if (count === 1) {
                guZhangList.push(pai);
            } else {
                qiTaList.push(pai);
            }
        }

        // 优先出孤张，且优先出字牌
        if (guZhangList.length > 0) {
            const ziPai = guZhangList.filter(p => MahjongTiles.shiZiPai(p));
            if (ziPai.length > 0) {
                return ziPai[Math.floor(Math.random() * ziPai.length)];
            }
            return guZhangList[Math.floor(Math.random() * guZhangList.length)];
        }

        // 随机出一张
        return shouPai[Math.floor(Math.random() * shouPai.length)];
    }

    /**
     * 中等策略：考虑听牌和防守
     */
    function zhongDengCeLue(shouPai, zhuangTai, guiZe) {
        const tongJi = MahjongTiles.tongJiPai(shouPai);
        
        // 检查是否听牌
        const tingPaiList = guiZe && guiZe.huoQuTingPai ? guiZe.huoQuTingPai(shouPai) : [];
        
        if (tingPaiList.length > 0) {
            // 已经听牌，检查手牌是否都在听牌范围内
            const chuPaiList = [];
            for (const pai of shouPai) {
                // 模拟出这张牌后是否还能听
                const xinShouPai = shouPai.filter(p => p.id !== pai.id);
                const xinTingPai = guiZe.huoQuTingPai(xinShouPai);
                if (xinTingPai.length > 0) {
                    chuPaiList.push({ pai, tingCount: xinTingPai.length });
                }
            }
            
            if (chuPaiList.length > 0) {
                // 选择听牌数最多的
                chuPaiList.sort((a, b) => b.tingCount - a.tingCount);
                return chuPaiList[0].pai;
            }
        }

        // 未听牌，评估每张牌的价值
        const pingGuList = [];
        for (const pai of shouPai) {
            const fenShu = pingGuPaiJiaZhi(pai, shouPai, tongJi, zhuangTai);
            pingGuList.push({ pai, fenShu });
        }

        // 按分数排序，出最低分的牌
        pingGuList.sort((a, b) => a.fenShu - b.fenShu);
        
        return pingGuList[0].pai;
    }

    /**
     * 困难策略：深度分析
     */
    function kunNanCeLue(shouPai, zhuangTai, guiZe) {
        // 先用中等策略的基础
        const zhongDengJieGuo = zhongDengCeLue(shouPai, zhuangTai, guiZe);
        
        // 额外考虑：防守分析
        const fangShouFenXi = fenXiFangShou(zhuangTai);
        
        // 如果有危险牌，优先出安全牌
        if (fangShouFangShou.weiXianPai.length > 0) {
            const anQuanPai = zhaoAnQuanPai(shouPai, fangShouFenXi.weiXianPai);
            if (anQuanPai) {
                return anQuanPai;
            }
        }

        return zhongDengJieGuo;
    }

    /**
     * 评估牌的价值
     */
    function pingGuPaiJiaZhi(pai, shouPai, tongJi, zhuangTai) {
        let fenShu = 0;
        const key = MahjongTiles.huoQuPaiId(pai);
        const count = tongJi.get(key) || 0;

        // 对子/刻子加成
        if (count >= 2) fenShu += 20;
        if (count >= 3) fenShu += 30;
        if (count >= 4) fenShu += 40;

        // 数牌的顺子潜力
        if (MahjongTiles.shiShuPai(pai)) {
            const { hua, dian } = pai;
            
            // 检查相邻牌
            const prev1 = tongJi.get(`${hua}_${dian - 1}`) || 0;
            const prev2 = tongJi.get(`${hua}_${dian - 2}`) || 0;
            const next1 = tongJi.get(`${hua}_${dian + 1}`) || 0;
            const next2 = tongJi.get(`${hua}_${dian + 2}`) || 0;

            // 两面
            if (prev1 > 0 && next1 > 0) fenShu += 25;
            // 边张
            else if (prev1 > 0 || next1 > 0) fenShu += 15;
            
            // 嵌张
            if (prev1 > 0 && next1 === 0 && tongJi.get(`${hua}_${dian + 1}`) > 0) {
                fenShu += 10;
            }
        }

        // 中张价值高于边张
        if (MahjongTiles.shiShuPai(pai) && pai.dian >= 4 && pai.dian <= 6) {
            fenShu += 10;
        }

        // 幺九牌价值较低
        if (MahjongTiles.shiShuPai(pai) && (pai.dian === 1 || pai.dian === 9)) {
            fenShu -= 5;
        }

        // 字牌价值较低（除非成对）
        if (MahjongTiles.shiZiPai(pai) && count < 2) {
            fenShu -= 10;
        }

        return fenShu;
    }

    /**
     * 分析防守情况
     */
    function fenXiFangShou(zhuangTai) {
        const weiXianPai = [];
        
        if (!zhuangTai || !zhuangTai.duiShou) {
            return { weiXianPai };
        }

        // 分析对手的出牌和碰杠情况
        for (const duiShou of zhuangTai.duiShou) {
            // 如果对手听牌，标记危险牌
            if (duiShou.tingPai) {
                // 根据对手打出的牌推断危险牌
                // 简化：标记同花色的相邻牌为危险
                for (const chuPai of duiShou.chuPaiList || []) {
                    if (MahjongTiles.shiShuPai(chuPai)) {
                        const { hua, dian } = chuPai;
                        if (dian > 1) weiXianPai.push({ hua, dian: dian - 1 });
                        if (dian < 9) weiXianPai.push({ hua, dian: dian + 1 });
                    }
                }
            }
        }

        return { weiXianPai };
    }

    /**
     * 找安全牌
     */
    function zhaoAnQuanPai(shouPai, weiXianPai) {
        for (const pai of shouPai) {
            let shiWeiXian = false;
            for (const weiXian of weiXianPai) {
                if (MahjongTiles.paiXiangTong(pai, weiXian)) {
                    shiWeiXian = true;
                    break;
                }
            }
            if (!shiWeiXian) {
                return pai;
            }
        }
        return null;
    }

    /**
     * AI决定是否碰牌
     */
    function jueDingPeng(shouPai, chuPai, zhuangTai, guiZe) {
        if (!guiZe || !guiZe.zhiChipeng) return false;

        const tongJi = MahjongTiles.tongJiPai(shouPai);
        const key = MahjongTiles.huoQuPaiId(chuPai);
        const count = tongJi.get(key) || 0;

        if (count < 2) return false;

        // 简单难度：有对就碰
        if (nanDu === 1) return true;

        // 中等难度：考虑碰后是否更接近胡牌
        if (nanDu === 2) {
            const xinShouPai = shouPai.filter(p => 
                !(p.hua === chuPai.hua && p.dian === chuPai.dian)
            ).slice(0, -2);
            xinShouPai.push(chuPai, chuPai);
            
            const oldTing = guiZe.huoQuTingPai ? guiZe.huoQuTingPai(shouPai).length : 0;
            const newTing = guiZe.huoQuTingPai ? guiZe.huoQuTingPai(xinShouPai).length : 0;
            
            return newTing >= oldTing;
        }

        // 困难难度：更复杂的判断
        if (nanDu === 3) {
            // 如果已经听牌，不碰
            const oldTing = guiZe.huoQuTingPai ? guiZe.huoQuTingPai(shouPou).length : 0;
            if (oldTing > 0) return false;

            // 如果是字牌对子，碰
            if (MahjongTiles.shiZiPai(chuPai)) return true;

            // 其他情况考虑
            return Math.random() > 0.3;
        }

        return false;
    }

    /**
     * AI决定是否杠牌
     */
    function jueDingGang(shouPai, gangXuanXiang, zhuangTai, guiZe) {
        if (!guiZe || !guiZe.zhiChiGang) return null;
        if (!gangXuanXiang || gangXuanXiang.length === 0) return null;

        // 简单难度：能杠就杠
        if (nanDu === 1) {
            return gangXuanXiang[0];
        }

        // 中等/困难难度：考虑杠后是否还能胡
        for (const gang of gangXuanXiang) {
            // 暗杠优先
            if (gang.leiXing === 'an_gang') {
                return gang;
            }
        }

        // 明杠需要谨慎
        if (nanDu >= 2) {
            const tingPaiList = guiZe.huoQuTingPai ? guiZe.huoQuTingPai(shouPai) : [];
            // 如果听牌了，杠可以增加番数
            if (tingPaiList.length > 0) {
                return gangXuanXiang.find(g => g.leiXing === 'ming_gang') || null;
            }
        }

        return gangXuanXiang[0];
    }

    /**
     * AI决定是否吃牌
     */
    function jueDingChi(shouPai, chiXuanXiang, zhuangTai, guiZe) {
        if (!guiZe || !guiZe.zhiChiChi) return null;
        if (!chiXuanXiang || chiXuanXiang.length === 0) return null;

        // 简单难度：随机吃
        if (nanDu === 1) {
            return chiXuanXiang[Math.floor(Math.random() * chiXuanXiang.length)];
        }

        // 中等难度：选择最优吃法
        let zuiYouChi = null;
        let zuiGaoFen = -Infinity;

        for (const chi of chiXuanXiang) {
            const fenShu = pingGuChiJiaZhi(chi, shouPai, guiZe);
            if (fenShu > zuiGaoFen) {
                zuiGaoFen = fenShu;
                zuiYouChi = chi;
            }
        }

        // 困难难度：考虑是否破坏门清
        if (nanDu === 3) {
            // 如果接近听牌，不吃
            const tingPaiList = guiZe.huoQuTingPai ? guiZe.huoQuTingPai(shouPai) : [];
            if (tingPaiList.length > 0) {
                return null;
            }
        }

        return zuiYouChi;
    }

    /**
     * 评估吃牌价值
     */
    function pingGuChiJiaZhi(chi, shouPai, guiZe) {
        let fenShu = 0;

        // 中吃价值最高（两面听）
        if (chi.leiXing === 'chi_zhong') {
            fenShu += 20;
        }
        // 边吃价值较低
        else {
            fenShu += 10;
        }

        // 如果吃后接近胡牌，加分
        const xinShouPai = [...shouPai];
        for (const p of chi.pai) {
            const idx = xinShouPai.findIndex(sp => 
                sp.hua === p.hua && sp.dian === p.dian && sp.id !== p.id
            );
            if (idx >= 0) {
                xinShouPai.splice(idx, 1);
            }
        }

        const tingPaiList = guiZe.huoQuTingPai ? guiZe.huoQuTingPai(xinShouPai) : [];
        fenShu += tingPaiList.length * 15;

        return fenShu;
    }

    /**
     * AI选择缺门（四川麻将）
     */
    function xuanZeQueMen(shouPai) {
        const tongJi = {
            wan: 0,
            tiao: 0,
            tong: 0
        };

        for (const pai of shouPai) {
            if (pai.hua === MahjongTiles.HUA_SE.WAN) tongJi.wan++;
            else if (pai.hua === MahjongTiles.HUA_SE.TIAO) tongJi.tiao++;
            else if (pai.hua === MahjongTiles.HUA_SE.TONG) tongJi.tong++;
        }

        // 选择数量最少的一门
        let minMen = 'wan';
        let minCount = tongJi.wan;

        if (tongJi.tiao < minCount) {
            minMen = 'tiao';
            minCount = tongJi.tiao;
        }
        if (tongJi.tong < minCount) {
            minMen = 'tong';
        }

        return minMen;
    }

    return {
        sheZhiNanDu,
        xuanZeChuPai,
        jueDingPeng,
        jueDingGang,
        jueDingChi,
        xuanZeQueMen
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AILogic;
}
