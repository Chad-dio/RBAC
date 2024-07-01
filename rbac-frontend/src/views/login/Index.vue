<template>
    <main class="main">
        <div class="box">
            <div class="title">
                权限管理系统
            </div>
            <el-form ref="ruleFormRef" :model="userForm" class="form" size="large">
                <el-form-item prop="username" :rules="userFormRules.username">
                    <el-input size="large" placeholder="请输入用户名" v-model="userForm.username" />
                </el-form-item>
                <el-form-item prop="password" :rules="userFormRules.password">
                    <el-input size="large" placeholder="请输入密码" type="password" v-model="userForm.password" />
                </el-form-item>
                <el-form-item>
                    <el-button class="default-btn" type="primary" @click="loginPassword(ruleFormRef)" size="large"
                        style="width: 100%; ">登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </main>
</template>
  
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { login, getUserDetail } from '@/api/user'
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"

const router = useRouter()
const ruleFormRef = ref<FormInstance>()
const userFormRules = reactive({
    username: [
        {
            required: true,
            message: '用户名不能为空',
            trigger: 'blur',
        },
    ],
    password: [
        {
            required: true,
            message: '密码不能为空',
            trigger: 'blur',
        },
    ]
})
let userForm = ref({
    username: "cauchy",
    password: "123"
})

// 登录界面显示前会查看当前本地的token是否存在(后续还需要对token做过期判断处理)
function judgeLoginState() {
    let token = localStorage.getItem("access_token")
    if (token != null) {
        router.push({ name: "home" })
    }
}
judgeLoginState()

const loginPassword = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            login(userForm.value)
                .then((res) => {
                    ElMessage({
                        message: res.msg,
                        type: 'success',
                        duration: 2 * 1000
                    })
                    localStorage.setItem("access_token", res.data.access_token)
                    localStorage.setItem("refresh_token", res.data.refresh_token)

                    // 登录成功后，获取一次当前用户信息
                    getUserDetail({})
                        .then((res) => {
                            let user_info = JSON.stringify(res.data)
                            localStorage.setItem("user_info", user_info)
                        })
                        .catch(() => { })

                    setTimeout(() => {
                        router.push({ name: 'home' })
                    }, 1200)
                })
                .catch(() => { })
        } else {
            console.log('error submit!')
            return false
        }
    })
}

</script>
  
<style scoped>
.title {
    width: 100%;
    height: 60px;
    line-height: 60px;
    /* padding-left: 20px; */
    font-size: 20px;

    justify-content: center;
    align-items: center;
    display: flex;
}

.main {
    width: 100vw;
    height: 100vh;
    background: url("@/assets/img/background01.jpg") no-repeat center;
    background-size: cover;
    overflow: hidden;
}

.box {
    margin: 200px auto;
    width: 400px;
    border: 1px solid #cdd0d6;
    border-radius: 10px;
    background-color: #fff;
}

.form {
    padding: 20px;
}
</style>