<template>
    <div class="m-4">
        <el-cascader ref="treeRef" v-model:model-value="value" :options="options" :props="props"
            @visible-change="handleFocuse" />
    </div>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue'
import * as ElementPlus from 'element-plus';

const props = { multiple: true }

const value = ref([])
const treeRef = ref<ElementPlus.CascaderInstance>()

const handleFocuse = (visible) => {
    if (visible) {
        value.value = [
            4, 5]
    }

    for (let node of treeRef.value.getCheckedNodes(false)) {
        console.log(node)
    }
}

const options = [
    {
        value: 1,
        label: 'Asia',
        children: [
            {
                value: 2,
                label: 'China',
                children: [
                    { value: 3, label: 'Beijing' },
                    { value: 4, label: 'Shanghai' },
                    { value: 5, label: 'Hangzhou' },
                ],
            },
            {
                value: 6,
                label: 'Japan',
                children: [
                    { value: 7, label: 'Tokyo' },
                    { value: 8, label: 'Osaka' },
                    { value: 9, label: 'Kyoto' },
                ],
            },
            {
                value: 10,
                label: 'Korea',
                children: [
                    { value: 11, label: 'Seoul' },
                    { value: 12, label: 'Busan' },
                    { value: 13, label: 'Taegu' },
                ],
            },
        ],
    },
]
</script>
  