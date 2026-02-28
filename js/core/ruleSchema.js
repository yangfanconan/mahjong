/**
 * 麻将规则数据结构定义
 * 支持全球各类麻将规则的完整配置
 * 重点覆盖：国标、四川、广东、日本、台湾、长沙、武汉、东北特色麻将
 */

const RuleSchema = {
    version: '1.0.0',
    
    /**
     * 完整规则数据结构模板
     */
    chuangJianDefaultRule: function() {
        return {
            id: '',
            mingCheng: '',
            miaoShu: '',
            fenLei: 'custom',
            
            paiChi: {
                zongPaiShu: 136,
                paiZhongLei: {
                    wan: { shiYong: true, zhangShu: 4, dianShu: [1,2,3,4,5,6,7,8,9] },
                    tiao: { shiYong: true, zhangShu: 4, dianShu: [1,2,3,4,5,6,7,8,9] },
                    tong: { shiYong: true, zhangShu: 4, dianShu: [1,2,3,4,5,6,7,8,9] },
                    feng: { shiYong: true, zhangShu: 4, dianShu: [1,2,3,4] },
                    jian: { shiYong: true, zhangShu: 4, dianShu: [1,2,3] },
                    hua: { shiYong: false, zhangShu: 1, dianShu: [1,2,3,4,5,6,7,8] }
                },
                laizi: {
                    qiYong: false,
                    laiziPai: [],
                    laiziGuiZe: {
                        keChi: true,
                        kePeng: true,
                        keGang: true,
                        jiRuHuPai: true
                    }
                }
            },
            
            duiJuGuiZe: {
                zhuangJiaGuiZe: {
                    chanShengFangShi: 'zhizi',
                    zhuangJiaFanBei: false,
                    zhuangJiaTeQuan: [],
                    lianZhuang: true,
                    yingJiaZuoZhuang: false
                },
                moPaiGuiZe: {
                    moPaiShunXu: 'niShiZhen',
                    moPaiShuLiang: 13,
                },
                chuPaiGuiZe: {
                    chuPaiXianZhi: [],
                    jinZhiChuYaoJiu: false,
                    chuPaiBiBao: false
                },
                liuJuGuiZe: {
                    liuJuTiaoJian: 'paiMoWan',
                    paiQiangShengYu: 0,
                    huangZhuang: true,
                    chaBaoMen: false,
                    chaPai: false,
                    chaJiao: false,
                    liuJuJiFen: 'buBian'
                }
            },
            
            dongZuoGuiZe: {
                chi: {
                    yunXu: true,
                    tiaoJian: 'any',
                    jinZhiChi: false,
                    jinJiaChi: false,
                    jinBianChi: false
                },
                peng: {
                    yunXu: true,
                    qiangPeng: false,
                    pengPaiBiChu: true,
                    fanBei: 1
                },
                gang: {
                    yunXu: true,
                    leiXing: {
                        mingGang: true,
                        anGang: true,
                        jiaGang: true,
                        qiangGang: true
                    },
                    gangShangKaiHua: true,
                    gangShangPao: true,
                    gangKaiJiaFen: 0,
                    gangHuaFanBei: 2
                },
                tingPai: {
                    yunXu: true,
                    tiShi: true,
                    tingPaiJiangLi: 0,
                    tingPaiChengFa: 0,
                    biMenTingFanBei: 1
                },
                huPaiYouXianJi: {
                    qiangGangHu: 3,
                    gangShangPao: 2,
                    ziMo: 1,
                    dianPao: 0
                },
                jiaHu: true,
                yiPaoDuoXiang: false
            },
            
            huPaiTiaoJian: {
                jiBenXing: '4zu1jiang',
                xuYaoJiangPai: true,
                menQing: {
                    xuYao: false,
                    fanBei: 2
                },
                queMen: {
                    xuYao: false,
                    menShu: 1
                },
                teShuXing: {
                    qiDui: true,
                    shiSanYao: true,
                    pengPengHu: true,
                    qingYiSe: true,
                    hunYiSe: true
                },
                teShuHuPai: {
                    tianHu: { yunXu: true, fanShu: 16 },
                    diHu: { yunXu: true, fanShu: 16 },
                    renHu: { yunXu: true, fanShu: 8 },
                    guanGangHu: { yunXu: true, fanShu: 8 }
                },
                fanShuMenKan: 0
            },
            
            fanXing: [],
            
            jiFenGuiZe: {
                jiFenFangShi: 'fanShu',
                diFen: 1,
                fanShuJiSuan: 'chengFa',
                zhuangJiaJiFen: {
                    jiaCheng: 2,
                    ziMoQuanBu: false
                },
                ziMoJiFen: 'sanJiaGeFu',
                dianPaoJiFen: 'danJiaFu',
                gangPaiJiFen: {
                    mingGang: 1,
                    anGang: 2,
                    shouFuFangShi: 'dianGangZheFu'
                },
                fengDing: {
                    qiYong: false,
                    zuiDaFen: 0,
                    fengDingFanXing: []
                }
            },
            
            dongBeiTeShu: {
                baoPai: {
                    qiYong: false,
                    chanShengFangShi: 'moPaiHou',
                    baoPaiShuLiang: 1,
                    baoPaiZuoYong: 'baiDa',
                    baoZhongBao: {
                        qiYong: false,
                        fanBei: 4
                    }
                },
                biMen: {
                    qiYong: false,
                    biMenFanBei: 2,
                    kaiMenFanBei: 1,
                    biMenLouHuBuPei: true
                },
                douPai: {
                    qiYong: false,
                    jiSuanFangShi: 'fanShu',
                    zuiDaDouShu: 8
                },
                louHu: {
                    qiYong: false,
                    louHuJinHuDangLun: true,
                    louHuJinHuBenLun: false
                },
                xiPai: {
                    qiYong: false,
                    xiPaiLeiXing: []
                }
            }
        };
    },

    /**
     * 预定义番型库
     */
    fanXingKu: [
        { id: 'pingHu', mingCheng: '平胡', fanShu: 1, miaoShu: '4 顺子 +1 将牌的基本胡牌' },
        { id: 'qiDui', mingCheng: '七对', fanShu: 2, miaoShu: '7 个对子' },
        { id: 'longQiDui', mingCheng: '龙七对', fanShu: 4, miaoShu: '七对中有 4 张相同的牌' },
        { id: 'pengPengHu', mingCheng: '碰碰胡', fanShu: 2, miaoShu: '全部是刻子' },
        { id: 'qingYiSe', mingCheng: '清一色', fanShu: 4, miaoShu: '只有一种花色' },
        { id: 'hunYiSe', mingCheng: '混一色', fanShu: 2, miaoShu: '一种花色 + 字牌' },
        { id: 'shiSanYao', mingCheng: '十三幺', fanShu: 16, miaoShu: '13 种幺九牌各一张 + 任意一张' },
        { id: 'jinGouDiao', mingCheng: '金钩钓', fanShu: 2, miaoShu: '碰/杠后单吊胡牌' },
        { id: 'jiangDui', mingCheng: '将对', fanShu: 2, miaoShu: '对子胡且全是 2/5/8' },
        { id: 'daiYao', mingCheng: '带幺', fanShu: 2, miaoShu: '每组都有 1 或 9' },
        { id: 'qingYao', mingCheng: '清幺', fanShu: 4, miaoShu: '全部是 1 或 9' },
        { id: 'daYu', mingCheng: '大三元', fanShu: 8, miaoShu: '中发白三组刻子' },
        { id: 'xiaoSiXi', mingCheng: '小四喜', fanShu: 8, miaoShu: '东南西北三组刻子 + 一对' },
        { id: 'daSiXi', mingCheng: '大四喜', fanShu: 16, miaoShu: '东南西北四组刻子' },
        { id: 'ziYiSe', mingCheng: '字一色', fanShu: 16, miaoShu: '全部是字牌' },
        { id: 'jiuLianBaoDeng', mingCheng: '九莲宝灯', fanShu: 16, miaoShu: '同花色 1112345678999+ 任意一张' },
        { id: 'tianHu', mingCheng: '天胡', fanShu: 16, miaoShu: '庄家起手直接胡' },
        { id: 'diHu', mingCheng: '地胡', fanShu: 16, miaoShu: '闲家第一轮胡庄家牌' },
        { id: 'renHu', mingCheng: '人胡', fanShu: 8, miaoShu: '庄家第一次出牌被闲家胡' },
        { id: 'gangShangKaiHua', mingCheng: '杠上开花', fanShu: 2, miaoShu: '杠后摸牌胡', shiJiaFan: true },
        { id: 'gangShangPao', mingCheng: '杠上炮', fanShu: 2, miaoShu: '杠后出牌被胡', shiJiaFan: true },
        { id: 'qiangGangHu', mingCheng: '抢杠胡', fanShu: 2, miaoShu: '抢别人的加杠胡', shiJiaFan: true },
        { id: 'haiDiLaoYue', mingCheng: '海底捞月', fanShu: 2, miaoShu: '最后一张牌自摸', shiJiaFan: true },
        { id: 'miaoShouHuiChun', mingCheng: '妙手回春', fanShu: 2, miaoShu: '最后一张牌点炮', shiJiaFan: true },
        
        // 东北专属番型
        { id: 'biMenHu', mingCheng: '闭门胡', fanShu: 2, miaoShu: '全程不吃不碰不杠' },
        { id: 'kaiMenHu', mingCheng: '开门胡', fanShu: 1, miaoShu: '有吃碰杠' },
        { id: 'baoPaiFan', mingCheng: '宝牌番', fanShu: 1, miaoShu: '有宝牌' },
        { id: 'piaoHu', mingCheng: '飘胡', fanShu: 4, miaoShu: '全求人' },
        { id: 'jiaHu', mingCheng: '夹胡', fanShu: 2, miaoShu: '卡张胡牌' },
        { id: 'baoZhongBao', mingCheng: '宝中宝', fanShu: 8, miaoShu: '胡的牌正好是宝牌' },
        { id: 'zhuangJiaFan', mingCheng: '庄家番', fanShu: 1, miaoShu: '庄家胡牌' },
        { id: 'ziMoFan', mingCheng: '自摸番', fanShu: 1, miaoShu: '自摸胡牌' },
        { id: 'liangDou', mingCheng: '亮豆', fanShu: 1, miaoShu: '亮出宝牌' }
    ],

    /**
     * 验证规则配置
     */
    validateRule: function(rule) {
        const errors = [];
        const warnings = [];

        if (!rule.id || rule.id.trim() === '') {
            errors.push('规则 ID 不能为空');
        }

        if (!rule.mingCheng || rule.mingCheng.trim() === '') {
            errors.push('规则名称不能为空');
        }

        if (rule.paiChi.zongPaiShu < 108 || rule.paiChi.zongPaiShu > 144) {
            warnings.push('牌数不在常规范围内 (108-144)');
        }

        if (!rule.duiJuGuiZe.chi.yunXu && rule.duiJuGuiZe.chi.jinJiaChi) {
            errors.push('禁吃牌和必须吃夹牌不能同时配置');
        }

        if (rule.jiFenGuiZe.fengDing.qiYong && rule.jiFenGuiZe.fengDing.zuiDaFen <= 0) {
            errors.push('启用封顶但封顶分数未设置');
        }

        return { valid: errors.length === 0, errors, warnings };
    },

    /**
     * 生成规则摘要
     */
    generateSummary: function(rule) {
        const summary = [];
        
        summary.push(`${rule.mingCheng} (${rule.paiChi.zongPaiShu}张)`);
        
        if (rule.duiJuGuiZe.chi.yunXu) {
            summary.push('可吃牌');
        } else {
            summary.push('禁吃');
        }
        
        if (rule.duiJuGuiZe.gang.yunXu) {
            summary.push('可杠');
        }
        
        if (rule.huPaiTiaoJian.menQing.xuYao) {
            summary.push('需门清');
        }
        
        if (rule.dongBeiTeShu.baoPai.qiYong) {
            summary.push('宝牌');
        }
        
        if (rule.dongBeiTeShu.biMen.qiYong) {
            summary.push(`闭门 x${rule.dongBeiTeShu.biMen.biMenFanBei}`);
        }
        
        return summary.join(' | ');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuleSchema;
}
