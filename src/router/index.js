import { createRouter, createWebHistory } from 'vue-router';

import PharmacyMain from '@/views/PharmacyMain.vue';

const routes = [
  {
    path: `/`,
    name: `PharmacyMain`,
    component: PharmacyMain,
  },
];

export default createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
