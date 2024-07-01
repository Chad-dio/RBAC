<template>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false" @select="handleSelect">

        <el-menu-item class="my-state" index="0" @click="changeCollapseState">
            <el-icon>
                <Fold v-if="!collapse" />
                <Expand v-else />
            </el-icon>
        </el-menu-item>

        <span class="my-menu-name" v-for="(menuName, index) in route.matched" v-show="index !== 0"
            :key="menuName.path">/&nbsp;{{
                menuName.name === 'Index' ? "首页" : menuName.name }}</span>

        <div class="flex-grow" />

        <div class="my-avatar">
            <el-avatar :src="user_info.avatar || null" :icon="user_info.avatar ? '' : 'UserFilled'" />
        </div>

        <el-dropdown :hide-on-click="false">
            <span class="my-dropdown-link">
                {{ user_info.username }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="changeAvatarDialogVisible = true">修改头像</el-dropdown-item>
                    <el-dropdown-item @click="changePasswordDialogVisible = true">修改密码</el-dropdown-item>
                    <Logout />
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </el-menu>

    <div class="my-line-box" v-if="store.tags.length > 0">
        <el-tag v-for="tag in store.tags" closable class="my-tag" :key="tag.path" @close="tagCloseHandle(tag)"
            @click="toPathHandle(tag)" :effect="tag.path === route.path ? 'dark' : 'plain'">
            {{ tag.name }}
        </el-tag>
    </div>

    <el-dialog @close="closeChangeAvatarDialog" v-model="changeAvatarDialogVisible" title="修改头像" width="30%">
        <el-form label-width="80px" ref="ruleFormRef" :model="avatarForm">
            <el-form-item prop="avatar" label="图片链接" :rules="avatarFormRules.avatar">
                <el-input placeholder="请输入图片URL" v-model="avatarForm.avatar" />
            </el-form-item>
            <span style="color: red;">
                ！暂不支持上传本地图片资源
            </span>
        </el-form>

        <template #footer>
            <span>
                <el-button @click="changeAvatarDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="changeAvatarConfirm(ruleFormRef)">确认</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog @close="closeChangePasswordDialog" v-model="changePasswordDialogVisible" title="修改密码" width="30%">
        <!-- label-width: 右对齐label字段 -->
        <el-form label-width="80px" ref="ruleFormRef" :model="passwordForm">
            <el-form-item prop="oPassword" label="旧密码" :rules="passwordFromRules.oPassword">
                <el-input placeholder="请输入旧密码" v-model="passwordForm.oPassword" type="password" />
            </el-form-item>
            <el-form-item prop="password" label="新密码" :rules="passwordFromRules.password">
                <el-input placeholder="请输入新密码" v-model="passwordForm.password" type="password" />
            </el-form-item>
            <el-form-item prop="confirm_password" label="确认密码" :rules="passwordFromRules.confirm_password">
                <el-input placeholder="请确认密码" v-model="passwordForm.confirm_password" type="password" />
            </el-form-item>
        </el-form>

        <template #footer>
            <span>
                <el-button @click="changePasswordDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="changePasswordConfirm(ruleFormRef)">确认</el-button>
            </span>
        </template>
    </el-dialog>
</template>
  
<script lang="ts" setup>
import Logout from '@/views/login/Logout.vue'
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router';
import router from '@/router';
import { useStore } from '@/store'
import { updateUserPassword, updateUserAvatar, getUserDetail } from '@/api/user'

import type { FormInstance } from 'element-plus';
import * as ElementPlus from 'element-plus';
const { ElMessage } = ElementPlus

const route = useRoute()
const store = useStore()

// @ts-ignore
let props = defineProps(['selectMenuArr'])
let emits = defineEmits(['emit-collapse-state'])
let user_info = JSON.parse(localStorage.getItem("user_info"))

let collapse = ref(false)
const activeIndex = ref('1')
const changePasswordDialogVisible = ref(false)
const changeAvatarDialogVisible = ref(false)

const ruleFormRef = ref<FormInstance>()
const passwordFromRules = reactive({
    oPassword: {
        required: true,
        message: "旧密码不能为空",
        trigger: 'blur',
    },
    password: {
        required: true,
        message: "新密码不能为空",
        trigger: 'blur',
    },
    confirm_password: {
        required: true,
        message: "确认密码不能为空",
        trigger: 'blur',
    }
})
let passwordForm = ref({
    oPassword: "",
    password: "",
    confirm_password: "",
})

const avatarFormRules = reactive({
    avatar: {
        required: true,
        message: "图片URL不能为空",
        trigger: 'blur',
    }
})
let avatarForm = ref({
    avatar: "",
})

// 关闭dialog清空表单数据
const closeChangePasswordDialog = () => {
    passwordForm.value.oPassword = ""
    passwordForm.value.password = ""
    passwordForm.value.confirm_password = ""
}

const changePasswordConfirm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            if (passwordForm.value.password !== passwordForm.value.confirm_password) {
                ElMessage({
                    message: "两次密码输入不一致",
                    type: "error",
                })
                return
            }
            if (passwordForm.value.oPassword === passwordForm.value.password) {
                ElMessage({
                    message: "新密码不可与旧密码相同",
                    type: "error",
                })
                return
            }
            updateUserPassword(passwordForm.value).then((res) => {
                ElMessage({
                    message: res.msg,
                    type: 'success',
                    duration: 2 * 1000
                })
            }).catch(() => { })
            changePasswordDialogVisible.value = false
        } else {
            console.log('error submit!')
            return false
        }
    })
}

const closeChangeAvatarDialog = () => {
    avatarForm.value.avatar = ""
}

const changeAvatarConfirm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            updateUserAvatar(avatarForm.value)
                .then((res) => {
                    ElMessage({
                        message: res.msg,
                        type: 'success',
                        duration: 2 * 1000
                    })
                    // 头像修改成功后，重新获取用户信息
                    getUserDetail({})
                        .then((res) => {
                            let userInfo = JSON.stringify(res.data)
                            localStorage.setItem("user_info", userInfo)
                            user_info = JSON.parse(userInfo)
                        })
                        .catch(() => { })
                })
                .catch(() => { })
            changeAvatarDialogVisible.value = false
        } else {
            console.log('error submit!')
            return false
        }
    })
}


// 思考：为什么只有这个按钮icon能响应这个函数呢？
const handleSelect = (key, keyPath) => {
    console.log(key, keyPath)
}

const changeCollapseState = () => {
    collapse.value = !collapse.value
    emits('emit-collapse-state', collapse.value)
}

const tagCloseHandle = (tag) => {
    let index = store.tags.findIndex(item => item.path == tag.path)
    store.tags.splice(index, 1)
}

const toPathHandle = (tag) => {
    router.push(tag.path)
}

watch(() => route.path, (path) => {
    let index = store.tags.findIndex(item => item.path == path)
    if (index == -1) {
        let name = route.matched[route.matched.length - 1].name
        if (name == 'Index') {
            name = '首页'
        }
        store.tags.push({
            path: path,
            name: name
        })
    }
}, { immediate: true }) // 强制立即监听

</script>
  
<style scoped>
.flex-grow {
    flex-grow: 1;
}

.my-state {
    padding: 20px;
    margin-right: 20px;
}

.my-tag {
    margin-right: 12px;
    cursor: pointer;
}


.my-menu-name {
    color: #97a8be;
    font-size: 14px;
    padding-right: 10px;
    line-height: 55px;
}

.my-dropdown-link {
    align-items: center;
    display: flex;
}

.my-dropdown-link:focus-visible {
    outline: unset;
}

.my-dropdown-link:hover {
    cursor: pointer;
}

.my-line-box {
    padding: 10px;
    border-bottom: solid 1px var(--el-menu-border-color);
}

.my-avatar {
    /* cursor: pointer; */
    border-radius: 100%;
    margin: 7px 10px 5px;
}
</style>