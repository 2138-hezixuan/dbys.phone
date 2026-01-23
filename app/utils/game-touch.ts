// 游戏触摸工具函数

// 为游戏交互元素添加防滑支持
export function setupGameTouch(element: HTMLElement, options: {
  type: 'draggable' | 'pressable' | 'tool';
  onDrag?: (x: number, y: number) => void;
  onPress?: (pressure: number) => void;
}) {
  if (!element) return;
  
  // 添加游戏交互标记
  element.setAttribute('data-game-interactive', 'true');
  element.setAttribute(`data-game-${options.type}`, 'true');
  
  // 添加CSS类
  element.classList.add('game-interactive');
  element.classList.add(`game-${options.type}`);
  
  // 设置触摸行为
  element.style.touchAction = 'none';
  
  // 如果是可拖动的，添加触摸事件监听
  if (options.type === 'draggable' && options.onDrag) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let elementX = 0;
    let elementY = 0;
    
    const onTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      
      // 获取元素当前位置
      const rect = element.getBoundingClientRect();
      elementX = rect.left;
      elementY = rect.top;
      
      // 防止默认行为（滚动）
      e.preventDefault();
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      e.stopPropagation();
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      const newX = elementX + deltaX;
      const newY = elementY + deltaY;
      
      if (options.onDrag) {
        options.onDrag(newX, newY);
      }
      
      // 防止默认行为（滚动）
      e.preventDefault();
    };
    
    const onTouchEnd = () => {
      isDragging = false;
    };
    
    element.addEventListener('touchstart', onTouchStart, { passive: false });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd);
    element.addEventListener('touchcancel', onTouchEnd);
  }
  
  // 如果是可按压的
  if (options.type === 'pressable' && options.onPress) {
    const onTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      // 计算压力（简单模拟）
      const pressure = e.touches[0].force || 0.5;
      if (options.onPress) {
        options.onPress(pressure);
      }
      e.preventDefault();
    };
    
    element.addEventListener('touchstart', onTouchStart, { passive: false });
  }
  
  // 清理函数
  return () => {
    element.removeAttribute('data-game-interactive');
    element.removeAttribute(`data-game-${options.type}`);
    element.classList.remove('game-interactive');
    element.classList.remove(`game-${options.type}`);
  };
}

// 初始化所有游戏交互元素
export function initGameTouch() {
  if (typeof window === 'undefined') return;
  
  // 为常见的游戏元素添加标记
  const draggables = document.querySelectorAll('.wood-block, .ink-brush, .carving-tool, .paper-sheet, [draggable]');
  draggables.forEach(el => {
    if (el instanceof HTMLElement) {
      el.setAttribute('data-game-draggable', 'true');
      el.classList.add('game-draggable');
    }
  });
  
  const pressables = document.querySelectorAll('.press-area, .pressure-zone, [data-pressable]');
  pressables.forEach(el => {
    if (el instanceof HTMLElement) {
      el.setAttribute('data-game-pressable', 'true');
      el.classList.add('game-pressable');
    }
  });
  
  const tools = document.querySelectorAll('.tool, .brush, .stamp, [data-tool]');
  tools.forEach(el => {
    if (el instanceof HTMLElement) {
      el.setAttribute('data-game-tool', 'true');
      el.classList.add('game-tool');
    }
  });
  
  console.log(`初始化了 ${draggables.length} 个可拖动元素，${pressables.length} 个可按压元素，${tools.length} 个工具元素`);
}