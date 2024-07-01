// 获取菜单列表
import request from "../utils/request";

// 获取菜单列表（get）
export function getMenuList() {
    return request({
        url: "/settings/menu/get/list",
        method: "get",
    })
}

// 创建菜单（create）
export function addMenu(data) {
    return request({
        url: "/settings/menu/create",
        method: "post",
        data
    })
}

// 更新菜单（update）
export function updateMenu(data) {
    return request({
        url: "/settings/menu/update",
        method: "put",
        data
    })
}

// 删除菜单（delete）
export function deleteMenu(params) {
    return request({
        url: "/settings/menu/delete",
        method: "delete",
        params: params
    })
}



