import request from "../utils/request";

// 登录（无需鉴权验证）
export function login(data) {
    return request({
        url: "/login",
        method: "post",
        data,
    })
}

// 用户更新密码（需要验证 Token）
export function updateUserPassword(data) {
    return request({
        url: "/settings/user/update/password",
        method: "put",
        data,
    })
}

// 更新用户头像
export function updateUserAvatar(data) {
    return request({
        url: "/settings/user/update/avatar",
        method: "put",
        data,
    })
}

// 获取用户详情
export function getUserDetail(params) {
    return request({
        url: "/settings/user/get/detail",
        method: "get",
        params: params
    })
}

// 获取用户列表（get）
export function getUserList(params) {
    return request({
        url: "/settings/user/get/list",
        method: "get",
        params: params
    })
}

// 创建用户（create）
export function createUser(data) {
    return request({
        url: "/settings/user/create",
        method: "post",
        data
    })
}

// 更新用户（update）
export function updateUser(data) {
    return request({
        url: "/settings/user/update",
        method: "put",
        data
    })
}

// 删除用户
export function deleteUser(params) {
    return request({
        url: "/settings/user/delete",
        method: "delete",
        params: params
    })
}