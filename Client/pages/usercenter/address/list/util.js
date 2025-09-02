let addressPromise = [];

/** 获取一个地址选择Promise */
export const getAddressPromise = () => {
  let resolver;
  let rejecter;
  const nextPromise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });

  addressPromise.push({ resolver, rejecter });

  return nextPromise;
};

/** 用户选择了一个地址 */
export const resolveAddress = (address) => {
  const allAddress = [...addressPromise];
  addressPromise = [];

  allAddress.forEach(({ resolver }) => resolver(address));
};

/** 用户没有选择任何地址只是返回上一页了 */
export const rejectAddress = () => {
  const allAddress = [...addressPromise];
  addressPromise = [];

  allAddress.forEach(({ rejecter }) => rejecter(new Error('cancel')));
};

/** 获取默认地址 */
export const getDefaultAddress = () => {
  try {
    const addressList = wx.getStorageSync('userAddressList') || [];
    
    // 确保addressList是数组
    if (!Array.isArray(addressList)) {
      console.warn('[getDefaultAddress] 地址列表不是数组格式:', addressList);
      return null;
    }
    
    // 查找默认地址（isDefault为1的地址）
    const defaultAddress = addressList.find(address => address.isDefault === 1);
    
    if (defaultAddress) {
      console.log('[getDefaultAddress] 找到默认地址:', defaultAddress);
      return defaultAddress;
    }
    
    // 如果没有设置默认地址，返回第一个地址作为默认地址
    if (addressList.length > 0) {
      console.log('[getDefaultAddress] 没有设置默认地址，使用第一个地址:', addressList[0]);
      return addressList[0];
    }
    
    console.log('[getDefaultAddress] 没有任何地址');
    return null;
  } catch (error) {
    console.error('[getDefaultAddress] 获取默认地址失败:', error);
    return null;
  }
};
