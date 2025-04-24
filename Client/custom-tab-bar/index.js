import {
  genPicURL
} from '../utils/genURL';
import TabMenu from './data';

Component({
  data: {
    active: 0,
    list: [],
  },

  lifetimes: {
    attached() {
      this.initTabBar();
    }
  },

  methods: {
    async initTabBar() {
      try {
        // 先打印调试信息


        // 转换所有图标URL
        const list = await Promise.all(TabMenu.map(async (item) => {
          // 打印每个项目的图标路径


          try {
            // 正确使用 Promise.all
            const [icon, selectedIcon] = await Promise.all([
              genPicURL(item.icon),
              genPicURL(item.selectedIcon)
            ]);



            return {
              ...item,
              icon,
              selectedIcon
            };
          } catch (err) {
            console.error('图标URL转换失败:', err);
            // 如果转换失败，返回原始路径
            return item;
          }
        }));

        // console.log('TabBar数据处理完成:', list);

        this.setData({
          list
        });
        // 初始化当前页面的激活状态
        this.init();
      } catch (error) {
        console.error('TabBar初始化失败:', error);
      }
    },

    onChange(event) {
      const index = event.currentTarget.dataset.value; // 获取点击的索引
      if (!this.data.list[index]) return; // 添加安全检查

      this.setData({
        active: index
      });
      const url = this.data.list[index].url;

      if (!url) return; // 添加 URL 检查

      wx.switchTab({
        url: url.startsWith('/') ? url : `/${url}`,
        fail: (error) => {
          console.error('页面跳转失败：', error);
          // 如果跳转失败，可以尝试其他跳转方式
          wx.reLaunch({
            url: url.startsWith('/') ? url : `/${url}`,
            fail: (err) => {
              console.error('reLaunch也失败了：', err);
            }
          });
        }
      });
    },

    init() {
      const page = getCurrentPages().pop();
      if (!page) return; // 添加页面检查

      const route = page.route;
      if (!route) return; // 添加路由检查

      const active = this.data.list.findIndex(
        (item) => {
          const itemUrl = item.url.startsWith('/') ? item.url.substr(1) : item.url;
          return itemUrl === route;
        }
      );

      if (active !== -1) { // 只在找到匹配的页面时更新激活状态
        this.setData({
          active
        });
      }
    },

    onImageError(e) {
      const {
        index,
        type
      } = e.currentTarget.dataset;
      console.error(`TabBar图片加载失败: ${type}图标, 索引 ${index}`, e.detail);

      // 可以尝试设置一个默认图标
      const updatedList = [...this.data.list];
      if (type === 'selected') {
        // 更新为默认选中图标
        updatedList[index].selectedIcon = '/images/default_selected.png';
      } else {
        // 更新为默认普通图标
        updatedList[index].icon = '/images/default.png';
      }

      this.setData({
        list: updatedList
      });
    },
  },
});