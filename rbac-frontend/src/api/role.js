import request from "../utils/request";

// 获取角色列表（get）
export function getRoleList(params) {
    return request({
        url: "/settings/role/get/list",
        method: "get",
        params: params,
    })
}

// 创建角色（create）
export function createRole(data) {
    return request({
        url: "/settings/role/create",
        method: "post",
        data
    })
}

// 更新角色（update）
export function updateRole(data) {
    return request({
        url: "/settings/role/update",
        method: "put",
        data
    })
}

// 删除角色（delete）
export function deleteRole(params) {
    return request({
        url: "/settings/role/delete",
        method: "delete",
        params: params,
    })
}

// 更新角色admin状态（update）
export function updateRoleAdmin(data) {
    return request({
        url: "/settings/role/update/admin",
        method: "put",
        data
    })
}

// 获取角色详情（get）
export function getRoleDetail(params) {
    return request({
        url: "/settings/role/get/detail",
        method: "get",
        params: params,
    })
}

