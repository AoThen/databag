// 防抖延迟时间（与Mobile端保持一致）
export const DEBOUNCE_DELAY = {
  INPUT: 500,      // 输入防抖（用户名、服务器等）
  SEARCH: 300,     // 搜索防抖
  SAVE: 1000,      // 保存防抖（设置更新等）
  REGISTRY: 1000,  // 注册表查询防抖
  SETUP: 2000,      // 设置向导防抖
};

// 请求缓存TTL（与Mobile端保持一致）
export const REQUEST_CACHE_TTL = 30000; // 30秒