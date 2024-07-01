<template>
    <el-dropdown-item @click="logout" divided>退出登录</el-dropdown-item>
</template>
  
<script lang="ts" setup>
import { ElMessageBox } from "element-plus";

const logout = () => {
    ElMessageBox.confirm("确认退出？", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        autofocus: false
    }).then(() => {
        // 清除用户信息
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("access_token")
        localStorage.removeItem("user_info")
        localStorage.removeItem("menu")
        // 跳转到登录页
        window.location.href = "/login"
    }).catch(() => { })
}
</script>
  
<style scoped></style>