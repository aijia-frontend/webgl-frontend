/*
 * @Description:
 * @Author: jiangronghua
 * @Date: 2020-03-04 15:49:52
 * @LastEditors: jiangronghua
 * @LastEditTime: 2020-03-24 17:26:31
 */
// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView, BasicHeader } from '@/layouts'

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Recover')
      }
    ]
  },
  {
    path: '/house',
    component: BasicHeader,
    redirect: '/house/drawing',
    children: [
      {
        path: 'drawing',
        name: 'drawing',
        component: () => import('../views/house/drawing/index.vue')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
