import { defineStore } from "pinia"

import { getMenuList } from '@/api/menu'

export const useStore = defineStore('counter', {
  state: () => {
    return {
      register: false, // 是否拉取过菜单了
      menus: [], // 当前用户所有可见菜单
      userRouters: [], // 当前用户所有可见菜单对应的路由
      tags: [] // topNav 的所有小标签
    }
  },
  getters: {},
  actions: {
    getMenusList() {
      return new Promise((resolve, reject) => {
        getMenuList()
          .then((res) => {
            this.menus = res.data.menu
            resolve(res.data.menu)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
  },
})