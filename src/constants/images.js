// src/constants/images.js

// 1. Đối với ảnh trong PUBLIC: Gọi trực tiếp bằng chuỗi đường dẫn (string)
const PUBLIC_URL = '/img';

// 2. Đối với ảnh trong ASSETS: Phải IMPORT để Vite xử lý
// import heroImg from '../assets/hero.png';
// import reactLogo from '../assets/react.svg';
// import viteLogo from '../assets/vite.svg';

export const IMAGES = {
  // Ảnh tĩnh (Public)
  LOGO_DANG_KY: `${PUBLIC_URL}/logo_dangky.jpg`,
  

  // Ảnh UI (Assets)
//   HERO: heroImg,
//   REACT: reactLogo,
//   VITE: viteLogo,
};