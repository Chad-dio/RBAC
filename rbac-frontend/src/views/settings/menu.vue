<template>
    <main>
        <el-row style="margin-bottom: 10px">
            <el-col :span="2">
                <el-button @click="showMenuDialog('create-top', null)" size="large" type="primary"
                    style="width: 100%;">新增顶层菜单</el-button>
            </el-col>
        </el-row>
        <el-table default-expand-all :data="menus" row-key="identity" :tree-props="{ children: 'sub_menus' }"
            style="width: 100%;">
            <el-table-column prop="name" label="菜单名称" />
            <el-table-column prop="web_icon" label="WebIcon" />
            <el-table-column prop="sort" label="菜单排序" />
            <el-table-column prop="level" label="菜单类型">
                <template #default="scope">
                    <span v-if="scope.row.level === 0">目录</span>
                    <span v-else-if="scope.row.level === 1">菜单</span>
                    <span v-else>按钮</span>
                </template>
            </el-table-column>
            <el-table-column prop="path" label="路径" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button v-if="scope.row.level !== 2" type="primary" size="small"
                        @click="showMenuDialog('create-sub', scope.row)">新增子级</el-button>
                    <el-button size="small" @click="showMenuDialog('edit', scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="confirmDeleteMenu(scope.row)">删除</el-button>
                </template>
            </el-table-column>

        </el-table>

        <el-dialog @close="closeMenuDialog" v-model="menuDialogVisible" :title="menuDialogType === 'edit' ? '编辑菜单' : '新增菜单'"
            width="40%">
            <el-form label-width="90px" ref="ruleFormRef" :model="menuSingle">
                <el-form-item prop="name" label="菜单名称" :rules="menuSingleRules.name">
                    <el-input v-model="menuSingle.name" placeholder="请输入菜单名称" />
                </el-form-item>
                <el-form-item prop="sort" label="菜单排序">
                    <el-input-number v-model="menuSingle.sort" :step="1" />
                </el-form-item>
                <el-form-item prop="path" label="菜单路径" :rules="menuSingleRules.path">
                    <el-input v-model="menuSingle.path" placeholder="请输入菜单路径" />
                </el-form-item>
                <el-form-item prop="web_icon" label="菜单图标">
                    <el-input v-model="menuSingle.web_icon" placeholder="请输入菜单图标" />
                </el-form-item>
                <el-form-item prop="level" label="菜单类型">
                    <el-select v-model="menuSingle.level">
                        <el-option label="目录" :value="0" />
                        <el-option label="菜单" :value="1" />
                        <!-- <el-option label="按钮" :value="2" /> -->
                    </el-select>
                </el-form-item>

            </el-form>
            <template #footer>
                <span>
                    <el-button @click="menuDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmSaveMenu(ruleFormRef)">确认</el-button>
                </span>
            </template>
        </el-dialog>

    </main>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { getMenuList, deleteMenu, addMenu, updateMenu } from "@/api/menu"

import type { FormInstance } from 'element-plus'
import * as ElementPlus from 'element-plus'

const { ElMessage, ElMessageBox } = ElementPlus

const menus = ref()

const ruleFormRef = ref<FormInstance>()
const menuSingleRules = reactive({
    name: {
        required: true,
        message: "菜单名称不能为空",
        trigger: 'blur',
    },
    path: {
        required: true,
        message: "菜单路径不能为空",
        trigger: 'blur',
    }
})

let menuDialogVisible = ref(false)
let menuDialogType = ref()
let menuSingle = ref({
    identity: "",
    parent_identity: "",
    level: 0,
    name: "",
    path: "",
    sort: 0,
    web_icon: "",
})

// 由于后端菜单返回默认添加所有crud菜单，所以在菜单界面需要剔除第三级菜单。
// 本项目，默认仅允许两级菜单
const handleCURDMenu = () => {
    menus.value.forEach(menu1 => {
        if (menu1.sub_menus.length > 0) {
            menu1.sub_menus.forEach(menu2 => {
                menu2.sub_menus = []
            })
        }
    });
}

// TODO: 菜单变更后，强制局部组件刷新，而不需要
const setMenuList = () => {
    getMenuList()
        .then((res) => {
            menus.value = res.data.menu
            handleCURDMenu()
            // 直接实时反馈前端，存储实时数据，而不依赖后端校验
            // 感觉不太行，这个本地存储的值不应该随时变动
            // localStorage.setItem('menu', JSON.stringify(res.data))
        })
        .catch(() => { })
}
setMenuList()

const closeMenuDialog = () => {
    menuSingle.value.identity = ""
    menuSingle.value.parent_identity = ""
    menuSingle.value.name = ""
    menuSingle.value.path = ""
    menuSingle.value.web_icon = ""
    menuSingle.value.sort = 0
    menuSingle.value.level = 0
}

const showMenuDialog = (dialogType, row) => {
    menuDialogType.value = dialogType

    if (dialogType === "create-top") {
        menuSingle.value.parent_identity = ""
    } else if (dialogType === "create-sub") {
        menuSingle.value.parent_identity = row.identity
    } else { // edit
        menuSingle.value.identity = row.identity
        menuSingle.value.parent_identity = row.parent_identity
        menuSingle.value.name = row.name
        menuSingle.value.path = row.path
        menuSingle.value.sort = row.sort
        menuSingle.value.web_icon = row.web_icon
        menuSingle.value.level = row.level
    }

    menuDialogVisible.value = true
}

const confirmSaveMenu = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            if (menuDialogType.value == "edit") {
                updateMenu(menuSingle.value).then((res) => {
                    ElMessage({
                        message: res.msg,
                        type: "success",
                        duration: 2 * 1000,
                    })
                    setMenuList()
                    menuDialogVisible.value = false
                }).catch(() => { })
            } else {
                addMenu(menuSingle.value).then((res) => {
                    ElMessage({
                        message: res.msg,
                        type: "success",
                        duration: 2 * 1000,
                    })
                    setMenuList()
                    menuDialogVisible.value = false
                }).catch(() => { })
            }

        }
    })
}

const confirmDeleteMenu = (row) => {
    ElMessageBox.confirm("确认删除？", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        autofocus: false,
    }).then(() => {
        deleteMenu({ identity: row.identity }).then((res) => {
            ElMessage({
                message: res.msg,
                type: "success",
                duration: 2 * 1000,
            })
            setMenuList()
        }).catch(() => { })
    }).catch(() => { })
}

</script>

<style scoped></style>