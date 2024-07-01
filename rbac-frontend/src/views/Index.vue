<template>
    <main>
        <el-container>
            <el-aside class="my-aside" :class="{ 'my-aside-width': !collapseState }">
                <SidebarMenu :collapseState="collapseState" @emit-select-menu="emitSelectMenu" />
            </el-aside>
            <el-container>
                <el-header class="my-header" style="height: auto;">
                    <TopNav @emit-collapse-state="emitCollapseState" :selectMenuArr="selectMenuArr" />
                </el-header>
                <el-main>
                    <RouterView />
                </el-main>
            </el-container>
        </el-container>

    </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SidebarMenu from '@/components/SidebarMenu.vue';
import TopNav from '@/components/TopNav.vue'

let collapseState = ref(false)
let selectMenuArr = ref()

function emitCollapseState(collapse) {
    collapseState.value = collapse
}

function emitSelectMenu(arr) {
    selectMenuArr.value = arr
}

</script>

<style scoped>
.my-header {
    padding: 0
}

.my-aside {
    width: auto;
}

.my-aside-width {
    width: 200px;
}
</style>