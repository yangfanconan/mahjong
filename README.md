# 🀄 Mahjong Master | 麻将大师

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## English

A cross-platform multiplayer Mahjong game with multiple rule sets, built with pure HTML5 + JavaScript + CSS3.

### ✨ Features

- 🎮 **4 Rule Systems**: Sichuan (血战到底), Guangdong (推倒胡), Japanese (立直麻将), International
- 🤖 **3 AI Difficulty Levels**: Easy, Medium, Hard
- 🎨 **Multiple Themes**: Chinese Style (国风), Japanese Style (日式), Modern (现代)
- 🖼️ **Skin System**: Customizable tile skins with emoji support
- 📱 **Cross-Platform**: Web browser + Android APK
- 🔊 **Sound Effects**: Web Audio API based audio system
- 💾 **Local Storage**: Auto-save game progress
- 📐 **Landscape Design**: Optimized for horizontal screen orientation

### 🚀 Quick Start

#### Browser

```bash
# Clone the repository
git clone https://github.com/yourusername/mahjong.git
cd mahjong

# Start local server (Option 1: Node.js)
npx http-server . -p 8080

# Start local server (Option 2: Python)
python -m http.server 8080

# Open http://localhost:8080 in your browser
```

#### Android APK

```bash
# Install Cordova
npm install -g cordova

# Add Android platform
cordova platform add android@12

# Build APK
cordova build android

# APK location: platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### 🎯 How to Play

1. **Select Rule**: Click menu button (☰) to choose rule set
2. **Start Game**: Click "开始游戏" button
3. **Play Tiles**: Click a tile in your hand to select, then click again to discard
4. **Actions**: Use 吃(Chi), 碰(Peng), 杠(Gang), 胡(Hu) buttons when available
5. **Win**: Form a complete hand with 4 sets + 1 pair

### 🏗️ Project Structure

```
mahjong/
├── index.html              # Main HTML file
├── css/style.css           # Styles with 3 themes
├── js/
│   ├── core/
│   │   ├── mahjongTiles.js    # Tile definitions
│   │   └── ruleEngine.js      # Rule engine
│   ├── rules/
│   │   ├── ruleSichuan.js     # Sichuan rules
│   │   ├── ruleGuangdong.js   # Guangdong rules
│   │   ├── ruleJapan.js       # Japanese rules
│   │   └── ruleInternational.js
│   ├── aiLogic.js             # AI with 3 difficulty levels
│   ├── mahjongUI.js           # Canvas rendering
│   ├── skinManager.js         # Skin system
│   ├── sound.js               # Audio system
│   └── main.js                # Main game logic
├── skin/                      # Skin resources
└── config.xml                 # Cordova configuration
```

### 🔧 Development

#### Add New Rule

1. Create new file in `js/rules/` directory
2. Implement the `RuleEngine.GUI_ZE_JIE_KOU` interface
3. Register in `main.js`: `RuleEngine.zhuCeGuiZe(newRule);`

#### Create Custom Skin

See `skin/SKIN_TUTORIAL.md` for details.

### 📄 License

MIT License

---

<a name="中文"></a>
## 中文

跨平台多规则麻将游戏，使用纯 HTML5 + JavaScript + CSS3 开发。

### ✨ 功能特性

- 🎮 **4种规则**: 四川麻将(血战到底)、广东麻将(推倒胡)、日本麻将(立直)、国际麻将
- 🤖 **3级AI难度**: 简单、中等、困难
- 🎨 **多主题**: 国风、日式、现代三种风格
- 🖼️ **皮肤系统**: 支持自定义麻将牌皮肤和Emoji显示
- 📱 **跨平台**: 支持Web浏览器和Android APK
- 🔊 **音效系统**: 基于Web Audio API
- 💾 **本地存储**: 自动保存游戏进度
- 📐 **横屏设计**: 针对横屏优化的界面布局

### 🚀 快速开始

#### 浏览器运行

```bash
# 克隆项目
git clone https://github.com/yourusername/mahjong.git
cd mahjong

# 启动本地服务器 (方式1: Node.js)
npx http-server . -p 8080

# 启动本地服务器 (方式2: Python)
python -m http.server 8080

# 浏览器打开 http://localhost:8080
```

#### 安卓APK打包

```bash
# 安装 Cordova
npm install -g cordova

# 添加安卓平台
cordova platform add android@12

# 构建 APK
cordova build android

# APK 位置: platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### 🎯 游戏玩法

1. **选择规则**: 点击菜单按钮(☰)选择规则
2. **开始游戏**: 点击"开始游戏"按钮
3. **出牌**: 点击手牌选中，再次点击打出
4. **操作**: 可用时点击吃、碰、杠、胡按钮
5. **胡牌**: 凑成4组面子+1对将牌即可胡牌

### 🏗️ 项目结构

```
mahjong/
├── index.html              # 主页面
├── css/style.css           # 样式文件(3种主题)
├── js/
│   ├── core/
│   │   ├── mahjongTiles.js    # 牌定义
│   │   └── ruleEngine.js      # 规则引擎
│   ├── rules/
│   │   ├── ruleSichuan.js     # 四川麻将
│   │   ├── ruleGuangdong.js   # 广东麻将
│   │   ├── ruleJapan.js       # 日本麻将
│   │   └── ruleInternational.js
│   ├── aiLogic.js             # AI逻辑(3级难度)
│   ├── mahjongUI.js           # Canvas渲染
│   ├── skinManager.js         # 皮肤系统
│   ├── sound.js               # 音效系统
│   └── main.js                # 主程序
├── skin/                      # 皮肤资源
└── config.xml                 # Cordova配置
```

### 🔧 开发指南

#### 添加新规则

1. 在 `js/rules/` 目录创建新规则文件
2. 实现 `RuleEngine.GUI_ZE_JIE_KOU` 接口
3. 在 `main.js` 中注册: `RuleEngine.zhuCeGuiZe(newRule);`

#### 制作自定义皮肤

详见 `skin/SKIN_TUTORIAL.md`

### 📄 许可证

MIT License

---

## 🤝 Contributing | 贡献

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献代码！请随时提交 Pull Request。

## 📧 Contact | 联系方式

If you have any questions or suggestions, please open an issue.

如有问题或建议，请提交 Issue。
