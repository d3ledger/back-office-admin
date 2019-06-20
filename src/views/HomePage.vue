<!--
  Copyright D3 Ledger, Inc. All Rights Reserved.
  SPDX-License-Identifier: Apache-2.0
-->
<template>
  <el-container>
    <Menu />
    <el-main style="width: 100%; height: 100vh; padding: 0; padding-left: 62px;">
      <router-view />
    </el-main>
    <confirm-modal />
  </el-container>
</template>

<script>
import { lazyComponent } from '@router'

export default {
  name: 'home-page',
  components: {
    Menu: lazyComponent('Home/Menu'),
    ConfirmModal: lazyComponent('common/modals/ConfirmModal')
  },
  data () {
    return {}
  }
}
</script>

<style>

.item__private-keys {
  width: 40px;
  height: 40px;
  border-radius: 24px;
  border: solid 1px #cccccc;
  display: flex;
  justify-content: center;
}

.item__private-keys-success {
  border: solid 1px #67c23a;
}

/* in order not to make a border green when a private key is empty */
.el-form-item.is-success .el-input.is-empty .el-input__inner {
  border-color: #dcdfe6;
}
.approval_form-desc {
  text-align: center;
}
</style>

<style scoped>
.exchange_form >>> .el-form-item__label::before,
.approval_form >>> .el-form-item__label::before {
  content: '';
}
</style>
