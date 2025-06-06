// const images = [
//   {
//     img: 'https://cdn-we-retail.ym.tencent.com/tsr/home/v2/banner1.png',
//     text: '1',
//   },
//   {
//     img: 'https://cdn-we-retail.ym.tencent.com/tsr/home/v2/banner2.png',
//     text: '2',
//   },
//   {
//     img: 'https://cdn-we-retail.ym.tencent.com/tsr/home/v2/banner3.png',
//     text: '3',
//   },
//   {
//     img: 'https://cdn-we-retail.ym.tencent.com/tsr/home/v2/banner4.png',
//     text: '4',
//   },
//   {
//     img: 'https://cdn-we-retail.ym.tencent.com/tsr/home/v2/banner5.png',
//     text: '5',
//   },
//   {
//     img: 'https://cdn-we-retail.ym.tencent.com/tsr/home/v2/banner6.png',
//     text: '6',
//   },
// ];
//轮播展示图片
const images = [
  'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/swiper/1.jpg',
  'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/swiper/2.jpg',
  'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/swiper/3.jpg',
  'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/swiper/4.jpg',
  'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/swiper/5.jpg'
];

export function genSwiperImageList() {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: images,
      success: res => {
        resolve(res.fileList.map(item => item.tempFileURL)); // 返回可访问的 HTTPS URL
      },
      fail: err => {
        reject(err);
      }
    });
  });
}