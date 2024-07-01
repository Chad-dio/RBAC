<template>
    <!-- default-active:当前活跃状态的菜单绑定对应路由 router:点击菜单就会跳转对应路由 index:绑定菜单的路由 -->
    <el-menu :default-active="router.currentRoute.value.path" class="my-menu el-menu-vertical-demo"
        :collapse-transition="false" :collapse="collapseState" :router="true"> <!-- @select="handleSelect" -->
        <template v-for="menu in store.userRouters">
            <!-- 无 子菜单 -->
            <el-menu-item v-if="menu.children === null || menu.children.length === 0" :index="menu.path">
                <template v-if="menu.meta">
                    <el-icon>
                        <component v-if="judgeIconExists(menu.meta.icon)" :is="menu.meta.icon" />
                    </el-icon>
                </template>
                <!-- span包裹，那么在隐藏侧边栏后，不会显示 -->
                <span>{{ menu.name }}</span>
            </el-menu-item>

            <!-- 有 子菜单 -->
            <el-sub-menu v-else :index="menu.path">
                <template #title>
                    <template v-if="menu.meta && menu.meta.icon">
                        <el-icon>
                            <component v-if="judgeIconExists(menu.meta.icon)" :is="menu.meta.icon" />
                        </el-icon>
                    </template>
                    <span>{{ menu.name }}</span>
                </template>
                <el-menu-item v-for="subMenu in menu.children" :index="subMenu.path">
                    <template v-if="subMenu.meta && subMenu.meta.icon">
                        <el-icon>
                            <component v-if="judgeIconExists(subMenu.meta.icon)" :is="subMenu.meta.icon" />
                        </el-icon>
                    </template>
                    <span>{{ subMenu.name }}</span>
                </el-menu-item>
            </el-sub-menu>
        </template>
    </el-menu>
</template>
  
<script lang="ts" setup>
import { useStore } from '@/store'
import router from '@/router'
import iconsNameHash from '../main'

const store = useStore()

// @ts-ignore
let props = defineProps(['collapseState'])
let emits = defineEmits(['emit-select-menu'])


const judgeIconExists = (iconName) => {
    return iconsNameHash[iconName] !== undefined
}

// @ts-ignore
// 主要用于处理选择菜单项的逻辑，通过索引路径查找相应的菜单项信息，并触发自定义事件以及导航到相应的路径。
const handleSelect = (_, indexPath) => {
    // console.log("current:", indexPath)

    let menu = store.menus
    let index = 0
    let arr = [];
    let toPath = "";

    // console.log("menu:", menu)

    for (let i = 0; i < menu.length; i++) {
        // console.log("menu[", i, ']:', menu[i])

        if (menu[i].identity == indexPath[index]) {
            arr.push(menu[i].name)
            index++
            if (menu[i].path) {
                toPath = menu[i].path
            }
            if (index == indexPath.length) {
                break
            }
            let subMenu = JSON.parse(JSON.stringify(menu[i].sub_menus))
            for (let j = 0; j < subMenu.length; j++) {
                if (subMenu[j].identity == indexPath[index]) {
                    arr.push(subMenu[j].name)
                    if (subMenu[j].path) {
                        toPath = subMenu[j].path
                    }
                    break
                }
            }
            break
        }
    }
    // console.log("arr:", arr)
    emits('emit-select-menu', arr)
    router.push(toPath)
}

</script>
  
<style scoped>
.my-menu {
    height: 100vh;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    height: 100vh;
    animation: show 0.2s linear !important;
}

.el-menu--collapse {
    width: 65px;
    height: 100vh;
    animation: hide 0.2s linear !important;
}


@keyframes hide {
    from {
        width: 200px;
    }

    to {
        width: 65px;
    }
}

@keyframes show {
    from {
        width: 65px;
    }

    to {
        width: 200px;
    }
}
</style>