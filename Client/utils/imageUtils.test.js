/**
 * 图片工具函数测试
 */

import { getFirstImageUrl, processGoodsImage } from './imageUtils';

// 测试用例
const testCases = [
  {
    name: '多个图片URL，用逗号分隔',
    input: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/丑八怪.jpg,https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/柚子.jpg',
    expected: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/丑八怪.jpg'
  },
  {
    name: '单个图片URL',
    input: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/丑八怪.jpg',
    expected: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/丑八怪.jpg'
  },
  {
    name: '空字符串',
    input: '',
    expected: ''
  },
  {
    name: 'null值',
    input: null,
    expected: ''
  },
  {
    name: 'undefined值',
    input: undefined,
    expected: ''
  },
  {
    name: '带空格的多个URL',
    input: 'https://example1.com/image1.jpg , https://example2.com/image2.jpg',
    expected: 'https://example1.com/image1.jpg'
  }
];

// 运行测试
console.log('=== 图片工具函数测试 ===');

testCases.forEach((testCase, index) => {
  const result = getFirstImageUrl(testCase.input);
  const passed = result === testCase.expected;
  
  console.log(`测试 ${index + 1}: ${testCase.name}`);
  console.log(`  输入: ${testCase.input}`);
  console.log(`  期望: ${testCase.expected}`);
  console.log(`  实际: ${result}`);
  console.log(`  结果: ${passed ? '✅ 通过' : '❌ 失败'}`);
  console.log('');
});

// 测试processGoodsImage函数
console.log('=== processGoodsImage函数测试 ===');

const processTestCases = [
  {
    name: 'primaryImage有多个URL',
    primaryImage: 'https://example1.com/image1.jpg,https://example2.com/image2.jpg',
    thumb: 'https://thumb.com/image.jpg',
    expected: 'https://example1.com/image1.jpg'
  },
  {
    name: '只有thumb有多个URL',
    primaryImage: null,
    thumb: 'https://thumb1.com/image1.jpg,https://thumb2.com/image2.jpg',
    expected: 'https://thumb1.com/image1.jpg'
  },
  {
    name: 'primaryImage和thumb都有值',
    primaryImage: 'https://primary.com/image.jpg',
    thumb: 'https://thumb.com/image.jpg',
    expected: 'https://primary.com/image.jpg'
  },
  {
    name: '都为空',
    primaryImage: null,
    thumb: null,
    expected: ''
  }
];

processTestCases.forEach((testCase, index) => {
  const result = processGoodsImage(testCase.primaryImage, testCase.thumb);
  const passed = result === testCase.expected;
  
  console.log(`测试 ${index + 1}: ${testCase.name}`);
  console.log(`  primaryImage: ${testCase.primaryImage}`);
  console.log(`  thumb: ${testCase.thumb}`);
  console.log(`  期望: ${testCase.expected}`);
  console.log(`  实际: ${result}`);
  console.log(`  结果: ${passed ? '✅ 通过' : '❌ 失败'}`);
  console.log('');
}); 