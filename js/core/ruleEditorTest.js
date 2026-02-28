/**
 * 规则编辑器测试用例
 * 测试规则编辑器的各项功能
 */

const RuleEditorTest = (function() {
    'use strict';

    const testResults = [];

    function runAllTests() {
        console.log('=== 规则编辑器测试开始 ===\n');
        
        testRuleSchema();
        testRuleEditor();
        testRuleMoBan();
        testRuleValidation();
        testImportExport();
        
        console.log('\n=== 测试完成 ===');
        console.log(`总计：${testResults.length} 个测试`);
        console.log(`通过：${testResults.filter(t => t.pass).length} 个`);
        console.log(`失败：${testResults.filter(t => !t.pass).length} 个`);
        
        return testResults;
    }

    function addTest(name, pass, message = '') {
        testResults.push({ name, pass, message });
        console.log(`${pass ? '✅' : '❌'} ${name}${message ? ': ' + message : ''}`);
    }

    // 测试规则 Schema
    function testRuleSchema() {
        console.log('\n--- 规则 Schema 测试 ---');
        
        // 测试创建默认规则
        try {
            const rule = RuleSchema.chuangJianDefaultRule();
            addTest('创建默认规则', !!rule, rule ? `ID: ${rule.id}` : '失败');
            addTest('规则有 ID 字段', !!rule.id, rule.id);
            addTest('规则有名称字段', !!rule.mingCheng);
            addTest('规则有牌池配置', !!rule.paiChi);
            addTest('规则有对局规则', !!rule.duiJuGuiZe);
            addTest('规则有胡牌条件', !!rule.huPaiTiaoJian);
            addTest('规则有计分规则', !!rule.jiFenGuiZe);
            addTest('规则有东北特色', !!rule.dongBeiTeShu);
        } catch (e) {
            addTest('创建默认规则', false, e.message);
        }
        
        // 测试验证功能
        try {
            const validRule = RuleSchema.chuangJianDefaultRule();
            validRule.id = 'test_rule';
            validRule.mingCheng = '测试规则';
            
            const result = RuleSchema.validateRule(validRule);
            addTest('验证有效规则', result.valid, result.errors.join(', '));
            
            const invalidRule = RuleSchema.chuangJianDefaultRule();
            invalidRule.id = '';
            invalidRule.mingCheng = '';
            
            const invalidResult = RuleSchema.validateRule(invalidRule);
            addTest('验证无效规则', !invalidResult.valid && invalidResult.errors.length > 0);
        } catch (e) {
            addTest('验证功能', false, e.message);
        }
        
        // 测试摘要生成
        try {
            const rule = RuleSchema.chuangJianDefaultRule();
            rule.mingCheng = '测试规则';
            rule.paiChi.zongPaiShu = 136;
            
            const summary = RuleSchema.generateSummary(rule);
            addTest('生成规则摘要', !!summary, summary);
        } catch (e) {
            addTest('生成规则摘要', false, e.message);
        }
        
        // 测试番型库
        try {
            const fanXingKu = RuleSchema.fanXingKu;
            addTest('番型库存在', Array.isArray(fanXingKu));
            addTest('番型库数量', fanXingKu.length > 20, `共${fanXingKu.length}个番型`);
            
            const dongBeiFanXing = fanXingKu.filter(f => 
                ['biMenHu', 'baoPaiFan', 'baoZhongBao'].includes(f.id)
            );
            addTest('东北专属番型', dongBeiFanXing.length > 0, `共${dongBeiFanXing.length}个`);
        } catch (e) {
            addTest('番型库', false, e.message);
        }
    }

    // 测试规则编辑器核心
    function testRuleEditor() {
        console.log('\n--- 规则编辑器核心测试 ---');
        
        // 测试初始化
        try {
            RuleEditor.chuShiHua();
            addTest('编辑器初始化', true);
        } catch (e) {
            addTest('编辑器初始化', false, e.message);
        }
        
        // 测试创建新规则
        try {
            const newRule = RuleEditor.chuangJianXinGuiZe();
            addTest('创建新规则', !!newRule, newRule ? newRule.id : '失败');
        } catch (e) {
            addTest('创建新规则', false, e.message);
        }
        
        // 测试基于模板创建
        try {
            const templateRule = RuleEditor.chuangJianXinGuiZe('template_sichuan');
            addTest('基于模板创建', !!templateRule, templateRule ? templateRule.mingCheng : '失败');
        } catch (e) {
            addTest('基于模板创建', false, e.message);
        }
        
        // 测试获取当前规则
        try {
            const currentRule = RuleEditor.huoQuDangQianGuiZe();
            addTest('获取当前规则', !!currentRule);
        } catch (e) {
            addTest('获取当前规则', false, e.message);
        }
        
        // 测试保存规则
        try {
            const result = RuleEditor.baoCunDangQianGuiZe();
            addTest('保存规则', result.success, result.message);
        } catch (e) {
            addTest('保存规则', false, e.message);
        }
        
        // 测试获取所有规则
        try {
            const allRules = RuleEditor.huoQuSuoYouGuiZe();
            addTest('获取所有规则', Array.isArray(allRules), `共${allRules.length}个规则`);
        } catch (e) {
            addTest('获取所有规则', false, e.message);
        }
    }

    // 测试模板库
    function testRuleMoBan() {
        console.log('\n--- 模板库测试 ---');
        
        try {
            const moBanKu = RuleEditor.huoQuMoBanKu();
            addTest('模板库存在', Array.isArray(moBanKu));
            addTest('模板数量', moBanKu.length >= 10, `共${moBanKu.length}个模板`);
            
            // 测试主流模板
            const mainstream = moBanKu.filter(m => m.fenLei === 'mainstream');
            addTest('主流玩法模板', mainstream.length >= 4, `共${mainstream.length}个`);
            
            // 测试东北模板
            const dongbei = moBanKu.filter(m => m.fenLei === 'dongbei');
            addTest('东北特色模板', dongbei.length >= 5, `共${dongbei.length}个`);
            
            // 测试具体模板
            const sichuan = moBanKu.find(m => m.id === 'template_sichuan');
            addTest('四川麻将模板', !!sichuan, sichuan ? sichuan.mingCheng : '未找到');
            
            const qiqihaer = moBanKu.find(m => m.id === 'template_qiqihaer');
            addTest('齐齐哈尔麻将模板', !!qiqihaer, qiqihaer ? qiqihaer.mingCheng : '未找到');
            
            const huludao = moBanKu.find(m => m.id === 'template_huludao');
            addTest('葫芦岛麻将模板', !!huludao, huludao ? huludao.mingCheng : '未找到');
            
            // 测试模板配置
            if (qiqihaer) {
                const guiZe = qiqihaer.guiZe;
                addTest('齐齐哈尔 - 禁吃', !guiZe.duiJuGuiZe.chi.yunXu);
                addTest('齐齐哈尔 - 闭门启用', guiZe.dongBeiTeShu.biMen.qiYong);
                addTest('齐齐哈尔 - 赖子启用', guiZe.paiChi.laizi.qiYong);
            }
            
            if (huludao) {
                const guiZe = huludao.guiZe;
                addTest('葫芦岛 - 一炮多响', guiZe.duiJuGuiZe.yiPaoDuoXiang);
                addTest('葫芦岛 - 宝中宝启用', guiZe.dongBeiTeShu.baoPai.baoZhongBao.qiYong);
            }
        } catch (e) {
            addTest('模板库', false, e.message);
        }
    }

    // 测试规则验证
    function testRuleValidation() {
        console.log('\n--- 规则验证测试 ---');
        
        try {
            const rule = RuleSchema.chuangJianDefaultRule();
            rule.id = 'validation_test';
            rule.mingCheng = '验证测试规则';
            RuleEditor.sheZhiDangQianGuiZe(rule);
            
            const chongTu = RuleEditor.tiShiChongTu();
            addTest('冲突检测', Array.isArray(chongTu));
            
            // 测试规则验证
            const valid = RuleEditor.yanZhengGuiZe(rule);
            addTest('规则验证接口', !!valid);
        } catch (e) {
            addTest('规则验证', false, e.message);
        }
        
        // 测试冲突规则
        try {
            const conflictRule = RuleSchema.chuangJianDefaultRule();
            conflictRule.id = 'conflict_test';
            conflictRule.mingCheng = '冲突规则';
            conflictRule.duiJuGuiZe.chi.yunXu = false;
            conflictRule.duiJuGuiZe.chi.jinJiaChi = true;
            
            const result = RuleSchema.validateRule(conflictRule);
            addTest('冲突规则检测', !result.valid || result.warnings?.length > 0);
        } catch (e) {
            addTest('冲突规则检测', false, e.message);
        }
    }

    // 测试导入导出
    function testImportExport() {
        console.log('\n--- 导入导出测试 ---');
        
        try {
            const rule = RuleSchema.chuangJianDefaultRule();
            rule.id = 'export_test';
            rule.mingCheng = '导出测试';
            RuleEditor.sheZhiDangQianGuiZe(rule);
            RuleEditor.baoCunDangQianGuiZe();
            
            const exported = RuleEditor.daoChuGuiZe(rule.id);
            addTest('导出规则', !!exported);
            
            if (exported) {
                const parsed = JSON.parse(exported);
                addTest('导出格式验证', parsed.version && parsed.rule);
                addTest('导出规则 ID', parsed.rule.id === rule.id);
            }
        } catch (e) {
            addTest('导出测试', false, e.message);
        }
        
        try {
            const validJson = JSON.stringify({
                version: '1.0.0',
                rule: {
                    id: 'import_test',
                    mingCheng: '导入测试',
                    paiChi: { zongPaiShu: 136 }
                }
            });
            
            const result = RuleEditor.daoRuGuiZe(validJson);
            addTest('导入有效 JSON', result.success, result.message);
            
            const invalidJson = '{ invalid json }';
            const invalidResult = RuleEditor.daoRuGuiZe(invalidJson);
            addTest('导入无效 JSON', !invalidResult.success);
        } catch (e) {
            addTest('导入测试', false, e.message);
        }
    }

    // 生成测试报告
    function generateReport() {
        const passed = testResults.filter(t => t.pass).length;
        const total = testResults.length;
        const rate = Math.round((passed / total) * 100);
        
        console.log('\n========== 测试报告 ==========');
        console.log(`测试总数：${total}`);
        console.log(`通过：${passed}`);
        console.log(`失败：${total - passed}`);
        console.log(`通过率：${rate}%`);
        
        const failed = testResults.filter(t => !t.pass);
        if (failed.length > 0) {
            console.log('\n失败用例:');
            failed.forEach(t => console.log(`  - ${t.name}: ${t.message}`));
        }
        
        return { total, passed, failed: total - passed, rate };
    }

    return {
        runAllTests,
        generateReport
    };
})();

// 自动运行测试
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        setTimeout(() => {
            console.log('准备运行规则编辑器测试...');
            RuleEditorTest.runAllTests();
        }, 1000);
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuleEditorTest;
}
