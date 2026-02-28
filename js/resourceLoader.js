const ResourceLoader = {
    cache: {},
    loading: {},
    
    load: function(url) {
        var self = this;
        
        if (self.cache[url]) {
            return Promise.resolve(self.cache[url]);
        }
        
        if (self.loading[url]) {
            return self.loading[url];
        }
        
        self.loading[url] = new Promise(function(resolve, reject) {
            var img = new Image();
            var timeout = setTimeout(function() {
                reject(new Error('加载超时'));
                delete self.loading[url];
            }, 3000);
            
            img.onload = function() {
                clearTimeout(timeout);
                self.cache[url] = img;
                delete self.loading[url];
                resolve(img);
            };
            
            img.onerror = function() {
                clearTimeout(timeout);
                delete self.loading[url];
                reject(new Error('加载失败'));
            };
            
            img.src = url;
        });
        
        return self.loading[url];
    },
    
    batchLoad: function(urls) {
        var self = this;
        var promises = urls.map(function(url) {
            return self.load(url);
        });
        return Promise.all(promises);
    },
    
    clearCache: function() {
        this.cache = {};
        this.loading = {};
    },
    
    preloadSkin: function(skinName) {
        var urls = [];
        var categories = ['table', 'mahjong_back', 'mahjong_front', 'button'];
        var basePath = 'skin/' + skinName + '/';
        
        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            var files = SkinManager.requiredFiles[cat];
            for (var j = 0; j < files.length; j++) {
                urls.push(basePath + cat + '/' + files[j]);
            }
        }
        
        return this.batchLoad(urls);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceLoader;
}
