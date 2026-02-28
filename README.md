# 🀄 Mahjong Master | 麻将大师

[English](#english) | [中文](#中文)

**v2.0.0 - 规则编辑器版本**

---

<a name="english"></a>
## English

A cross-platform multiplayer Mahjong game with **visual rule editor**, supporting multiple rule sets, built with pure HTML5 + JavaScript + CSS3.

### ✨ Features

- 🎮 **4 Rule Systems**: Sichuan, Guangdong, Japanese, International
- 🛠️ **Rule Editor**: Visual editor to create custom rules (NEW!)
- 🎴 **29 Win Patterns**: Complete enumeration of all winning hand types
- ❄️ **Dongbei Special**: BaoPai, BiMen, DouPai, LouHu rules
- 🤖 **3 AI Difficulty Levels**: Easy, Medium, Hard
- 🎨 **Multiple Themes**: Chinese, Japanese, Modern
- 🖼️ **Skin System**: Customizable tile skins
- 📱 **Cross-Platform**: Web + Android APK
- 🔊 **Sound Effects**: Multi-language support
- 💾 **Local Storage**: Auto-save game progress

### 🛠️ Rule Editor

Create custom Mahjong rules without coding!

- **Visual Editing**: Forms, checkboxes, dropdowns
- **29 Win Patterns**: PingHu, QiDui, ShiSanYao, etc.
- **Tile Pool Config**: Wan/Tiao/Tong/Feng/Jian/Hua
- **Action Rules**: Chi/Peng/Gang/Ting
- **Special Rules**: Dongbei features (BaoPai, BiMen, etc.)
- **Import/Export**: JSON format rule files

### 🚀 Quick Start

```bash
# Clone
git clone https://github.com/yourusername/mahjong.git
cd mahjong

# Start server
npx http-server . -p 8080

# Open browser
open http://localhost:8080
```

### 🎮 Using Rule Editor

1. Click **📝** button in game
2. Select template or click **"➕ New Rule"**
3. Configure rule settings
4. Select win patterns (29 available)
5. Click **"💾 Save"**
6. Apply rule and start game

### 📖 Documentation

- [Rule Editor Guide](docs/规则编辑器使用说明.md)
- [Data Structure Design](docs/规则数据结构设计.md)

---

<a name="中文"></a>
## 中文

跨平台多规则麻将游戏，**内置可视化规则编辑器**，使用纯 HTML5 + JavaScript + CSS3 开发。

### ✨ 功能特性

#### 游戏功能
- 🎮 **4种规则**: 四川、广东、日本、国际麻将
- 🤖 **3级AI难度**: 简单、中等、困难
- 🎨 **多主题**: 国风、日式、现代
- 🖼️ **皮肤系统**: 自定义牌面皮肤
- 📱 **跨平台**: Web + Android APK
- 🔊 **音效系统**: 多语言支持
- 💾 **本地存储**: 自动保存进度

#### 规则编辑器（v2.0 新增）
- 🛠️ **可视化编辑** - 无需代码创建规则
- 🎴 **29 种胡牌牌型** - 完整枚举所有组合
- ❄️ **东北特色** - 宝牌/闭门/豆牌/漏胡
- 📋 **规则模板** - 内置 11 种预设
- 📤 **导入导出** - JSON 格式规则文件
- 👁️ **实时预览** - 编辑时即时查看

### 🚀 快速开始

#### 浏览器运行

```bash
# 克隆项目
git clone https://github.com/yourusername/mahjong.git
cd mahjong

# 启动服务器
npx http-server . -p 8080

# 打开浏览器
open http://localhost:8080
```

#### Android APK

```bash
# 安装 Cordova
npm install -g cordova

# 添加平台
cordova platform add android@12

# 构建 APK
cordova build android
```

### 🎮 规则编辑器使用

#### 打开编辑器
1. 游戏界面点击右上角 **📝** 按钮
2. 或进入设置 → 规则编辑器

#### 创建规则
1. 点击 **"➕ 新建规则"**
2. 填写名称和描述
3. 配置牌池（万/条/筒/风/箭/花）
4. 设置动作（吃/碰/杠/听）
5. 选择胡牌牌型（29 种）
6. 配置特殊规则（宝牌/闭门/豆牌/漏胡）
7. 设置计分规则
8. 点击 **"💾 保存"**

#### 胡牌牌型（29 种）

**基础牌型（4 种）**
- 平胡、七对子、龙七对、碰碰胡

**花色牌型（2 种）**
- 清一色、混一色

**幺九牌型（4 种）**
- 全带幺、纯全带幺、混老头、清幺九

**字牌牌型（5 种）**
- 字一色、小三元、大三元、小四喜、大四喜

**特殊牌型（7 种）**
- 十三幺、九莲宝灯、四杠子、四暗刻、天和、地和、人和

**东北特色（6 种）**
- 闭门胡、开门胡、夹胡、宝中宝、飘胡、亮豆

### 🏗️ 项目结构

```
mahjong/
├── index.html                    # 主页面
├── css/
│   ├── style.css                 # 主样式
│   └── ruleEditor.css            # 编辑器样式
├── js/
│   ├── main.js                   # 主逻辑
│   ├── mahjongUI.js              # UI 渲染
│   ├── animation.js              # 动画引擎
│   ├── aiLogic.js                # AI 逻辑
│   ├── sound.js                  # 音效系统
│   ├── storage.js                # 数据存储
│   ├── skinManager.js            # 皮肤管理
│   ├── scoreSystem.js            # 计分系统
│   ├── ruleEditorFull.js         # 规则编辑器
│   └── core/
│       ├── mahjongTiles.js       # 牌组定义
│       ├── ruleEngine.js         # 规则引擎
│       ├── ruleSchema.js         # 规则数据结构
│       ├── ruleEditor.js         # 编辑器核心
│       ├── ruleEditorUI.js       # 编辑器 UI
│       ├── ruleEditorLoader.js   # 加载器
│       └── ruleEditorTest.js     # 测试用例
├── rules/
│   ├── ruleSichuan.js            # 四川麻将
│   ├── ruleGuangdong.js          # 广东麻将
│   ├── ruleJapan.js              # 日本麻将
│   └── ruleInternational.js      # 国际麻将
├── skin/                         # 皮肤资源
├── res/                          # 其他资源
└── docs/
    ├── 规则编辑器使用说明.md
    └── 规则数据结构设计.md
```

### 📖 文档

- [规则编辑器使用说明](docs/规则编辑器使用说明.md)
- [规则数据结构设计](docs/规则数据结构设计.md)

### 🔧 开发

#### 添加新规则

```javascript
// 1. 创建规则文件
const NewRule = {
    id: 'newrule',
    mingCheng: '新规则',
    paiShu: 136,
    // ... 实现接口方法
};

// 2. 注册规则
RuleEngine.zhuCeGuiZe(NewRule);
```

#### 规则数据结构

详见 [规则数据结构设计](docs/规则数据结构设计.md)

### 📄 许可证

MIT License

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 📧 联系方式

如有问题或建议，请提交 Issue。

---

## 📊 版本历史

### v2.0.0 (2024)
- ✅ 新增规则编辑器
- ✅ 29 种胡牌牌型选择
- ✅ 东北特色规则支持
- ✅ 规则导入导出功能
- ✅ 规则模板系统

### v1.0.0
- ✅ 基础游戏功能
- ✅ 4 种规则支持
- ✅ AI 对战
- ✅ 皮肤系统

---

**🎮 享受游戏！** 🀄
