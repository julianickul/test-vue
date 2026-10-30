import { createApp } from 'vue';

import ElementPlus from 'element-plus';
import ru from 'element-plus/dist/locale/ru.mjs';

import router from '@/router';

import App from './App.vue';

import 'element-plus/dist/index.css';
import './assets/css/main.css';

// Fix for resizeObserver
const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 16); // Задержка ~1 кадр
    super(callback);
  }
};

createApp(App).use(router).use(ElementPlus, { locale: ru }).mount(`#app`);
