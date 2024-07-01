// 获取功能列表
import request from "../utils/request";

export function getFuncList() {
    return request({
        url: "/settings/func/get/list",
        method: "get",
    })
}