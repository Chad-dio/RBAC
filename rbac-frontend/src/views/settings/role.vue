<template>
    <main>
        <el-row style="margin-bottom: 10px;">
            <el-col :span="2">
                <el-button @click="showRoleDialog('create', null)" size="large" type="primary"
                    style="width: 100%">创建角色</el-button>
            </el-col>
            <el-col :span="6" style="margin: 0px 15px 0px 15px;">
                <el-input size="large" v-model="keyword" placeholder="请输入角色名称" />
            </el-col>
            <el-col :span="2">
                <el-button @click="getRoleList" size="large" type="primary" :icon="Search">搜索</el-button>
            </el-col>
        </el-row>

        <el-table :data="roles" style="width: 100%">
            <el-table-column prop="name" label="角色名称" />
            <el-table-column prop="sort" label="角色排序" />
            <el-table-column label="管理员权限">
                <template #default="scope">
                    <!-- bind: 确保:before-change正确获取传入的this当前的上下文，修改实际变量的值 -->
                    <!-- v-model:绑定会更改字段为string，v-model.number 可以转为数字，但这里绑定is_admin全都是0（设置了active-value="1"等没用） -->
                    <!-- 所以改为了添加一个bool变量用于绑定标识是否是管理 -->
                    <el-switch v-model="scope.row.is_admin_bool" inline-prompt
                        :before-change="handleRoleAdminState.bind(this, scope.row)" active-text="是" inactive-text="否" />
                </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" />
            <el-table-column prop="updated_at" label="更新时间" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button @click="showRoleDialog('edit', scope.row)" size="small">编辑</el-button>
                    <el-button @click="confirmDeleteRole(scope.row)" type="danger" size="small">删除</el-button>
                </template>
            </el-table-column>


        </el-table>

        <div class="my-pagination-block">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="size"
                :page-sizes="[1, 5, 10, 20, 30, 50, 100]" background layout="sizes, prev, pager, next" :total="rolesCnt"
                @size-change="getRolesList" @current-change="getRolesList" />
        </div>

        <el-dialog @close="closeRoleDialog" v-model="roleDialogVisible"
            :title="roleDialogType === 'create' ? '创建角色' : '编辑角色'" width="30%">
            <el-form label-width="90px" ref="ruleFormRef" :model="roleSingle">
                <el-form-item prop="name" label="角色名称" :rules="roleSingleRules.name">
                    <el-input placeholder="请输入角色名称" v-model="roleSingle.name"></el-input>
                </el-form-item>
                <el-form-item prop="sort" label="角色排序">
                    <el-input-number v-model="roleSingle.sort" />
                </el-form-item>
                <el-form-item prop="is_admin" label="管理员">
                    <el-switch v-model="roleSingle.is_admin_bool" inline-prompt active-text="是" inactive-text="否" />
                </el-form-item>
                <el-form-item label="菜单">
                    <el-cascader ref="menuTreeRef" v-model="modelMenuIdentitys" :options="menus" :props="props"
                        collapse-tags collapse-tags-tooltip clearable />
                </el-form-item>
            </el-form>

            <template #footer>
                <span>
                    <el-button @click="roleDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmSaveRole(ruleFormRef)">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </main>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { getMenuList } from "@/api/menu"
import { getRoleList, createRole, updateRole, deleteRole, updateRoleAdmin, getRoleDetail } from "@/api/role"

import type { FormInstance } from "element-plus";
import * as ElementPlus from 'element-plus';
const { ElMessage, ElMessageBox } = ElementPlus
import { Search } from '@element-plus/icons-vue'

const props = { multiple: true, value: 'identity', label: 'name', children: "sub_menus" }


const ruleFormRef = ref<FormInstance>()
const roleSingleRules = reactive({
    name: {
        required: true,
        message: "角色名称不为空",
        trigger: 'blur',
    },
})

const menuTreeRef = ref<ElementPlus.CascaderInstance>()

let menus = ref()
let roles = ref()
let rolesCnt = ref(0)
let keyword = ref()
let currentPage = ref(1)
let size = ref(10)
let map_menu = new Map<string, number>() // {identity: crud}
let modelMenuIdentitys = ref([]) // 绑定在菜单cascader显示

let roleDialogVisible = ref(false)
let roleDialogType = ref()
let roleSingle = ref({
    identity: "",
    name: "",
    sort: 0,
    is_admin: 0,
    is_admin_bool: false,
    map_menu_str: "",
})

const mapToStr = () => {
    roleSingle.value.map_menu_str = JSON.stringify([...map_menu]) // 直接序列化 map 不行
}
const strToMap = () => {
    map_menu = JSON.parse(roleSingle.value.map_menu_str) // 序列化后是个 object {}
}

// 点击编辑后，获取下来的实际菜单（无CRUD，因为是获取用户详情返回的，而不是获取菜单）的crud值，转为（CRUD菜单）的identity，存入map_menu这个object
const crudToIdentity = () => {
    let tmp = []
    for (let identity in map_menu) {
        let crud = map_menu[identity]
        if (crud > 0) {
            // 使用crud判断是否是一个二级菜单，这里依赖于创建角色时，如果是一级菜单，那么crud值默认是0
            let subIdentity
            for (let i = 0; i < 4; i++) {
                if (crud >> i & 1) {
                    subIdentity = identity + (1 << i).toString()
                    tmp.push(subIdentity)
                }
            }
        }
    }
    for (let v of tmp) {
        map_menu[v] = 0
    }
}

// 编辑时，获取完 role 数据后，执行cascader绑定数据modelMenuIdentitys的填充
const visibleChange = () => {
    crudToIdentity() // map_menu存有所有菜单（包含CRUD）的identity

    for (let identity in map_menu) {
        modelMenuIdentitys.value.push(identity) // 存入绑定的数据中
    }
}

// 点击创建、更新角色的确认前先执行，用于获取当前所有菜单的identity，存入 map_menu 中，[identity: crud]
// 通过 level 判断节点层级，仅有一级节点（空一级节点，没有子节点）那么默认crud是0
// 二级节点一旦有，默认都会包含三级的 CRUD 节点
const setMenuMap = () => {
    map_menu = new Map<string, number>()
    roleSingle.value.map_menu_str = ""

    // false 但获取不到存在子节点的第一、二级节点。所以在 level 为 3 中直接处理
    for (let node of menuTreeRef.value.getCheckedNodes(false)) {
        console.log(node)

        if (node.level === 3) {
            // crud 节点
            // identity最后一位是crud值，拿到并添加进父节点的 map 映射（identity: crud）

            // @ts-ignore
            if (!map_menu.has(node.parent.data.identity)) {
                // 第二级
                // @ts-ignore
                map_menu.set(node.parent.data.identity, 0)
            }
            // @ts-ignore
            map_menu.set(node.parent.data.identity, map_menu.get(node.parent.data.identity) + parseInt(node.data.identity.slice(-1)))

            // @ts-ignore
            if (!map_menu.has(node.parent.parent.data.identity)) {
                // 第一级
                // @ts-ignore
                map_menu.set(node.parent.parent.data.identity, 0)
            }
        } else {
            // 一级二级节点

            // @ts-ignore
            if (!map_menu.has(node.data.identity)) {
                // @ts-ignore
                map_menu.set(node.data.identity, 0)
            }
        }
    }
    console.log(map_menu)
    mapToStr()
}

const getIsAdminBool = (isAdmin: number) => {
    return isAdmin === 1 ? true : false
}

// 拉取角色列表
const getRolesList = () => {
    getRoleList({ page: currentPage.value, size: size.value, keyword: keyword.value })
        .then((res) => {
            roles.value = res.data.roleList
            rolesCnt.value = res.data.roleListCnt // keyword 相关的所有角色数量
            // 返回的角色列表新添字段：is_admin_bool 用于绑定 el-switch
            for (let i = 0; i < roles.value.length; i++) {
                roles.value[i].is_admin_bool = getIsAdminBool(roles.value[i].is_admin)
            }
        })
        .catch(() => { })
}
getRolesList()


// 拉取菜单列表
const getMenusList = () => {
    getMenuList().then((res) => {
        menus.value = res.data.menu
    })
}
getMenusList()

const showRoleDialog = async (dialogType, row) => {
    roleDialogType.value = dialogType
    if (dialogType === "create") {
        // create
        roleSingle.value.identity = ""
    } else {
        // edit
        roleSingle.value.identity = row.identity

        // 获取用户详情，会返回用户对应实际权限菜单的{identity: crud}存为str返回前端
        getRoleDetail({ identity: row.identity })
            .then((res) => {
                roleSingle.value.name = res.data.name
                roleSingle.value.sort = res.data.sort
                roleSingle.value.is_admin = res.data.is_admin
                roleSingle.value.is_admin_bool = getIsAdminBool(res.data.is_admin)
                roleSingle.value.map_menu_str = res.data.map_menu_str

                strToMap() // str 转object
                visibleChange() // 不依赖于，cascader的visible-change。不然必须点击才能触发
            })
            .catch(() => { })

    }
    roleDialogVisible.value = true
}

const closeRoleDialog = () => {
    roleSingle.value.identity = ""
    roleSingle.value.name = ""
    roleSingle.value.sort = 0
    roleSingle.value.is_admin = 0
    roleSingle.value.is_admin_bool = false
    roleSingle.value.map_menu_str = ""

    // 清空绑定的数据
    modelMenuIdentitys.value = []
}

const handleRoleAdminState = (row) => {
    return new Promise((resolve, reject) => {
        ElMessageBox.confirm("确认修改当前角色的身份？", {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            autofocus: false,
        })
            .then(() => {
                updateRoleAdmin({ identity: row.identity, is_admin: row.is_admin_bool ? 0 : 1 })
                    .then(() => {
                        // is_admin 需要修改，el-switch中bind传入了实际的this指针，row修改会同步
                        row.is_admin = row.is_admin_bool ? 1 : 0
                        ElMessage.success("修改成功")
                        resolve(true)
                    })
                    .catch(() => {
                        reject(false)
                    })
                resolve(true)
            })
            .catch(() => {
                reject(false)
            })
    })
}

const confirmSaveRole = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            // 记得更新进is_admin
            roleSingle.value.is_admin = roleSingle.value.is_admin_bool ? 1 : 0

            // getCheckedNodes (false, true) 获取当前所有有标记的节点(包括半选)
            // roleSingle.value.menu_identities = menusTreeRef.value!.getCheckedNodes(false, true).map(item => item.identity)

            if (roleSingle.value.identity) {
                // edit: 更新
                setMenuMap()
                updateRole(roleSingle.value)
                    .then((res) => {
                        ElMessage({
                            message: res.msg,
                            type: "success",
                            duration: 2 * 1000,
                        })
                        roleDialogVisible.value = false
                        getRoleList()
                    })
                    .catch(() => { })
            } else {
                // create: 创建
                setMenuMap()
                createRole(roleSingle.value)
                    .then((res) => {
                        ElMessage({
                            message: res.msg,
                            type: "success",
                            duration: 2 * 1000,
                        })
                        roleDialogVisible.value = false
                        getRoleList()
                    })
                    .catch(() => { })
            }
        }
    })
}


const confirmDeleteRole = (row) => {
    ElMessageBox.confirm("确认删除？", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        autofocus: false,
    }).then(() => {
        deleteRole({ identity: row.identity }).then((res) => {
            ElMessage({
                message: res.msg,
                type: "success",
                duration: 2 * 1000,
            })
            getRoleList()
        }).catch(() => { })
    }).catch(() => { })
}

</script>

<style scoped>
.my-pagination-block {
    margin: 15px;
}
</style>