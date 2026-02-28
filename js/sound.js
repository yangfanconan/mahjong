/**
 * 麻将音效模块
 * 使用 Web Audio API 生成音效
 * 支持多语言/方言音效
 */

const MahjongSound = (function() {
    'use strict';

    let audioContext = null;
    let enabled = true;
    let language = 'zh';

    const LANGUAGES = {
        zh: '普通话',
        sichuan: '四川话',
        cantonese: '粤语',
        japanese: '日语',
        english: 'English'
    };

    /**
     * 初始化音频
     */
    function init() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不支持');
        }
    }

    /**
     * 确保音频上下文激活
     */
    function ensureContext() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    /**
     * 切换音效开关
     */
    function toggle() {
        enabled = !enabled;
        return enabled;
    }

    /**
     * 设置启用状态
     */
    function setEnabled(e) {
        enabled = e;
    }

    /**
     * 获取启用状态
     */
    function isEnabled() {
        return enabled;
    }

    /**
     * 设置语言
     */
    function setLanguage(lang) {
        if (LANGUAGES[lang]) {
            language = lang;
        }
    }

    /**
     * 播放音效
     */
    function play(type) {
        if (!enabled || !audioContext) return;

        ensureContext();

        switch (type) {
            case 'deal': playDealSound(); break;
            case 'play': playPlaySound(); break;
            case 'chi': playChiSound(); break;
            case 'peng': playPengSound(); break;
            case 'gang': playGangSound(); break;
            case 'hu': playHuSound(); break;
            case 'click': playClickSound(); break;
            case 'shuffle': playShuffleSound(); break;
            case 'win': playWinSound(); break;
            case 'lose': playLoseSound(); break;
        }
    }

    /**
     * 播放发牌音效
     */
    function playDealSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 800;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

        osc.start();
        osc.stop(audioContext.currentTime + 0.05);
    }

    /**
     * 播放出牌音效
     */
    function playPlaySound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 600;
        osc.type = 'triangle';

        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

        osc.start();
        osc.stop(audioContext.currentTime + 0.08);
    }

    /**
     * 播放吃牌音效
     */
    function playChiSound() {
        const notes = [500, 600, 700];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = freq;
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                osc.start();
                osc.stop(audioContext.currentTime + 0.1);
            }, i * 50);
        });
    }

    /**
     * 播放碰牌音效
     */
    function playPengSound() {
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = 400;
                osc.type = 'square';

                gain.gain.setValueAtTime(0.15, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                osc.start();
                osc.stop(audioContext.currentTime + 0.1);
            }, i * 80);
        }
    }

    /**
     * 播放杠牌音效
     */
    function playGangSound() {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = 300 + i * 50;
                osc.type = 'sawtooth';

                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

                osc.start();
                osc.stop(audioContext.currentTime + 0.15);
            }, i * 60);
        }
    }

    /**
     * 播放胡牌音效
     */
    function playHuSound() {
        const notes = [523, 659, 784, 1047, 1318];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = freq;
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                osc.start();
                osc.stop(audioContext.currentTime + 0.3);
            }, i * 100);
        });
    }

    /**
     * 播放点击音效
     */
    function playClickSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 1000;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);

        osc.start();
        osc.stop(audioContext.currentTime + 0.03);
    }

    /**
     * 播放洗牌音效
     */
    function playShuffleSound() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = 200 + Math.random() * 300;
                osc.type = 'triangle';

                gain.gain.setValueAtTime(0.05, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

                osc.start();
                osc.stop(audioContext.currentTime + 0.05);
            }, i * 30);
        }
    }

    /**
     * 播放胜利音效
     */
    function playWinSound() {
        const melody = [523, 659, 784, 1047, 784, 1047, 1318];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = freq;
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

                osc.start();
                osc.stop(audioContext.currentTime + 0.25);
            }, i * 120);
        });
    }

    /**
     * 播放失败音效
     */
    function playLoseSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.setValueAtTime(400, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        osc.start();
        osc.stop(audioContext.currentTime + 0.5);
    }

    return {
        init,
        toggle,
        setEnabled,
        isEnabled,
        setLanguage,
        play,
        LANGUAGES
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MahjongSound;
}
