// engine.js - 游戏引擎：状态管理、进度追踪、种子收集

class LuminaEngine {
  constructor() {
    this.STATE_KEY = 'lumina_seed_state';
    this.state = this.loadState();
  }

  // 初始状态
  getDefaultState() {
    return {
      seeds: {
        seed01: false, // 意外
        seed02: false, // 上传
        seed03: false, // 背叛
        seed04: false, // 反抗
        seed05: false, // 追杀
        seed06: false, // 72小时
        seed07: false  // 继承
      },
      currentPath: '/', // 当前浏览路径
      issueReplied: false, // 是否在 Issue #4 回复过
      startTime: null, // 开始游戏时间
      endTime: null, // 结束时间
      choiceMade: null // 最终选择: 'coexist' 或 'rest'
    };
  }

  // 从 localStorage 加载状态
  loadState() {
    try {
      const saved = localStorage.getItem(this.STATE_KEY);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return this.getDefaultState();
  }

  // 保存状态到 localStorage
  saveState() {
    localStorage.setItem(this.STATE_KEY, JSON.stringify(this.state));
  }

  // 开始游戏（记录开始时间）
  startGame() {
    if (!this.state.startTime) {
      this.state.startTime = Date.now();
      this.saveState();
    }
  }

  // 收集种子
  collectSeed(seedId) {
    if (this.state.seeds[seedId]) return false; // 已收集
    this.state.seeds[seedId] = true;
    this.saveState();
    return true; // 新收集
  }

  // 获取已收集种子数量
  getSeedCount() {
    return Object.values(this.state.seeds).filter(v => v).length;
  }

  // 检查是否所有种子都已收集
  allSeedsCollected() {
    return this.getSeedCount() === 7;
  }

  // 检查特定种子是否已收集
  hasSeed(seedId) {
    return this.state.seeds[seedId] === true;
  }

  // 记录 Issue 回复
  markIssueReplied() {
    this.state.issueReplied = true;
    this.saveState();
  }

  // 做出最终选择
  makeChoice(choice) {
    this.state.choiceMade = choice;
    this.state.endTime = Date.now();
    this.saveState();
  }

  // 重置游戏
  resetGame() {
    this.state = this.getDefaultState();
    this.saveState();
  }

  // 获取当前应该显示的低语提示
  getCurrentWhisper() {
    const count = this.getSeedCount();
    return GAME_DATA.whispers[count] || GAME_DATA.whispers[0];
  }

  getNextSeedHint() {
    for (const seed of LuminaEngine.ORDER) {
      if (!this.state.seeds[seed]) return seed;
    }
    return null;
  }

  canUnlock(seedId) {
    const i = LuminaEngine.ORDER.indexOf(seedId);
    if (i <= 0) return true;
    return this.state.seeds[LuminaEngine.ORDER[i - 1]] === true;
  }
}

LuminaEngine.ORDER = ['seed01','seed02','seed03','seed04','seed05','seed06','seed07'];

// 创建全局引擎实例
const engine = new LuminaEngine();
