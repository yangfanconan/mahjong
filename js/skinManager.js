/**
 * 皮肤管理器
 * 负责皮肤加载、切换、校验、记忆功能
 */

const SkinManager = {
    currentSkin: null,
    skins: {},
    resources: {},
    loaded: false,
    loading: false,
    
    defaultSkin: {
        name: 'none',
        displayName: '默认样式',
        description: '使用黑白emoji显示',
        author: '系统内置',
        version: '1.0'
    },
    
    builtInSkins: [
        {
            name: 'none',
            displayName: '默认样式',
            description: '黑白emoji，简洁风格',
            author: '系统内置',
            version: '1.0',
            preview: '#666666',
            isEmoji: true
        },
        {
            name: 'default',
            displayName: '国风经典',
            description: '红木风格，传统国风配色',
            author: '系统内置',
            version: '1.0',
            preview: '#8B4513'
        },
        {
            name: 'japanese_style',
            displayName: '日式极简',
            description: '原木色调，简约清新',
            author: '系统内置',
            version: '1.0',
            preview: '#D2B48C'
        },
        {
            name: 'cartoon_style',
            displayName: '卡通风格',
            description: '明亮色彩，活泼可爱',
            author: '系统内置',
            version: '1.0',
            preview: '#FF6B6B'
        },
        {
            name: 'emoji_color',
            displayName: '彩色Emoji',
            description: '使用彩色emoji生成的麻将牌',
            author: '系统内置',
            version: '1.0',
            preview: '#4CAF50',
            isEmoji: true,
            isColor: true
        }
    ],
    
    requiredFiles: {
        table: ['table_bg.png'],
        mahjong_back: ['mahjong_back.png'],
        mahjong_front: [
            '1wan.png', '2wan.png', '3wan.png', '4wan.png', '5wan.png', '6wan.png', '7wan.png', '8wan.png', '9wan.png',
            '1tiao.png', '2tiao.png', '3tiao.png', '4tiao.png', '5tiao.png', '6tiao.png', '7tiao.png', '8tiao.png', '9tiao.png',
            '1tong.png', '2tong.png', '3tong.png', '4tong.png', '5tong.png', '6tong.png', '7tong.png', '8tong.png', '9tong.png',
            'dong_feng.png', 'nan_feng.png', 'xi_feng.png', 'bei_feng.png',
            'zhong.png', 'fa.png', 'bai.png'
        ]
    },
    
    init: function() {
        this.loadSavedSkin();
        this.registerBuiltInSkins();
        console.log('皮肤管理器初始化完成');
    },
    
    registerBuiltInSkins: function() {
        for (var i = 0; i < this.builtInSkins.length; i++) {
            var skin = this.builtInSkins[i];
            this.skins[skin.name] = skin;
        }
    },
    
    loadSavedSkin: function() {
        try {
            var saved = localStorage.getItem('mahjong_skin');
            if (saved) {
                var skinData = JSON.parse(saved);
                if (skinData && skinData.name) {
                    this.currentSkin = skinData;
                }
            }
        } catch (e) {
            console.warn('读取保存的皮肤失败:', e);
        }
        
        if (!this.currentSkin) {
            this.currentSkin = this.defaultSkin;
        }
    },
    
    saveSkinPreference: function(skinName) {
        try {
            var skin = this.skins[skinName];
            if (skin) {
                localStorage.setItem('mahjong_skin', JSON.stringify(skin));
                console.log('皮肤偏好已保存:', skinName);
            }
        } catch (e) {
            console.warn('保存皮肤偏好失败:', e);
        }
    },
    
    loadSkin: function(skinName) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            if (self.loading) {
                reject(new Error('正在加载其他皮肤'));
                return;
            }
            
            var skin = self.skins[skinName];
            if (!skin) {
                reject(new Error('皮肤不存在: ' + skinName));
                return;
            }
            
            if (skin.isEmoji) {
                self.currentSkin = skin;
                self.loaded = true;
                self.saveSkinPreference(skinName);
                console.log('Emoji皮肤已激活:', skinName);
                resolve(skin);
                return;
            }
            
            self.loading = true;
            console.log('开始加载皮肤:', skinName);
            
            var basePath = 'skin/' + skinName + '/';
            var resources = {};
            var loadPromises = [];
            var failedFiles = [];
            
            for (var category in self.requiredFiles) {
                resources[category] = {};
                var files = self.requiredFiles[category];
                
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var filePath = basePath + category + '/' + file;
                    
                    (function(cat, f, fp) {
                        var promise = self.loadImage(fp)
                            .then(function(img) {
                                resources[cat][f] = img;
                            })
                            .catch(function(err) {
                                failedFiles.push(fp);
                            });
                        loadPromises.push(promise);
                    })(category, file, filePath);
                }
            }
            
            Promise.all(loadPromises)
                .then(function() {
                    self.loading = false;
                    
                    if (failedFiles.length > 10) {
                        reject(new Error('资源加载失败过多'));
                        return;
                    }
                    
                    self.resources = resources;
                    self.currentSkin = skin;
                    self.loaded = true;
                    
                    self.saveSkinPreference(skinName);
                    
                    if (typeof MahjongUI !== 'undefined' && MahjongUI.loadSkin) {
                        MahjongUI.loadSkin(skin);
                    }
                    
                    console.log('皮肤加载完成:', skinName);
                    resolve(skin);
                })
                .catch(function(err) {
                    self.loading = false;
                    console.error('皮肤加载失败:', err);
                    reject(err);
                });
        });
    },
    
    loadImage: function(url) {
        return new Promise(function(resolve, reject) {
            var img = new Image();
            var timeout = setTimeout(function() {
                reject(new Error('加载超时'));
            }, 3000);
            
            img.onload = function() {
                clearTimeout(timeout);
                resolve(img);
            };
            
            img.onerror = function() {
                clearTimeout(timeout);
                reject(new Error('加载失败'));
            };
            
            img.src = url + '?t=' + Date.now();
        });
    },
    
    getResourceUrl: function(category, fileName) {
        if (!this.currentSkin) return null;
        return 'skin/' + this.currentSkin.name + '/' + category + '/' + fileName;
    },
    
    getResource: function(category, fileName) {
        if (this.resources && this.resources[category] && this.resources[category][fileName]) {
            return this.resources[category][fileName];
        }
        return null;
    },
    
    validateSkin: function(skinPath) {
        var self = this;
        var missingFiles = [];
        
        return new Promise(function(resolve) {
            var checkPromises = [];
            
            for (var category in self.requiredFiles) {
                var files = self.requiredFiles[category];
                
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var filePath = skinPath + '/' + category + '/' + file;
                    
                    (function(fp, f) {
                        var promise = self.checkFileExists(fp)
                            .then(function(exists) {
                                if (!exists) {
                                    missingFiles.push(f);
                                }
                            });
                        checkPromises.push(promise);
                    })(filePath, file);
                }
            }
            
            Promise.all(checkPromises)
                .then(function() {
                    resolve({
                        isValid: missingFiles.length === 0,
                        missingFiles: missingFiles
                    });
                });
        });
    },
    
    checkFileExists: function(url) {
        return new Promise(function(resolve) {
            var img = new Image();
            var timeout = setTimeout(function() {
                resolve(false);
            }, 2000);
            
            img.onload = function() {
                clearTimeout(timeout);
                resolve(true);
            };
            
            img.onerror = function() {
                clearTimeout(timeout);
                resolve(false);
            };
            
            img.src = url;
        });
    },
    
    getAvailableSkins: function() {
        var result = [];
        for (var name in this.skins) {
            result.push(this.skins[name]);
        }
        return result;
    },
    
    getCurrentSkin: function() {
        return this.currentSkin || this.defaultSkin;
    },
    
    previewSkin: function(skinName, canvas) {
        var skin = this.skins[skinName];
        if (!skin || !canvas) return;
        
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;
        
        ctx.fillStyle = '#1a5c36';
        ctx.fillRect(0, 0, w, h);
        
        if (skin.isEmoji) {
            var sampleCards = [
                { hua: 'wan', dian: 1 },
                { hua: 'wan', dian: 5 },
                { hua: 'wan', dian: 9 },
                { hua: 'tiao', dian: 5 },
                { hua: 'tong', dian: 5 },
                { hua: 'feng', dian: 1 },
                { hua: 'jian', dian: 1 }
            ];
            
            var cardW = 28;
            var cardH = 38;
            var startX = (w - sampleCards.length * (cardW + 6)) / 2;
            var startY = (h - cardH) / 2 - 10;
            
            for (var i = 0; i < sampleCards.length; i++) {
                var cardX = startX + i * (cardW + 6);
                
                ctx.fillStyle = '#fffff5';
                ctx.fillRect(cardX, startY, cardW, cardH);
                ctx.strokeStyle = '#8b7355';
                ctx.lineWidth = 1;
                ctx.strokeRect(cardX + 0.5, startY + 0.5, cardW - 1, cardH - 1);
                
                var unicode = MahjongTiles.huoQuUnicode(sampleCards[i]);
                if (unicode) {
                    var fontSize = Math.min(cardW, cardH) * 0.85;
                    ctx.font = fontSize + 'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#000';
                    ctx.fillText(unicode, cardX + cardW / 2, startY + cardH / 2 + fontSize * 0.1);
                }
            }
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (var i = 0; i < 5; i++) {
                var x = Math.random() * w;
                var y = Math.random() * h;
                var size = 30 + Math.random() * 20;
                ctx.fillRect(x, y, size, size * 1.25);
            }
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 2;
        ctx.fillText(skin.displayName, w/2, h - 12);
        ctx.shadowBlur = 0;
    },
    
    isEmojiSkin: function() {
        return this.currentSkin && this.currentSkin.isEmoji;
    },
    
    tileCache: {},
    
    getEmojiTileImage: function(pai, width, height) {
        var key = pai.hua + '_' + pai.dian + '_' + width + 'x' + height;
        if (this.tileCache[key]) {
            return this.tileCache[key];
        }
        var canvas = this.generateEmojiTile(pai, width, height);
        this.tileCache[key] = canvas;
        return canvas;
    },
    
    generateEmojiTile: function(pai, width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#fffff5';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
        
        var unicode = MahjongTiles.huoQuUnicode(pai);
        if (unicode) {
            var fontSize = Math.min(width, height) * 0.8;
            ctx.font = fontSize + 'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText(unicode, width / 2, height / 2 + fontSize * 0.1);
        }
        
        return canvas;
    },
    
    generateSkinPackage: async function() {
        var self = this;
        if (!window.showDirectoryPicker) {
            alert('您的浏览器不支持File System Access API，请使用Chrome/Edge浏览器');
            return null;
        }
        
        console.log('开始生成彩色Emoji皮肤包...');
        
        try {
            var dirHandle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });
            
            var skinDir = await dirHandle.getDirectoryHandle('emoji_color', { create: true });
            var mahjongDir = await skinDir.getDirectoryHandle('mahjong_front', { create: true });
            var backDir = await skinDir.getDirectoryHandle('mahjong_back', { create: true });
            
            var paiTypes = [
                { hua: 'wan', dian: 1, file: '1wan.png' },
                { hua: 'wan', dian: 2, file: '2wan.png' },
                { hua: 'wan', dian: 3, file: '3wan.png' },
                { hua: 'wan', dian: 4, file: '4wan.png' },
                { hua: 'wan', dian: 5, file: '5wan.png' },
                { hua: 'wan', dian: 6, file: '6wan.png' },
                { hua: 'wan', dian: 7, file: '7wan.png' },
                { hua: 'wan', dian: 8, file: '8wan.png' },
                { hua: 'wan', dian: 9, file: '9wan.png' },
                { hua: 'tiao', dian: 1, file: '1tiao.png' },
                { hua: 'tiao', dian: 2, file: '2tiao.png' },
                { hua: 'tiao', dian: 3, file: '3tiao.png' },
                { hua: 'tiao', dian: 4, file: '4tiao.png' },
                { hua: 'tiao', dian: 5, file: '5tiao.png' },
                { hua: 'tiao', dian: 6, file: '6tiao.png' },
                { hua: 'tiao', dian: 7, file: '7tiao.png' },
                { hua: 'tiao', dian: 8, file: '8tiao.png' },
                { hua: 'tiao', dian: 9, file: '9tiao.png' },
                { hua: 'tong', dian: 1, file: '1tong.png' },
                { hua: 'tong', dian: 2, file: '2tong.png' },
                { hua: 'tong', dian: 3, file: '3tong.png' },
                { hua: 'tong', dian: 4, file: '4tong.png' },
                { hua: 'tong', dian: 5, file: '5tong.png' },
                { hua: 'tong', dian: 6, file: '6tong.png' },
                { hua: 'tong', dian: 7, file: '7tong.png' },
                { hua: 'tong', dian: 8, file: '8tong.png' },
                { hua: 'tong', dian: 9, file: '9tong.png' },
                { hua: 'feng', dian: 1, file: 'dong_feng.png' },
                { hua: 'feng', dian: 2, file: 'nan_feng.png' },
                { hua: 'feng', dian: 3, file: 'xi_feng.png' },
                { hua: 'feng', dian: 4, file: 'bei_feng.png' },
                { hua: 'jian', dian: 1, file: 'zhong.png' },
                { hua: 'jian', dian: 2, file: 'fa.png' },
                { hua: 'jian', dian: 3, file: 'bai.png' }
            ];
            
            console.log('生成麻将牌图片...');
            var savedCount = 0;
            
            for (var i = 0; i < paiTypes.length; i++) {
                var pt = paiTypes[i];
                var canvas = self.generateEmojiTile(pt, 100, 140);
                if (canvas) {
                    var blob = await new Promise(function(resolve) {
                        canvas.toBlob(resolve, 'image/png');
                    });
                    
                    var fileHandle = await mahjongDir.getFileHandle(pt.file, { create: true });
                    var writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    savedCount++;
                }
            }
            
            console.log('生成麻将牌背面...');
            var backCanvas = document.createElement('canvas');
            backCanvas.width = 100;
            backCanvas.height = 140;
            var backCtx = backCanvas.getContext('2d');
            var backGrad = backCtx.createLinearGradient(0, 0, 100, 140);
            backGrad.addColorStop(0, '#2e7d32');
            backGrad.addColorStop(1, '#1b5e20');
            backCtx.fillStyle = backGrad;
            backCtx.fillRect(0, 0, 100, 140);
            backCtx.strokeStyle = '#8b7355';
            backCtx.lineWidth = 2;
            backCtx.strokeRect(1, 1, 99, 139);
            backCtx.fillStyle = 'rgba(255,255,255,0.15)';
            backCtx.beginPath();
            backCtx.arc(50, 70, 25, 0, Math.PI * 2);
            backCtx.fill();
            backCtx.fillStyle = 'rgba(255,255,255,0.15)';
            backCtx.beginPath();
            backCtx.arc(50, 70, 25, 0, Math.PI * 2);
            backCtx.fill();
            
            var backBlob = await new Promise(function(resolve) {
                backCanvas.toBlob(resolve, 'image/png');
            });
            var backFileHandle = await backDir.getFileHandle('mahjong_back.png', { create: true });
            var backWritable = await backFileHandle.createWritable();
            await backWritable.write(backBlob);
            await backWritable.close();
            
            console.log('生成skin配置...');
            var skinJson = {
                name: 'emoji_color',
                displayName: '彩色Emoji',
                description: '使用彩色emoji生成的麻将牌',
                author: '系统生成',
                version: '1.0',
                preview: '#4CAF50'
            };
            var jsonBlob = new Blob([JSON.stringify(skinJson, null, 2)], { type: 'application/json' });
            var jsonFileHandle = await skinDir.getFileHandle('skin.json', { create: true });
            var jsonWritable = await jsonFileHandle.createWritable();
            await jsonWritable.write(jsonBlob);
            await jsonWritable.close();
            
            console.log('皮肤包生成完成');
            
            return {
                success: true,
                count: savedCount + 3,
                path: 'emoji_color'
            };
            
        } catch (err) {
            console.error('生成皮肤包失败:', err);
            return {
                success: false,
                error: err.message
            };
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkinManager;
}
