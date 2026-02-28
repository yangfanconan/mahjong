/**
 * 麻将规则编辑器核心模块
 * 提供可视化规则编辑、保存、加载、测试功能
 * 支持全球各类麻将规则配置，重点覆盖东北特色麻将
 */

const RuleEditor = (function() {
    'use strict';

    let dangQianGuiZe = null;
    let guiZeLieBiao = [];
    let moBanKu = [];

    const STORAGE_KEY = 'mahjong_custom_rules';
    const MOBAN_KEY = 'mahjong_rule_templates';

    function chuShiHua() {
        jiaZaiGuiZe();
        jiaZaiMoBan();
    }

    function jiaZaiGuiZe() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                guiZeLieBiao = JSON.parse(stored);
            }
        } catch (e) {
            console.error('加载规则失败:', e);
            guiZeLieBiao = [];
        }
    }

    function baoCunGuiZe() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(guiZeLieBiao));
            return true;
        } catch (e) {
            console.error('保存规则失败:', e);
            return false;
        }
    }

    function jiaZaiMoBan() {
        moBanKu = RuleMoBan.huoQuSuoYouMoBan();
    }

    function huoQuMoBanKu() {
        return moBanKu;
    }

    function huoQuSuoYouGuiZe() {
        return guiZeLieBiao;
    }

    function chuangJianXinGuiZe(moBanId = null) {
        let guiZe;
        
        if (moBanId) {
            const moBan = moBanKu.find(m => m.id === moBanId);
            if (moBan) {
                guiZe = JSON.parse(JSON.stringify(moBan.guiZe));
                guiZe.id = 'custom_' + Date.now();
                guiZe.mingCheng = moBan.mingCheng + ' (自定义)';
                guiZe.fenLei = 'custom';
            }
        }
        
        if (!guiZe) {
            guiZe = RuleSchema.chuangJianDefaultRule();
            guiZe.id = 'custom_' + Date.now();
            guiZe.mingCheng = '新规则';
            guiZe.fenLei = 'custom';
        }
        
        dangQianGuiZe = guiZe;
        return guiZe;
    }

    function huoQuDangQianGuiZe() {
        return dangQianGuiZe;
    }

    function sheZhiDangQianGuiZe(guiZe) {
        dangQianGuiZe = guiZe;
    }

    function baoCunDangQianGuiZe() {
        if (!dangQianGuiZe) {
            return { success: false, message: '没有当前规则' };
        }

        const yanZheng = RuleSchema.validateRule(dangQianGuiZe);
        if (!yanZheng.valid) {
            return { success: false, message: '规则验证失败：' + yanZheng.errors.join(', ') };
        }

        const existingIndex = guiZeLieBiao.findIndex(g => g.id === dangQianGuiZe.id);
        
        if (existingIndex >= 0) {
            guiZeLieBiao[existingIndex] = dangQianGuiZe;
        } else {
            guiZeLieBiao.push(dangQianGuiZe);
        }

        baoCunGuiZe();
        return { success: true, message: '保存成功' };
    }

    function shanChuGuiZe(guiZeId) {
        const index = guiZeLieBiao.findIndex(g => g.id === guiZeId);
        if (index >= 0) {
            guiZeLieBiao.splice(index, 1);
            baoCunGuiZe();
            return true;
        }
        return false;
    }

    function fuZhiGuiZe(guiZeId) {
        const yuanGuiZe = guiZeLieBiao.find(g => g.id === guiZeId);
        if (!yuanGuiZe) return null;
        
        const xinGuiZe = JSON.parse(JSON.stringify(yuanGuiZe));
        xinGuiZe.id = 'custom_' + Date.now();
        xinGuiZe.mingCheng = yuanGuiZe.mingCheng + ' (复制)';
        
        guiZeLieBiao.push(xinGuiZe);
        baoCunGuiZe();
        
        return xinGuiZe;
    }

    function daoChuGuiZe(guiZeId) {
        const guiZe = guiZeLieBiao.find(g => g.id === guiZeId);
        if (!guiZe) return null;
        
        const daoChuShuJu = {
            version: RuleSchema.version,
            exportTime: new Date().toISOString(),
            rule: guiZe
        };
        
        return JSON.stringify(daoChuShuJu, null, 2);
    }

    function daoRuGuiZe(jsonStr) {
        try {
            const daoRuShuJu = JSON.parse(jsonStr);
            
            if (!daoRuShuJu.rule || !daoRuShuJu.rule.id) {
                return { success: false, message: '无效的规则文件格式' };
            }
            
            const xinGuiZe = daoRuShuJu.rule;
            xinGuiZe.id = 'custom_' + Date.now() + '_' + xinGuiZe.id;
            
            guiZeLieBiao.push(xinGuiZe);
            baoCunGuiZe();
            
            return { success: true, rule: xinGuiZe };
        } catch (e) {
            return { success: false, message: '解析失败：' + e.message };
        }
    }

    function yingYongGuiZe(guiZeId) {
        let guiZe;
        
        const ziDingYi = guiZeLieBiao.find(g => g.id === guiZeId);
        if (ziDingYi) {
            guiZe = ziDingYi;
        } else {
            const moBan = moBanKu.find(m => m.id === guiZeId);
            if (moBan) {
                guiZe = moBan.guiZe;
            }
        }
        
        if (!guiZe) {
            return { success: false, message: '规则不存在' };
        }
        
        if (typeof RuleEngine !== 'undefined') {
            RuleEngine.zhuCeGuiZe(guiZe);
            RuleEngine.qieHuanGuiZe(guiZe.id);
        }
        
        return { success: true, guiZe };
    }

    function huoQuGuiZeZhaiYao(guiZe) {
        return RuleSchema.generateSummary(guiZe);
    }

    function yanZhengGuiZe(guiZe) {
        return RuleSchema.validateRule(guiZe);
    }

    function tiShiChongTu() {
        if (!dangQianGuiZe) return [];
        
        const tiShi = [];
        const guiZe = dangQianGuiZe;
        
        if (!guiZe.dongZuoGuiZe.chi.yunXu && guiZe.dongZuoGuiZe.chi.jinJiaChi) {
            tiShi.push({
                leiXing: 'error',
                neiRong: '禁吃牌和必须吃夹牌矛盾',
                jianYi: '请禁用其中一个选项'
            });
        }
        
        if (guiZe.huPaiTiaoJian.menQing.xuYao && guiZe.dongZuoGuiZe.chi.yunXu) {
            tiShi.push({
                leiXing: 'warning',
                neiRong: '要求门清但允许吃牌',
                jianYi: '门清状态下无法吃牌，请确认规则意图'
            });
        }
        
        if (guiZe.jiFenGuiZe.fengDing.qiYong && guiZe.jiFenGuiZe.fengDing.zuiDaFen < 10) {
            tiShi.push({
                leiXing: 'warning',
                neiRong: '封顶分数设置过低',
                jianYi: '建议封顶分数不低于 10 分'
            });
        }
        
        if (guiZe.dongBeiTeShu.baoPai.qiYong && guiZe.paiChi.laizi.qiYong) {
            tiShi.push({
                leiXing: 'info',
                neiRong: '同时启用宝牌和赖子',
                jianYi: '两者都是百搭牌机制，可能导致规则复杂'
            });
        }
        
        return tiShi;
    }

    return {
        chuShiHua,
        huoQuMoBanKu,
        huoQuSuoYouGuiZe,
        chuangJianXinGuiZe,
        huoQuDangQianGuiZe,
        sheZhiDangQianGuiZe,
        baoCunDangQianGuiZe,
        shanChuGuiZe,
        fuZhiGuiZe,
        daoChuGuiZe,
        daoRuGuiZe,
        yingYongGuiZe,
        huoQuGuiZeZhaiYao,
        yanZhengGuiZe,
        tiShiChongTu
    };
})();

/**
 * 规则模板库
 * 包含主流麻将和东北特色麻将模板
 */
const RuleMoBan = {
    huoQuSuoYouMoBan: function() {
        return [
            this.moBanSiChuan(),
            this.moBanGuangDong(),
            this.moBanRiBen(),
            this.moBanGuoBiao(),
            this.moBanQiQiHaEr(),
            this.moBanJiLin(),
            this.moBanHaErBin(),
            this.moBanShenYang(),
            this.moBanHuLuDao(),
            this.moBanChangSha(),
            this.moBanWuHan()
        ];
    },

    moBanSiChuan: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_sichuan';
        guiZe.mingCheng = '四川麻将 (血战到底)';
        guiZe.miaoShu = '血战到底，缺一门，108 张牌';
        guiZe.fenLei = 'mainstream';
        
        guiZe.paiChi.zongPaiShu = 108;
        guiZe.paiChi.paiZhongLei.feng.shiYong = false;
        guiZe.paiChi.paiZhongLei.jian.shiYong = false;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.dongZuoGuiZe.chi.yunXu = false;
        
        guiZe.huPaiTiaoJian.queMen.xuYao = true;
        guiZe.huPaiTiaoJian.queMen.menShu = 1;
        
        guiZe.duiJuGuiZe.liuJuGuiZe.chaJiao = true;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'longQiDui', 'qingYiSe', 'jinGouDiao', 'jiangDui', 'daiYao'];
        
        guiZe.duiJuGuiZe.liuJuGuiZe.xueZhanDaoDi = true;
        
        return { id: 'template_sichuan', mingCheng: '四川麻将', fenLei: 'mainstream', guiZe };
    },

    moBanGuangDong: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_guangdong';
        guiZe.mingCheng = '广东麻将 (推倒胡)';
        guiZe.miaoShu = '推倒胡，可吃碰杠，136 张牌';
        guiZe.fenLei = 'mainstream';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.dongZuoGuiZe.chi.yunXu = true;
        guiZe.dongZuoGuiZe.chi.tiaoJian = 'any';
        
        guiZe.dongZuoGuiZe.gang.gangShangKaiHua = true;
        
        guiZe.huPaiTiaoJian.menQing.xuYao = false;
        guiZe.huPaiTiaoJian.queMen.xuYao = false;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'qingYiSe', 'hunYiSe', 'pengPengHu', 'shiSanYao'];
        
        return { id: 'template_guangdong', mingCheng: '广东麻将', fenLei: 'mainstream', guiZe };
    },

    moBanRiBen: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_japan';
        guiZe.mingCheng = '日本麻将 (立直麻将)';
        guiZe.miaoShu = '立直、宝牌、振听，136 张牌';
        guiZe.fenLei = 'mainstream';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.dongZuoGuiZe.chi.yunXu = false;
        
        guiZe.dongZuoGuiZe.tingPai.yunXu = true;
        guiZe.dongZuoGuiZe.tingPai.liZhi = true;
        
        guiZe.dongZuoGuiZe.gang.gangShangKaiHua = true;
        
        guiZe.huPaiTiaoJian.menQing.xuYao = false;
        guiZe.huPaiTiaoJian.fanShuMenKan = 1;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'qingYiSe', 'hunYiSe', 'shiSanYao'];
        
        guiZe.dongBeiTeShu.baoPai.qiYong = true;
        guiZe.dongBeiTeShu.baoPai.chanShengFangShi = 'moPaiQian';
        
        return { id: 'template_japan', mingCheng: '日本麻将', fenLei: 'mainstream', guiZe };
    },

    moBanGuoBiao: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_international';
        guiZe.mingCheng = '国际麻将 (国标)';
        guiZe.miaoShu = '81 番型，8 番起胡，144 张牌';
        guiZe.fenLei = 'mainstream';
        
        guiZe.paiChi.zongPaiShu = 144;
        guiZe.paiChi.paiZhongLei.hua.shiYong = true;
        
        guiZe.dongZuoGuiZe.chi.yunXu = true;
        
        guiZe.huPaiTiaoJian.fanShuMenKan = 8;
        
        guiZe.fanXing = RuleSchema.fanXingKu.map(f => f.id);
        
        return { id: 'template_international', mingCheng: '国际麻将', fenLei: 'mainstream', guiZe };
    },

    moBanQiQiHaEr: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_qiqihaer';
        guiZe.mingCheng = '齐齐哈尔麻将';
        guiZe.miaoShu = '红中百搭，闭门翻倍，禁吃';
        guiZe.fenLei = 'dongbei';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.dongZuoGuiZe.chi.yunXu = false;
        
        guiZe.paiChi.laizi.qiYong = true;
        guiZe.paiChi.laizi.laiziPai = [{ hua: 'jian', dian: 1 }];
        
        guiZe.dongBeiTeShu.biMen.qiYong = true;
        guiZe.dongBeiTeShu.biMen.biMenFanBei = 2;
        guiZe.dongBeiTeShu.biMen.kaiMenFanBei = 1;
        
        guiZe.dongBeiTeShu.douPai.qiYong = true;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'pengPengHu', 'qingYiSe', 'biMenHu'];
        
        return { id: 'template_qiqihaer', mingCheng: '齐齐哈尔麻将', fenLei: 'dongbei', guiZe };
    },

    moBanJiLin: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_jilin';
        guiZe.mingCheng = '吉林麻将';
        guiZe.miaoShu = '夹胡才能吃，宝牌百搭';
        guiZe.fenLei = 'dongbei';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.dongZuoGuiZe.chi.yunXu = true;
        guiZe.dongZuoGuiZe.chi.tiaoJian = 'jia';
        guiZe.dongZuoGuiZe.chi.jinBianChi = true;
        
        guiZe.dongBeiTeShu.baoPai.qiYong = true;
        guiZe.dongBeiTeShu.baoPai.baoPaiZuoYong = 'baiDa';
        
        guiZe.dongBeiTeShu.biMen.qiYong = true;
        
        guiZe.fanXing = ['pingHu', 'jiaHu', 'qiDui', 'qingYiSe', 'biMenHu'];
        
        return { id: 'template_jilin', mingCheng: '吉林麻将', fenLei: 'dongbei', guiZe };
    },

    moBanHaErBin: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_haerbin';
        guiZe.mingCheng = '哈尔滨麻将';
        guiZe.miaoShu = '宝牌翻倍，可吃碰杠';
        guiZe.fenLei = 'dongbei';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.dongZuoGuiZe.chi.yunXu = true;
        
        guiZe.dongBeiTeShu.baoPai.qiYong = true;
        guiZe.dongBeiTeShu.baoPai.chanShengFangShi = 'moPaiHou';
        guiZe.dongBeiTeShu.baoPai.baoPaiShuLiang = 1;
        
        guiZe.dongBeiTeShu.douPai.qiYong = true;
        guiZe.dongBeiTeShu.douPai.zuiDaDouShu = 8;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'qingYiSe', 'baoPaiFan'];
        
        return { id: 'template_haerbin', mingCheng: '哈尔滨麻将', fenLei: 'dongbei', guiZe };
    },

    moBanShenYang: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_shenyang';
        guiZe.mingCheng = '沈阳麻将';
        guiZe.miaoShu = '庄家翻倍，杠开加分';
        guiZe.fenLei = 'dongbei';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.duiJuGuiZe.zhuangJiaGuiZe.zhuangJiaFanBei = true;
        
        guiZe.dongZuoGuiZe.gang.gangKaiJiaFen = 1;
        guiZe.dongZuoGuiZe.gang.gangHuaFanBei = 2;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'pengPengHu', 'qingYiSe', 'zhuangJiaFan'];
        
        return { id: 'template_shenyang', mingCheng: '沈阳麻将', fenLei: 'dongbei', guiZe };
    },

    moBanHuLuDao: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_huludao';
        guiZe.mingCheng = '葫芦岛麻将';
        guiZe.miaoShu = '一炮多响，宝中宝翻倍';
        guiZe.fenLei = 'dongbei';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.dongZuoGuiZe.chi.yunXu = true;
        guiZe.duiJuGuiZe.chuPaiGuiZe.chuPaiBiBao = true;
        
        guiZe.duiJuGuiZe.yiPaoDuoXiang = true;
        
        guiZe.dongBeiTeShu.baoPai.qiYong = true;
        guiZe.dongBeiTeShu.baoPai.baoZhongBao.qiYong = true;
        guiZe.dongBeiTeShu.baoPai.baoZhongBao.fanBei = 4;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'baoZhongBao', 'qingYiSe'];
        
        return { id: 'template_huludao', mingCheng: '葫芦岛麻将', fenLei: 'dongbei', guiZe };
    },

    moBanChangSha: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_changsha';
        guiZe.mingCheng = '长沙麻将';
        guiZe.miaoShu = '红中百搭，可吃碰杠';
        guiZe.fenLei = 'local';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.paiChi.laizi.qiYong = true;
        guiZe.paiChi.laizi.laiziPai = [{ hua: 'jian', dian: 1 }];
        
        guiZe.dongZuoGuiZe.chi.yunXu = true;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'qingYiSe', 'pengPengHu'];
        
        return { id: 'template_changsha', mingCheng: '长沙麻将', fenLei: 'local', guiZe };
    },

    moBanWuHan: function() {
        const guiZe = RuleSchema.chuangJianDefaultRule();
        guiZe.id = 'template_wuhan';
        guiZe.mingCheng = '武汉麻将';
        guiZe.miaoShu = '红中赖子杠，可吃碰杠';
        guiZe.fenLei = 'local';
        
        guiZe.paiChi.zongPaiShu = 136;
        guiZe.paiChi.paiZhongLei.hua.shiYong = false;
        
        guiZe.paiChi.laizi.qiYong = true;
        guiZe.paiChi.laizi.laiziPai = [{ hua: 'jian', dian: 1 }];
        guiZe.paiChi.laizi.laiziGuiZe.keGang = true;
        
        guiZe.dongZuoGuiZe.chi.yunXu = true;
        guiZe.dongZuoGuiZe.gang.yunXu = true;
        
        guiZe.fanXing = ['pingHu', 'qiDui', 'qingYiSe', 'pengPengHu'];
        
        return { id: 'template_wuhan', mingCheng: '武汉麻将', fenLei: 'local', guiZe };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RuleEditor, RuleMoBan };
}
