<template>
  <div class="popup">
    <h1>Better CORS!</h1>
    <el-switch
      v-model="enabled"
      @change="handleSwitch"
      active-text="已启用"
      inactive-text="已禁用"
    />
    <div class="status">当前状态: {{ enabled ? "已启用" : "已禁用" }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
const enabled = ref(false);

chrome.storage.local.get(["corsEnabled"], function (res) {
  enabled.value = res.corsEnabled
});

const handleSwitch = async (value: boolean) => {
  await chrome.runtime.sendMessage(
    { type: "toggleCORS", enabled: value },
    (response) => {
      chrome.storage.local.set({ corsEnabled: value }, function () {
        ElMessage("操作成功: " + enabled.value);
      });
    }
  );
  // location.reload()
};
</script>

<style scoped>
.popup {
  width: 300px;
  padding: 16px;
}
.status {
  margin-top: 10px;
  color: #666;
}
</style>
