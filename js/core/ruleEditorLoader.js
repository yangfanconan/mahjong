/**
 * 规则编辑器加载器
 * 动态加载规则编辑器 HTML 并初始化
 */

(function() {
    'use strict';

    async function loadRuleEditor() {
        try {
            const response = await fetch('ruleEditor.html');
            const html = await response.text();
            const container = document.getElementById('rule-editor-container');
            if (container) {
                container.innerHTML = html;
            }
            
            if (typeof RuleEditorUI !== 'undefined') {
                RuleEditorUI.chuShiHua();
            }
            
            console.log('规则编辑器加载成功');
        } catch (e) {
            console.error('规则编辑器加载失败:', e);
        }
    }

    function bindRuleEditorButton() {
        document.addEventListener('click', function(e) {
            if (e.target.id === 'rule-editor-btn' || e.target.closest('#rule-editor-btn')) {
                if (typeof RuleEditorUI !== 'undefined') {
                    RuleEditorUI.daKai();
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadRuleEditor();
            bindRuleEditorButton();
        });
    } else {
        loadRuleEditor();
        bindRuleEditorButton();
    }
})();
