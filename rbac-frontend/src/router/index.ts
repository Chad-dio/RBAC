import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/Index.vue')
    },
    {
      path: '/',
      name: 'home',
      redirect: '/home',
      component: () => import('@/views/Index.vue'),
      children: [
        {
          path: '/home',
          name: "Index",
          component: () => import('@/views/home/Index.vue')
        }
      ]
    },
    {
      name: '404',
      path: '/:catchAll(.*)',
      component: () => import(`@/views/error/404.vue`)
    }, // https://www.cnblogs.com/shanfeng1000/p/17284240.html
  ]
})


export default router
