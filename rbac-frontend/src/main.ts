import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import { useStore } from '@/store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import locale from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale })
let store = useStore()

const iconsNameHash = {}

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
    iconsNameHash[key] = 1
}

app.mount('#app')

const modules = import.meta.glob('./views/**/*.vue');

// 导航守卫 注册路由
// @ts-ignore
router.beforeEach(async (to, from, next) => {
    let menus = localStorage.getItem("menu")
    if (!store.register && to.path != '/login') {
        let res;
        if (!menus) {
            res = await store.getMenusList()
            localStorage.setItem('menu', JSON.stringify(res))
        } else {
            store.menus = JSON.parse(menus)
        }
        let routes: any[] = [];
        store.menus.forEach((item: any) => {
            let myRoute: any = {}
            if (item.path) {
                myRoute = {
                    path: item.path,
                    name: item.name,
                    meta: {
                        icon: item.web_icon
                    },
                    component: modules['./views' + item.path + '.vue']
                }
            } else {
                myRoute = {
                    path: '/layout',
                    name: item.name,
                    meta: {
                        icon: item.web_icon
                    },
                    component: modules['./components/layout.vue']
                }
            }
            if (item.sub_menus) {
                myRoute.children = []
                item.sub_menus.forEach((subItem: any) => {
                    if (subItem.path) {
                        myRoute.children.push({
                            path: subItem.path,
                            name: subItem.name,
                            meta: {
                                icon: subItem.web_icon
                            },
                            // component: ()=>import('./views' + subItem.path + '.vue')
                            component: modules['./views' + subItem.path + '.vue']
                        })
                    }
                });
            }
            routes.push(myRoute)
        })

        routes.forEach(item => {
            router.addRoute('home', item)
        })
        // @ts-ignore
        store.userRouters = routes // 由于需要路由刷新变更，才能更新userRouters，所以sidebar不会实时反馈

        store.register = true
        next(to.fullPath)
    } else {
        next()
    }
})
// 可能会遇到：后端再起程序，访问前端会报错 Index.vue，是否这个组件也需要单独加入？之后遇到在考虑 —— 2024年3月2日10点11分

export default iconsNameHash