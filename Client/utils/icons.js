import { genPicURL } from './genURL';

// 缓存URL，避免重复请求
let filterIcon = null;
let caretUpIcon = null;
let caretDownIcon = null;

// 获取筛选按钮图标
export async function getFilterIcon() {
  if (filterIcon) return filterIcon;
  
  try {
    filterIcon = await genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/TdesignFilter.png');
    return filterIcon;
  } catch (error) {
    console.error('获取筛选图标失败:', error);
    return '';
  }
}

// 获取向上箭头图标
export async function getCaretUpIcon() {
  if (caretUpIcon) return caretUpIcon;
  
  try {
    caretUpIcon = await genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/TdesignCaretUp.png');
    return caretUpIcon;
  } catch (error) {
    console.error('获取向上箭头图标失败:', error);
    return '';
  }
}

// 获取向下箭头图标
export async function getCaretDownIcon() {
  if (caretDownIcon) return caretDownIcon;
  
  try {
    caretDownIcon = await genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/TdesignCaretDown.png');
    return caretDownIcon;
  } catch (error) {
    console.error('获取向下箭头图标失败:', error);
    return '';
  }
}

// 初始化所有图标
export async function initIcons() {
  try {
    const [filter, caretUp, caretDown] = await Promise.all([
      getFilterIcon(),
      getCaretUpIcon(),
      getCaretDownIcon()
    ]);
    
    return {
      filterIcon: filter,
      caretUpIcon: caretUp,
      caretDownIcon: caretDown
    };
  } catch (error) {
    console.error('初始化图标失败:', error);
    return {
      filterIcon: '',
      caretUpIcon: '',
      caretDownIcon: ''
    };
  }
} 