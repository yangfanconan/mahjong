/**
 * 麻将牌定义模块
 * 定义所有麻将牌的类型、花色、点数
 * 支持不同规则的牌数配置
 */

const MahjongTiles = (function() {
    'use strict';

    /**
     * 花色类型常量
     */
    const HUA_SE = {
        WAN: 'wan',      // 万子
        TIAO: 'tiao',    // 条子/索子
        TONG: 'tong',    // 筒子/饼子
        FENG: 'feng',    // 风牌（东南西北）
        JIAN: 'jian',    // 箭牌（中发白）
        HUA: 'hua',      // 花牌（春夏秋冬梅兰竹菊）
        CHI: 'chi'       // 赤牌（红5）
    };

    /**
     * 牌面点数
     */
    const DIAN_SHU = {
        YI: 1, ER: 2, SAN: 3, SI: 4, WU: 5,
        LIU: 6, QI: 7, BA: 8, JIU: 9
    };

    /**
     * 风牌点数
     */
    const FENG_DIAN = {
        DONG: 1, NAN: 2, XI: 3, BEI: 4
    };

    /**
     * 箭牌点数
     */
    const JIAN_DIAN = {
        ZHONG: 1, FA: 2, BAI: 3
    };

    /**
     * 获取牌面显示文本
     */
    function huoQuPaiMian(pai) {
        if (!pai) return '';
        
        const { hua, dian } = pai;
        
        if (hua === HUA_SE.WAN) {
            return `${['一','二','三','四','五','六','七','八','九'][dian-1]}万`;
        }
        if (hua === HUA_SE.TIAO) {
            return `${['一','二','三','四','五','六','七','八','九'][dian-1]}条`;
        }
        if (hua === HUA_SE.TONG) {
            return `${['一','二','三','四','五','六','七','八','九'][dian-1]}筒`;
        }
        if (hua === HUA_SE.FENG) {
            return ['东','南','西','北'][dian-1];
        }
        if (hua === HUA_SE.JIAN) {
            return ['红中','发财','白板'][dian-1];
        }
        if (hua === HUA_SE.HUA) {
            return ['春','夏','秋','冬','梅','兰','竹','菊'][dian-1];
        }
        if (hua === HUA_SE.CHI) {
            return '赤5';
        }
        return '';
    }

    /**
     * 获取牌的Unicode图标
     */
    function huoQuUnicode(pai) {
        if (!pai) return '';
        
        const { hua, dian } = pai;
        
        if (hua === HUA_SE.WAN) {
            return String.fromCodePoint(0x1F007 + dian - 1);
        }
        if (hua === HUA_SE.TIAO) {
            return String.fromCodePoint(0x1F010 + dian - 1);
        }
        if (hua === HUA_SE.TONG) {
            return String.fromCodePoint(0x1F019 + dian - 1);
        }
        if (hua === HUA_SE.FENG) {
            return String.fromCodePoint(0x1F000 + dian - 1);
        }
        if (hua === HUA_SE.JIAN) {
            return String.fromCodePoint(0x1F004 + dian - 1);
        }
        if (hua === HUA_SE.HUA) {
            if (dian <= 4) {
                return String.fromCodePoint(0x1F022 + dian - 1);
            } else {
                return String.fromCodePoint(0x1F026 + dian - 5);
            }
        }
        
        return '';
    }

    /**
     * 获取牌的简写符号（用于UI显示）
     */
    function huoQuJianXie(pai) {
        if (!pai) return '';
        
        const { hua, dian } = pai;
        
        if (hua === HUA_SE.WAN) return `${dian}w`;
        if (hua === HUA_SE.TIAO) return `${dian}t`;
        if (hua === HUA_SE.TONG) return `${dian}p`;
        if (hua === HUA_SE.FENG) return ['d','n','x','b'][dian-1];
        if (hua === HUA_SE.JIAN) return ['z','f','b'][dian-1];
        if (hua === HUA_SE.HUA) return `h${dian}`;
        if (hua === HUA_SE.CHI) return 'c5';
        
        return '';
    }

    /**
     * 判断是否是数牌（万条筒）
     */
    function shiShuPai(pai) {
        return pai && (pai.hua === HUA_SE.WAN || 
                       pai.hua === HUA_SE.TIAO || 
                       pai.hua === HUA_SE.TONG);
    }

    /**
     * 判断是否是字牌（风牌+箭牌）
     */
    function shiZiPai(pai) {
        return pai && (pai.hua === HUA_SE.FENG || pai.hua === HUA_SE.JIAN);
    }

    /**
     * 判断是否是风牌
     */
    function shiFengPai(pai) {
        return pai && pai.hua === HUA_SE.FENG;
    }

    /**
     * 判断是否是箭牌
     */
    function shiJianPai(pai) {
        return pai && pai.hua === HUA_SE.JIAN;
    }

    /**
     * 判断是否是花牌
     */
    function shiHuaPai(pai) {
        return pai && pai.hua === HUA_SE.HUA;
    }

    /**
     * 判断两张牌是否相同
     */
    function paiXiangTong(pai1, pai2) {
        if (!pai1 || !pai2) return false;
        return pai1.hua === pai2.hua && pai1.dian === pai2.dian;
    }

    /**
     * 获取牌的唯一标识符
     */
    function huoQuPaiId(pai) {
        if (!pai) return '';
        return `${pai.hua}_${pai.dian}`;
    }

    /**
     * 创建标准136张牌组（不含花牌）
     */
    function chuangJian136PaiZu() {
        const paiZu = [];
        let id = 0;

        // 万条筒各4张
        for (let hua of [HUA_SE.WAN, HUA_SE.TIAO, HUA_SE.TONG]) {
            for (let dian = 1; dian <= 9; dian++) {
                for (let i = 0; i < 4; i++) {
                    paiZu.push({ hua, dian, id: id++ });
                }
            }
        }

        // 风牌各4张
        for (let dian = 1; dian <= 4; dian++) {
            for (let i = 0; i < 4; i++) {
                paiZu.push({ hua: HUA_SE.FENG, dian, id: id++ });
            }
        }

        // 箭牌各4张
        for (let dian = 1; dian <= 3; dian++) {
            for (let i = 0; i < 4; i++) {
                paiZu.push({ hua: HUA_SE.JIAN, dian, id: id++ });
            }
        }

        return paiZu;
    }

    /**
     * 创建108张牌组（四川麻将，不含字牌）
     */
    function chuangJian108PaiZu() {
        const paiZu = [];
        let id = 0;

        // 只有万条筒
        for (let hua of [HUA_SE.WAN, HUA_SE.TIAO, HUA_SE.TONG]) {
            for (let dian = 1; dian <= 9; dian++) {
                for (let i = 0; i < 4; i++) {
                    paiZu.push({ hua, dian, id: id++ });
                }
            }
        }

        return paiZu;
    }

    /**
     * 创建144张牌组（含花牌，日本麻将）
     */
    function chuangJian144PaiZu() {
        const paiZu = chuangJian136PaiZu();
        let id = paiZu.length;

        // 花牌各1张
        for (let dian = 1; dian <= 8; dian++) {
            paiZu.push({ hua: HUA_SE.HUA, dian, id: id++ });
        }

        return paiZu;
    }

    /**
     * 洗牌（优化版 - 增加好牌型概率）
     */
    function xiPai(paiZu) {
        const xiHao = [...paiZu];
        
        for (let round = 0; round < 3; round++) {
            for (let i = xiHao.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [xiHao[i], xiHao[j]] = [xiHao[j], xiHao[i]];
            }
        }
        
        const youHuaXiHao = [];
        const wenDing = 8;
        
        for (let i = 0; i < xiHao.length; i += wenDing) {
            const zu = xiHao.slice(i, Math.min(i + wenDing, xiHao.length));
            
            if (Math.random() < 0.4 && zu.length >= 3) {
                zu.sort((a, b) => {
                    if (a.hua !== b.hua) return a.hua.localeCompare(b.hua);
                    return a.dian - b.dian;
                });
            } else {
                for (let j = zu.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [zu[j], zu[k]] = [zu[k], zu[j]];
                }
            }
            
            youHuaXiHao.push(...zu);
        }
        
        for (let i = youHuaXiHao.length - 1; i > 0; i--) {
            if (Math.random() < 0.15) {
                const j = Math.floor(Math.random() * (i + 1));
                [youHuaXiHao[i], youHuaXiHao[j]] = [youHuaXiHao[j], youHuaXiHao[i]];
            }
        }
        
        return youHuaXiHao;
    }

    /**
     * 排序手牌（按花色和点数）
     */
    function paiXuShouPai(shouPai) {
        const huaShunXu = {
            [HUA_SE.WAN]: 1,
            [HUA_SE.TIAO]: 2,
            [HUA_SE.TONG]: 3,
            [HUA_SE.FENG]: 4,
            [HUA_SE.JIAN]: 5,
            [HUA_SE.HUA]: 6
        };

        return [...shouPai].sort((a, b) => {
            const huaBi = (huaShunXu[a.hua] || 99) - (huaShunXu[b.hua] || 99);
            if (huaBi !== 0) return huaBi;
            return a.dian - b.dian;
        });
    }

    /**
     * 统计手牌中各牌的数量
     */
    function tongJiPai(shouPai) {
        const tongJi = new Map();
        
        for (const pai of shouPai) {
            const key = huoQuPaiId(pai);
            tongJi.set(key, (tongJi.get(key) || 0) + 1);
        }
        
        return tongJi;
    }

    /**
     * 从手牌中移除指定牌
     */
    function yiChuPai(shouPai, muBiaoPai) {
        const idx = shouPai.findIndex(p => p.id === muBiaoPai.id);
        if (idx >= 0) {
            shouPai.splice(idx, 1);
            return true;
        }
        return false;
    }

    /**
     * 从手牌中查找指定花色和点数的牌
     */
    function chaZhaoPai(shouPai, hua, dian) {
        return shouPai.filter(p => p.hua === hua && p.dian === dian);
    }

    /**
     * 判断是否是字牌
     */
    function shiZiPai(pai) {
        return pai && (pai.hua === 'feng' || pai.hua === 'jian');
    }

    /**
     * 判断两张牌是否相同
     */
    function paiXiangTong(pai1, pai2) {
        if (!pai1 || !pai2) return false;
        return pai1.hua === pai2.hua && pai1.dian === pai2.dian;
    }

    return {
        HUA_SE,
        DIAN_SHU,
        FENG_DIAN,
        JIAN_DIAN,
        huoQuPaiMian,
        huoQuJianXie,
        huoQuUnicode,
        huoQuPaiId,
        shiShuPai,
        shiZiPai,
        shiFengPai,
        shiJianPai,
        shiHuaPai,
        paiXiangTong,
        chuangJian136PaiZu,
        chuangJian108PaiZu,
        chuangJian144PaiZu,
        xiPai,
        paiXuShouPai,
        tongJiPai,
        yiChuPai,
        chaZhaoPai
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MahjongTiles;
}
