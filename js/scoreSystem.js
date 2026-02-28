/**
 * 积分结算系统
 * 
 * 积分计算公式：
 * 积分 = 基础分 × 番数倍数 + 杠分 + 奖励分 - 惩罚分
 * 
 * 杠分规则：
 * - 明杠：基础分 × 1，点杠者单独支付
 * - 暗杠：基础分 × 2，三家各支付
 * - 加杠：基础分 × 1，被抢杠胡时特殊处理
 */

const ScoreSystem = {
    
    guiZe: null,
    
    chuShiHua: function(guiZe) {
        this.guiZe = guiZe;
    },

    jiSuanHuPaiFen: function(huPaiZhe, shouPai, mingPaiQu, options) {
        if (!this.guiZe) {
            console.error('积分系统未初始化');
            return this.moRenJieGuo();
        }

        const jieSuan = this.guiZe.jiSuanJieSuan(huPaiZhe, shouPai, mingPaiQu, options);
        
        if (!jieSuan) {
            return this.moRenJieGuo();
        }

        const fenShu = this.jiSuanZongFen(jieSuan, options);
        
        return {
            ...jieSuan,
            zongFen: fenShu,
            chengYuan: this.shengChengChengYuan(jieSuan, options)
        };
    },

    jiSuanZongFen: function(jieSuan, options) {
        if (!jieSuan) return 0;
        
        let zongFen = jieSuan.fenShu || 0;
        
        if (options.zhuangJiaHu) {
            zongFen *= 2;
        }
        
        if (options.lianZhuangJiaCheng) {
            zongFen = Math.floor(zongFen * (1 + options.lianZhuangJiaCheng * 0.1));
        }
        
        return zongFen;
    },

    shengChengChengYuan: function(jieSuan, options) {
        const chengYuan = [];
        
        if (jieSuan.diFen) {
            chengYuan.push({ leiXing: '基础分', zhi: jieSuan.diFen });
        }
        
        if (jieSuan.fanXing && jieSuan.fanXing.length > 0) {
            chengYuan.push({ 
                leiXing: '番型', 
                zhi: jieSuan.fanXing.join(' + '),
                fanShu: jieSuan.fanShu
            });
        }
        
        if (jieSuan.ziMo) {
            chengYuan.push({ leiXing: '自摸', zhi: '×2' });
        }
        
        if (options.zhuangJiaHu) {
            chengYuan.push({ leiXing: '庄家胡', zhi: '×2' });
        }
        
        return chengYuan;
    },

    jiSuanGangFen: function(gangZhe, gangLeiXing, diFen) {
        const gangFenBiao = {
            'ming_gang': diFen * 1,
            'an_gang': diFen * 2,
            'jia_gang': diFen * 1
        };
        
        return {
            gangZhe,
            gangLeiXing,
            gangFen: gangFenBiao[gangLeiXing] || 0,
            miaoShu: this.huoQuGangMiaoShu(gangLeiXing)
        };
    },

    huoQuGangMiaoShu: function(gangLeiXing) {
        const miaoShuBiao = {
            'ming_gang': '明杠',
            'an_gang': '暗杠',
            'jia_gang': '加杠'
        };
        return miaoShuBiao[gangLeiXing] || '杠牌';
    },

    jiSuanLiuJuFen: function(wanJiaList, guiZe) {
        const jieGuo = [];
        
        for (let i = 0; i < wanJiaList.length; i++) {
            const wanJia = wanJiaList[i];
            let fenShu = 0;
            
            if (guiZe.chaJiao) {
                const chaJiaoJieGuo = guiZe.chaJiao(wanJiaList.map(w => ({ shouPai: w.shouPai })));
                const wanJiaChaJiao = chaJiaoJieGuo[i];
                
                if (!wanJiaChaJiao.tingPai) {
                    fenShu = wanJiaChaJiao.chaJiaoFen;
                }
            }
            
            jieGuo.push({
                wanJia: i,
                fenShu,
                liuJu: true
            });
        }
        
        return jieGuo;
    },

    jiSuanHuaZhuChengFa: function(wanJiaIndex, diFen) {
        return {
            wanJia: wanJiaIndex,
            chengFaFen: -diFen * 10,
            yuanYin: '花猪（手牌中有三种花色）'
        };
    },

    moRenJieGuo: function() {
        return {
            fenShu: 0,
            fanShu: 0,
            fanXing: [],
            mingXi: [],
            zongFen: 0,
            chengYuan: [],
            shengLi: false
        };
    },

    geShiHuaXianShi: function(jieSuan) {
        if (!jieSuan) return '';
        
        const lines = [];
        lines.push(`【胡牌结算】`);
        lines.push(``);
        
        if (jieSuan.fanXing && jieSuan.fanXing.length > 0) {
            lines.push(`番型：${jieSuan.fanXing.join('、')}`);
        }
        
        lines.push(`番数：${jieSuan.fanShu || 0}番`);
        lines.push(`底分：${jieSuan.diFen || 0}分`);
        lines.push(`得分：${jieSuan.zongFen || jieSuan.fenShu || 0}分`);
        
        if (jieSuan.chengYuan && jieSuan.chengYuan.length > 0) {
            lines.push(``);
            lines.push(`【得分明细】`);
            for (const item of jieSuan.chengYuan) {
                lines.push(`${item.leiXing}：${item.zhi}`);
            }
        }
        
        return lines.join('\n');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreSystem;
}
