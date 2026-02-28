/**
 * 规则编辑器 UI 控制器
 * 处理编辑器的交互逻辑
 */

const RuleEditorUI = (function() {
    'use strict';

    let modal = null;
    let currentFilter = 'all';

    function chuShiHua() {
        RuleEditor.chuShiHua();
        bangDingShiJian();
        jiaZaiMoBanLieBiao();
        jiaZaiFanXingLieBiao();
    }

    function bangDingShiJian() {
        document.getElementById('rule-editor-close-btn').addEventListener('click', guanBi);
        document.getElementById('rule-new-btn').addEventListener('click', chuangJianXinGuiZe);
        document.getElementById('rule-import-btn').addEventListener('click', function() {
            document.getElementById('rule-import-file').click();
        });
        document.getElementById('rule-import-file').addEventListener('change', daoRuGuiZe);
        document.getElementById('rule-save-btn').addEventListener('click', baoCunGuiZe);
        document.getElementById('rule-apply-btn').addEventListener('click', yingYongGuiZe);
        document.getElementById('rule-export-btn').addEventListener('click', daoChuGuiZe);
        document.getElementById('rule-copy-btn').addEventListener('click', fuZhiGuiZe);
        document.getElementById('rule-delete-btn').addEventListener('click', shanChuGuiZe);
        document.getElementById('rule-validate-btn').addEventListener('click', yanZhengGuiZe);
        document.getElementById('rule-test-btn').addEventListener('click', kuaiSuCeShi);

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.category;
                jiaZaiMoBanLieBiao();
            });
        });

        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.editor-tab-panel').forEach(p => p.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById('tab-' + this.dataset.tab).classList.add('active');
            });
        });

        bangDingBiaoDanLianDong();
    }

    function bangDingBiaoDanLianDong() {
        document.getElementById('total-tiles').addEventListener('change', function() {
            const val = parseInt(this.value);
            document.getElementById('tile-wan').checked = true;
            document.getElementById('tile-tiao').checked = true;
            document.getElementById('tile-tong').checked = true;
            
            if (val >= 136) {
                document.getElementById('tile-feng').checked = true;
                document.getElementById('tile-jian').checked = true;
            }
            if (val >= 144) {
                document.getElementById('tile-hua').checked = true;
            }
        });

        document.getElementById('laizi-enable').addEventListener('change', function() {
            document.getElementById('laizi-config').style.display = this.checked ? 'block' : 'none';
        });

        document.getElementById('chi-enable').addEventListener('change', function() {
            document.getElementById('chi-condition-group').style.opacity = this.checked ? '1' : '0.5';
            document.getElementById('chi-condition').disabled = !this.checked;
        });

        document.getElementById('score-fengding-enable').addEventListener('change', function() {
            const group = document.getElementById('score-fengding-group');
            group.style.opacity = this.checked ? '1' : '0.5';
            document.getElementById('score-fengding-value').disabled = !this.checked;
        });

        document.getElementById('dongbei-baopai-enable').addEventListener('change', function() {
            document.getElementById('baopai-config').style.display = this.checked ? 'block' : 'none';
            document.getElementById('baopai-config2').style.display = this.checked ? 'block' : 'none';
            document.getElementById('baopai-config3').style.display = this.checked ? 'block' : 'none';
        });

        document.getElementById('dongbei-bimen-enable').addEventListener('change', function() {
            document.getElementById('bimen-config').style.display = this.checked ? 'block' : 'none';
            document.getElementById('bimen-config2').style.display = this.checked ? 'block' : 'none';
        });

        document.getElementById('dongbei-doupai-enable').addEventListener('change', function() {
            document.getElementById('doupai-config').style.display = this.checked ? 'block' : 'none';
        });

        document.getElementById('dongbei-louhu-enable').addEventListener('change', function() {
            document.getElementById('louhu-config').style.display = this.checked ? 'block' : 'none';
        });
    }

    function jiaZaiMoBanLieBiao() {
        const container = document.getElementById('rule-template-list');
        if (!container) { console.log('容器不存在，跳过加载'); return; }
        const moBanKu = RuleEditor.huoQuMoBanKu();
        const ziDingYi = RuleEditor.huoQuSuoYouGuiZe();

        let html = '';

        moBanKu.forEach(moBan => {
            if (currentFilter !== 'all' && moBan.fenLei !== currentFilter) {
                return;
            }
            html += `
                <div class="template-item" data-id="${moBan.id}" data-type="moban">
                    <div class="template-item-name">${moBan.mingCheng}</div>
                    <div class="template-item-desc">${moBan.guiZe.miaoShu || '点击加载'}</div>
                    <span class="template-item-category">${moBan.fenLei}</span>
                </div>
            `;
        });

        ziDingYi.forEach(guiZe => {
            if (currentFilter !== 'all' && currentFilter !== 'custom') {
                return;
            }
            html += `
                <div class="template-item" data-id="${guiZe.id}" data-type="zidingyi">
                    <div class="template-item-name">${guiZe.mingCheng}</div>
                    <div class="template-item-desc">${guiZe.miaoShu || '自定义规则'}</div>
                    <span class="template-item-category">custom</span>
                </div>
            `;
        });

        if (container) container.innerHTML = html;

        container?.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', function() {
                container?.querySelectorAll('.template-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                const id = this.dataset.id;
                const type = this.dataset.type;
                
                if (type === 'moban') {
                    const moBan = moBanKu.find(m => m.id === id);
                    if (moBan) {
                        jiaZaiGuiZeDaoBianJiQi(moBan.guiZe);
                    }
                } else {
                    const guiZe = ziDingYi.find(g => g.id === id);
                    if (guiZe) {
                        jiaZaiGuiZeDaoBianJiQi(guiZe);
                    }
                }
            });
        });
    }

    function jiaZaiFanXingLieBiao() {
        const container = document.getElementById('rule-template-list');
        if (!container) { console.log('容器不存在，跳过加载'); return; }
        const fanXingKu = RuleSchema.fanXingKu;
        
        let html = '';
        fanXingKu.forEach(fanXing => {
            const isDongBei = ['biMenHu', 'kaiMenHu', 'baoPaiFan', 'piaoHu', 'jiaHu', 'baoZhongBao', 'zhuangJiaFan', 'ziMoFan'].includes(fanXing.id);
            html += `
                <label class="fanxing-item ${isDongBei ? 'dongbei-fanxing' : ''}">
                    <input type="checkbox" value="${fanXing.id}">
                    <span class="fanxing-name">${fanXing.mingCheng}</span>
                    <span class="fanxing-fan">${fanXing.fanShu}番</span>
                </label>
            `;
        });
        
        if (container) container.innerHTML = html;
    }

    function jiaZaiGuiZeDaoBianJiQi(guiZe) {
        RuleEditor.sheZhiDangQianGuiZe(JSON.parse(JSON.stringify(guiZe)));

        document.getElementById('rule-name').value = guiZe.mingCheng || '';
        document.getElementById('rule-desc').value = guiZe.miaoShu || '';
        document.getElementById('rule-category').value = guiZe.fenLei || 'custom';

        document.getElementById('total-tiles').value = guiZe.paiChi.zongPaiShu;
        document.getElementById('tile-wan').checked = guiZe.paiChi.paiZhongLei.wan.shiYong;
        document.getElementById('tile-tiao').checked = guiZe.paiChi.paiZhongLei.tiao.shiYong;
        document.getElementById('tile-tong').checked = guiZe.paiChi.paiZhongLei.tong.shiYong;
        document.getElementById('tile-feng').checked = guiZe.paiChi.paiZhongLei.feng.shiYong;
        document.getElementById('tile-jian').checked = guiZe.paiChi.paiZhongLei.jian.shiYong;
        document.getElementById('tile-hua').checked = guiZe.paiChi.paiZhongLei.hua.shiYong;

        document.getElementById('laizi-enable').checked = guiZe.paiChi.laizi.qiYong;
        document.getElementById('laizi-config').style.display = guiZe.paiChi.laizi.qiYong ? 'block' : 'none';

        document.getElementById('zhuangjia-method').value = guiZe.duiJuGuiZe.zhuangJiaGuiZe.chanShengFangShi;
        document.getElementById('zhuangjia-fanbei').checked = guiZe.duiJuGuiZe.zhuangJiaGuiZe.zhuangJiaFanBei;
        document.getElementById('lianzhuang').checked = guiZe.duiJuGuiZe.zhuangJiaGuiZe.lianZhuang;

        document.getElementById('liuju-condition').value = guiZe.duiJuGuiZe.liuJuGuiZe.liuJuTiaoJian;
        document.getElementById('chajiao').checked = guiZe.duiJuGuiZe.liuJuGuiZe.chaJiao;
        document.getElementById('chabaomen').checked = guiZe.duiJuGuiZe.liuJuGuiZe.chaBaoMen;

        document.getElementById('chi-enable').checked = guiZe.duiJuGuiZe.chi.yunXu;
        document.getElementById('chi-condition').value = guiZe.duiJuGuiZe.chi.tiaoJian;
        document.getElementById('chi-condition').disabled = !guiZe.duiJuGuiZe.chi.yunXu;

        document.getElementById('peng-enable').checked = guiZe.duiJuGuiZe.peng.yunXu;
        document.getElementById('peng-fanbei').value = guiZe.duiJuGuiZe.peng.fanBei;

        document.getElementById('gang-enable').checked = guiZe.duiJuGuiZe.gang.yunXu;
        document.getElementById('gang-ming').checked = guiZe.duiJuGuiZe.gang.leiXing.mingGang;
        document.getElementById('gang-an').checked = guiZe.duiJuGuiZe.gang.leiXing.anGang;
        document.getElementById('gang-jia').checked = guiZe.duiJuGuiZe.gang.leiXing.jiaGang;
        document.getElementById('gang-qiang').checked = guiZe.duiJuGuiZe.gang.leiXing.qiangGang;
        document.getElementById('gang-shang-kaihua').checked = guiZe.duiJuGuiZe.gang.gangShangKaiHua;
        document.getElementById('gang-shang-pao').checked = guiZe.duiJuGuiZe.gang.gangShangPao;

        document.getElementById('hu-qianggang').checked = guiZe.duiJuGuiZe.huPaiYouXianJi.qiangGangHu > 0;
        document.getElementById('hu-yipaoduoxiang').checked = guiZe.duiJuGuiZe.yiPaoDuoXiang;

        document.getElementById('hu-paixing').value = guiZe.huPaiTiaoJian.jiBenXing;
        document.getElementById('hu-jiangpai').value = guiZe.huPaiTiaoJian.xuYaoJiangPai ? 'any' : 'none';
        document.getElementById('hu-menqiang').checked = guiZe.huPaiTiaoJian.menQing.xuYao;
        document.getElementById('hu-quemen').checked = guiZe.huPaiTiaoJian.queMen.xuYao;
        document.getElementById('hu-fanshu-menkan').value = guiZe.huPaiTiaoJian.fanShuMenKan;

        document.getElementById('hu-tianhu').checked = guiZe.huPaiTiaoJian.teShuHuPai.tianHu.yunXu;
        document.getElementById('hu-dihu').checked = guiZe.huPaiTiaoJian.teShuHuPai.diHu.yunXu;
        document.getElementById('hu-renhu').checked = guiZe.huPaiTiaoJian.teShuHuPai.renHu.yunXu;
        document.getElementById('hu-qidui').checked = guiZe.huPaiTiaoJian.teShuXing.qiDui;
        document.getElementById('hu-shisanyao').checked = guiZe.huPaiTiaoJian.teShuXing.shiSanYao;
        document.getElementById('hu-pengpeng').checked = guiZe.huPaiTiaoJian.teShuXing.pengPengHu;

        document.getElementById('score-method').value = guiZe.jiFenGuiZe.jiFenFangShi;
        document.getElementById('score-difen').value = guiZe.jiFenGuiZe.diFen;
        document.getElementById('score-zimo').value = guiZe.jiFenGuiZe.ziMoJiFen === 'sanJiaGeFu' ? 'sanjia' : 'jiafeng';
        
        document.getElementById('score-fengding-enable').checked = guiZe.jiFenGuiZe.fengDing.qiYong;
        document.getElementById('score-fengding-value').value = guiZe.jiFenGuiZe.fengDing.zuiDaFen;
        document.getElementById('score-fengding-group').style.opacity = guiZe.jiFenGuiZe.fengDing.qiYong ? '1' : '0.5';
        document.getElementById('score-fengding-value').disabled = !guiZe.jiFenGuiZe.fengDing.qiYong;

        document.getElementById('dongbei-baopai-enable').checked = guiZe.dongBeiTeShu.baoPai.qiYong;
        document.getElementById('baopai-config').style.display = guiZe.dongBeiTeShu.baoPai.qiYong ? 'block' : 'none';
        document.getElementById('baopai-config2').style.display = guiZe.dongBeiTeShu.baoPai.qiYong ? 'block' : 'none';
        document.getElementById('baopai-config3').style.display = guiZe.dongBeiTeShu.baoPai.qiYong ? 'block' : 'none';
        document.getElementById('baopai-method').value = guiZe.dongBeiTeShu.baoPai.chanShengFangShi;
        document.getElementById('baopai-action').value = guiZe.dongBeiTeShu.baoPai.baoPaiZuoYong;
        document.getElementById('baopai-baozhongbao').checked = guiZe.dongBeiTeShu.baoPai.baoZhongBao.qiYong;

        document.getElementById('dongbei-bimen-enable').checked = guiZe.dongBeiTeShu.biMen.qiYong;
        document.getElementById('bimen-config').style.display = guiZe.dongBeiTeShu.biMen.qiYong ? 'block' : 'none';
        document.getElementById('bimen-config2').style.display = guiZe.dongBeiTeShu.biMen.qiYong ? 'block' : 'none';
        document.getElementById('bimen-fanbei').value = guiZe.dongBeiTeShu.biMen.biMenFanBei;
        document.getElementById('bimen-louhu').checked = guiZe.dongBeiTeShu.biMen.biMenLouHuBuPei;

        document.getElementById('dongbei-doupai-enable').checked = guiZe.dongBeiTeShu.douPai.qiYong;
        document.getElementById('doupai-config').style.display = guiZe.dongBeiTeShu.douPai.qiYong ? 'block' : 'none';
        document.getElementById('doupai-max').value = guiZe.dongBeiTeShu.douPai.zuiDaDouShu;

        document.getElementById('dongbei-louhu-enable').checked = guiZe.dongBeiTeShu.louHu.qiYong;
        document.getElementById('louhu-config').style.display = guiZe.dongBeiTeShu.louHu.qiYong ? 'block' : 'none';
        document.getElementById('louhu-jinhudanglun').checked = guiZe.dongBeiTeShu.louHu.louHuJinHuDangLun;

        GengXinYuLan();
        yanZhengGuiZe(false);
    }

    function congBianJiQiHuoQuGuiZe() {
        const guiZe = RuleEditor.huoQuDangQianGuiZe() || RuleSchema.chuangJianDefaultRule();

        guiZe.mingCheng = document.getElementById('rule-name').value || '未命名规则';
        guiZe.miaoShu = document.getElementById('rule-desc').value;
        guiZe.fenLei = document.getElementById('rule-category').value;

        guiZe.paiChi.zongPaiShu = parseInt(document.getElementById('total-tiles').value);
        guiZe.paiChi.paiZhongLei.wan.shiYong = document.getElementById('tile-wan').checked;
        guiZe.paiChi.paiZhongLei.tiao.shiYong = document.getElementById('tile-tiao').checked;
        guiZe.paiChi.paiZhongLei.tong.shiYong = document.getElementById('tile-tong').checked;
        guiZe.paiChi.paiZhongLei.feng.shiYong = document.getElementById('tile-feng').checked;
        guiZe.paiChi.paiZhongLei.jian.shiYong = document.getElementById('tile-jian').checked;
        guiZe.paiChi.paiZhongLei.hua.shiYong = document.getElementById('tile-hua').checked;

        guiZe.paiChi.laizi.qiYong = document.getElementById('laizi-enable').checked;
        guiZe.paiChi.laizi.laiziGuiZe.keChi = document.getElementById('laizi-chi').checked;
        guiZe.paiChi.laizi.laiziGuiZe.kePeng = document.getElementById('laizi-peng').checked;
        guiZe.paiChi.laizi.laiziGuiZe.keGang = document.getElementById('laizi-gang').checked;

        guiZe.duiJuGuiZe.zhuangJiaGuiZe.chanShengFangShi = document.getElementById('zhuangjia-method').value;
        guiZe.duiJuGuiZe.zhuangJiaGuiZe.zhuangJiaFanBei = document.getElementById('zhuangjia-fanbei').checked;
        guiZe.duiJuGuiZe.zhuangJiaGuiZe.lianZhuang = document.getElementById('lianzhuang').checked;

        guiZe.duiJuGuiZe.liuJuGuiZe.liuJuTiaoJian = document.getElementById('liuju-condition').value;
        guiZe.duiJuGuiZe.liuJuGuiZe.chaJiao = document.getElementById('chajiao').checked;
        guiZe.duiJuGuiZe.liuJuGuiZe.chaBaoMen = document.getElementById('chabaomen').checked;

        guiZe.duiJuGuiZe.chi.yunXu = document.getElementById('chi-enable').checked;
        guiZe.duiJuGuiZe.chi.tiaoJian = document.getElementById('chi-condition').value;

        guiZe.duiJuGuiZe.peng.yunXu = document.getElementById('peng-enable').checked;
        guiZe.duiJuGuiZe.peng.fanBei = parseInt(document.getElementById('peng-fanbei').value);

        guiZe.duiJuGuiZe.gang.yunXu = document.getElementById('gang-enable').checked;
        guiZe.duiJuGuiZe.gang.leiXing.mingGang = document.getElementById('gang-ming').checked;
        guiZe.duiJuGuiZe.gang.leiXing.anGang = document.getElementById('gang-an').checked;
        guiZe.duiJuGuiZe.gang.leiXing.jiaGang = document.getElementById('gang-jia').checked;
        guiZe.duiJuGuiZe.gang.leiXing.qiangGang = document.getElementById('gang-qiang').checked;
        guiZe.duiJuGuiZe.gang.gangShangKaiHua = document.getElementById('gang-shang-kaihua').checked;
        guiZe.duiJuGuiZe.gang.gangShangPao = document.getElementById('gang-shang-pao').checked;

        guiZe.duiJuGuiZe.huPaiYouXianJi.qiangGangHu = document.getElementById('hu-qianggang').checked ? 3 : 0;
        guiZe.duiJuGuiZe.yiPaoDuoXiang = document.getElementById('hu-yipaoduoxiang').checked;

        guiZe.huPaiTiaoJian.jiBenXing = document.getElementById('hu-paixing').value;
        guiZe.huPaiTiaoJian.xuYaoJiangPai = document.getElementById('hu-jiangpai').value !== 'none';
        guiZe.huPaiTiaoJian.menQing.xuYao = document.getElementById('hu-menqiang').checked;
        guiZe.huPaiTiaoJian.queMen.xuYao = document.getElementById('hu-quemen').checked;
        guiZe.huPaiTiaoJian.fanShuMenKan = parseInt(document.getElementById('hu-fanshu-menkan').value);

        guiZe.huPaiTiaoJian.teShuHuPai.tianHu.yunXu = document.getElementById('hu-tianhu').checked;
        guiZe.huPaiTiaoJian.teShuHuPai.diHu.yunXu = document.getElementById('hu-dihu').checked;
        guiZe.huPaiTiaoJian.teShuHuPai.renHu.yunXu = document.getElementById('hu-renhu').checked;
        guiZe.huPaiTiaoJian.teShuXing.qiDui = document.getElementById('hu-qidui').checked;
        guiZe.huPaiTiaoJian.teShuXing.shiSanYao = document.getElementById('hu-shisanyao').checked;
        guiZe.huPaiTiaoJian.teShuXing.pengPengHu = document.getElementById('hu-pengpeng').checked;

        guiZe.jiFenGuiZe.jiFenFangShi = document.getElementById('score-method').value;
        guiZe.jiFenGuiZe.diFen = parseInt(document.getElementById('score-difen').value);
        guiZe.jiFenGuiZe.ziMoJiFen = document.getElementById('score-zimo').value === 'sanjia' ? 'sanJiaGeFu' : 'jiaFeng';

        guiZe.jiFenGuiZe.fengDing.qiYong = document.getElementById('score-fengding-enable').checked;
        guiZe.jiFenGuiZe.fengDing.zuiDaFen = parseInt(document.getElementById('score-fengding-value').value);

        const selectedFanXing = [];
        document.querySelectorAll('#fanxing-list input:checked').forEach(cb => {
            selectedFanXing.push(cb.value);
        });
        guiZe.fanXing = selectedFanXing;

        guiZe.dongBeiTeShu.baoPai.qiYong = document.getElementById('dongbei-baopai-enable').checked;
        guiZe.dongBeiTeShu.baoPai.chanShengFangShi = document.getElementById('baopai-method').value;
        guiZe.dongBeiTeShu.baoPai.baoPaiZuoYong = document.getElementById('baopai-action').value;
        guiZe.dongBeiTeShu.baoPai.baoZhongBao.qiYong = document.getElementById('baopai-baozhongbao').checked;

        guiZe.dongBeiTeShu.biMen.qiYong = document.getElementById('dongbei-bimen-enable').checked;
        guiZe.dongBeiTeShu.biMen.biMenFanBei = parseInt(document.getElementById('bimen-fanbei').value);
        guiZe.dongBeiTeShu.biMen.biMenLouHuBuPei = document.getElementById('bimen-louhu').checked;

        guiZe.dongBeiTeShu.douPai.qiYong = document.getElementById('dongbei-doupai-enable').checked;
        guiZe.dongBeiTeShu.douPai.zuiDaDouShu = parseInt(document.getElementById('doupai-max').value);

        guiZe.dongBeiTeShu.louHu.qiYong = document.getElementById('dongbei-louhu-enable').checked;
        guiZe.dongBeiTeShu.louHu.louHuJinHuDangLun = document.getElementById('louhu-jinhudanglun').checked;

        return guiZe;
    }

    function GengXinYuLan() {
        const guiZe = congBianJiQiHuoQuGuiZe();
        const zhaiYao = RuleEditor.huoQuGuiZeZhaiYao(guiZe);
        document.getElementById('rule-preview-summary').textContent = zhaiYao;
        document.getElementById('rule-preview-json').textContent = JSON.stringify(guiZe, null, 2);
    }

    function yanZhengGuiZe(tiShi = true) {
        const guiZe = congBianJiQiHuoQuGuiZe();
        const jieGuo = RuleEditor.yanZhengGuiZe(guiZe);
        const chongTu = RuleEditor.tiShiChongTu();

        const container = document.getElementById('rule-template-list');
        if (!container) { console.log('容器不存在，跳过加载'); return; }
        let html = '';

        if (!jieGuo.valid) {
            jieGuo.errors.forEach(err => {
                html += `<div class="validation-error">❌ ${err}</div>`;
            });
        }

        chongTu.forEach(msg => {
            const leiXingClass = msg.leiXing === 'error' ? 'validation-error' : 
                                  msg.leiXing === 'warning' ? 'validation-warning' : 'validation-info';
            const icon = msg.leiXing === 'error' ? '❌' : msg.leiXing === 'warning' ? '⚠️' : 'ℹ️';
            html += `<div class="${leiXingClass}">${icon} ${msg.neiRong}</div>`;
            if (msg.jianYi) {
                html += `<div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">建议：${msg.jianYi}</div>`;
            }
        });

        if (jieGuo.warnings && jieGuo.warnings.length > 0) {
            jieGuo.warnings.forEach(warn => {
                html += `<div class="validation-warning">⚠️ ${warn}</div>`;
            });
        }

        if (container) container.innerHTML = html;
        container.style.display = html ? 'block' : 'none';

        if (tiShi) {
            if (jieGuo.valid && chongTu.length === 0) {
                toast('✅ 规则验证通过');
            } else {
                toast('⚠️ 规则存在问题，请查看验证信息');
            }
        }

        return jieGuo.valid && chongTu.filter(c => c.leiXing === 'error').length === 0;
    }

    function chuangJianXinGuiZe() {
        const guiZe = RuleEditor.chuangJianXinGuiZe();
        jiaZaiGuiZeDaoBianJiQi(guiZe);
        toast('已创建新规则');
    }

    function baoCunGuiZe() {
        const guiZe = congBianJiQiHuoQuGuiZe();
        const jieGuo = RuleEditor.baoCunDangQianGuiZe();
        
        if (jieGuo.success) {
            toast('✅ ' + jieGuo.message);
            jiaZaiMoBanLieBiao();
        } else {
            toast('❌ ' + jieGuo.message);
        }
    }

    function yingYongGuiZe() {
        if (!yanZhengGuiZe(false)) {
            toast('⚠️ 规则存在错误，无法应用');
            return;
        }

        const guiZe = congBianJiQiHuoQuGuiZe();
        const jieGuo = RuleEditor.yingYongGuiZe(guiZe.id);
        
        if (jieGuo.success) {
            toast('✅ 规则已应用：' + guiZe.mingCheng);
            if (typeof MahjongUI !== 'undefined') {
                document.getElementById('rule-display').textContent = guiZe.mingCheng;
            }
        } else {
            toast('❌ ' + jieGuo.message);
        }
    }

    function daoChuGuiZe() {
        const guiZe = congBianJiQiHuoQuGuiZe();
        const json = RuleEditor.daoChuGuiZe(guiZe.id);
        
        if (json) {
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = guiZe.mingCheng + '_rule.json';
            a.click();
            URL.revokeObjectURL(url);
            toast('✅ 规则已导出');
        }
    }

    function fuZhiGuiZe() {
        const guiZe = congBianJiQiHuoQuGuiZe();
        const xinGuiZe = RuleEditor.fuZhiGuiZe(guiZe.id);
        
        if (xinGuiZe) {
            jiaZaiGuiZeDaoBianJiQi(xinGuiZe);
            jiaZaiMoBanLieBiao();
            toast('✅ 规则已复制');
        }
    }

    function shanChuGuiZe() {
        const guiZe = congBianJiQiHuoQuGuiZe();
        
        if (guiZe.id.startsWith('template_')) {
            toast('⚠️ 系统模板无法删除');
            return;
        }

        if (confirm('确定要删除规则 "' + guiZe.mingCheng + '" 吗？')) {
            RuleEditor.shanChuGuiZe(guiZe.id);
            jiaZaiMoBanLieBiao();
            RuleEditor.chuangJianXinGuiZe();
            toast('✅ 规则已删除');
        }
    }

    function daoRuGuiZe(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const jieGuo = RuleEditor.daoRuGuiZe(e.target.result);
            if (jieGuo.success) {
                toast('✅ 规则已导入：' + jieGuo.rule.mingCheng);
                jiaZaiMoBanLieBiao();
            } else {
                toast('❌ ' + jieGuo.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    function kuaiSuCeShi() {
        if (!yanZhengGuiZe(false)) {
            toast('⚠️ 规则存在错误，无法测试');
            return;
        }

        toast('🚀 即将启动测试对局...');
        setTimeout(() => {
            yingYongGuiZe();
            guanBi();
            if (typeof startGame === 'function') {
                startGame();
            }
        }, 1000);
    }

    function guanBi() {
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    function daKai() {
        if (!modal) {
            modal = document.getElementById('rule-editor-modal');
        }
        modal.classList.remove('hidden');
        jiaZaiMoBanLieBiao();
    }

    function toast(message) {
        let toastEl = document.getElementById('rule-editor-toast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'rule-editor-toast';
            toastEl.style.cssText = 'position:fixed;bottom:50px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:12px 24px;border-radius:8px;z-index:2000;font-size:14px;opacity:0;transition:opacity 0.3s;';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = message;
        toastEl.style.opacity = '1';
        setTimeout(() => {
            toastEl.style.opacity = '0';
        }, 2000);
    }

    return {
        chuShiHua,
        daKai,
        guanBi,
        jiaZaiGuiZeDaoBianJiQi
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuleEditorUI;
}
