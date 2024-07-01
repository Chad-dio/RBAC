<template>
    <main>
        <el-row style="margin-bottom: 10px;">
            <el-col :span="2">
                <el-button @click="showUserDialog('create', null)" size="large" type="primary"
                    style="width: 100%">创建用户</el-button>
            </el-col>
            <el-col :span="6" style="margin: 0px 15px 0px 15px;">
                <el-input size="large" v-model="keyword" placeholder="请输入用户名称" />
            </el-col>
            <el-col :span="2">
                <el-button @click="getUsersList" size="large" type="primary" :icon="Search">搜索</el-button>
            </el-col>
        </el-row>

        <el-table :data="users" style="width: 100%">
            <el-table-column label="用户头像">
                <template #default="scope">
                    <!-- 如果avatar为空，默认显示:icon="UserFilled" -->
                    <el-avatar :src="scope.row.avatar || null" :icon="scope.row.avatar ? '' : 'UserFilled'" />
                </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名称" />
            <el-table-column prop="role_name" label="角色名称" />
            <el-table-column prop="phone" label="手机号" />
            <el-table-column prop="created_at" label="创建时间" />
            <el-table-column prop="updated_at" label="更新时间" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button @click="showUserDialog('edit', scope.row)" size="small">编辑</el-button>
                    <el-button @click="confirmDeleteUser(scope.row)" type="danger" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="my-pagination-block">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="size"
                :page-sizes="[1, 5, 10, 20, 30, 50, 100]" background layout="sizes, prev, pager, next" :total="usersCnt"
                @size-change="getUsersList" @current-change="getUsersList" />
        </div>

        <el-dialog @close="closeUserDialog" v-model="userDialogVisible"
            :title="userDialogType === 'create' ? '创建用户' : '编辑用户'" width="30%">
            <el-form label-width="60px" ref="ruleFormRef" :model="userSingle">
                <el-form-item prop="username" label="名称" :rules="userSingleRules.username">
                    <el-input placeholder="请输入用户名称" v-model="userSingle.username"></el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <el-input type="password" placeholder="请输入用户密码" v-model="userSingle.password"></el-input>
                </el-form-item>
                <el-form-item prop="phone" label="手机号">
                    <el-input maxlength="11" placeholder="请输入用户手机号" v-model="userSingle.phone"></el-input>
                </el-form-item>
                <el-form-item prop="role_identity" label="角色" :rules="userSingleRules.role_identity">
                    <el-select v-model="userSingle.role_identity" remote filterable reserve-keyword placeholder="请选择角色"
                        :remote-method="getRolesList">
                        <el-option v-for="item in roles" :key="item.identity" :label="item.name" :value="item.identity" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <span>
                    <el-button @click="userDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmSaveUser(ruleFormRef)">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </main>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { getRoleList } from "@/api/role"
import { getUserList, createUser, updateUser, deleteUser } from "@/api/user"

import type { FormInstance } from "element-plus";
import * as ElementPlus from 'element-plus';
const { ElMessage, ElMessageBox } = ElementPlus
import { Search } from '@element-plus/icons-vue'

const ruleFormRef = ref<FormInstance>()
const userSingleRules = reactive({
    username: {
        required: true,
        message: "用户名称不能为空",
        trigger: 'blur',
    },
    role_identity: {
        required: true,
        message: "角色名称不能为空",
        trigger: 'blur',
    }
})

let roles = ref()
let users = ref()
let usersCnt = ref(0)
let keyword = ref()
let currentPage = ref(1)
let size = ref(10)

let userDialogVisible = ref(false)
let userDialogType = ref()
let userSingle = ref({
    username: "",
    identity: "",
    role_name: "",
    role_identity: "",
    password: "",
    phone: "",
    avatar: "",
})

const getRolesList = () => {
    // 获取前 100 角色列表
    getRoleList({ page: 1, size: 100, keyword: "" })
        .then((res) => {
            roles.value = res.data.roleList
        })
        .catch(() => { })
}

const getUsersList = () => {
    getUserList({ page: currentPage.value, size: size.value, keyword: keyword.value })
        .then((res) => {
            users.value = res.data.userList
            usersCnt.value = res.data.userListCnt
        })
        .catch(() => { })
}
getUsersList()

const showUserDialog = (dialogType, row) => {
    userDialogType.value = dialogType
    if (dialogType === "create") {
        userSingle.value.identity = ""
    } else {
        userSingle.value.username = row.username
        userSingle.value.identity = row.identity
        userSingle.value.role_name = row.role_name
        userSingle.value.role_identity = row.role_identity
        userSingle.value.phone = row.phone
        userSingle.value.avatar = row.avatar

    }
    userDialogVisible.value = true
}

const closeUserDialog = () => {
    userSingle.value.username = ""
    userSingle.value.identity = ""
    userSingle.value.role_name = ""
    userSingle.value.role_identity = ""
    userSingle.value.password = ""
    userSingle.value.phone = ""
    userSingle.value.avatar = ""
}

const confirmSaveUser = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            if (!userSingle.value.identity) {
                // create
                createUser(userSingle.value)
                    .then((res) => {
                        ElMessage({
                            message: res.msg,
                            type: "success",
                            duration: 2 * 1000,
                        })
                        userDialogVisible.value = false
                        getUserList()
                    })
                    .catch(() => { })
            } else {
                // edit
                updateUser(userSingle.value)
                    .then((res) => {
                        ElMessage({
                            message: res.msg,
                            type: "success",
                            duration: 2 * 1000,
                        })
                        userDialogVisible.value = false
                        getUserList()
                    })
                    .catch(() => { })
            }
        }
    })
}

const confirmDeleteUser = (row) => {
    ElMessageBox.confirm("确认删除？", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        autofocus: false,
    }).then(() => {
        deleteUser({ identity: row.identity }).then((res) => {
            ElMessage({
                message: res.msg,
                type: "success",
                duration: 2 * 1000,
            })
            getUserList()
        }).catch(() => { })
    }).catch(() => { })
}


</script>

<style scoped>
.my-pagination-block {
    margin: 15px;
}
</style>