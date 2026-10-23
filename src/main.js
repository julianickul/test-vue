import { createApp } from 'vue';

import ElementPlus from 'element-plus';
import ru from 'element-plus/dist/locale/ru.mjs';

import router from '@/router';

import App from './App.vue';

import 'element-plus/dist/index.css';
import './assets/css/main.css';

createApp(App).use(router).use(ElementPlus, { locale: ru }).mount(`#app`);
