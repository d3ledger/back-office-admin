<!--
  Copyright D3 Ledger, Inc. All Rights Reserved.
  SPDX-License-Identifier: Apache-2.0
-->
<template>
  <el-col
    :span="12"
    class="left_column fullheight"
  >
    <el-card
      :body-style="{ padding: '0' }"
      class="fullheight"
    >
      <div class="header">
        <span>Settings</span>
      </div>
      <div class="settings">
        <TimeZoneItem />
      </div>
    </el-card>
  </el-col>
</template>

<script>
import { mapActions } from 'vuex'
import { lazyComponent } from '@router'

export default {
  name: 'SettingsLeftSide',
  components: {
    TimeZoneItem: lazyComponent('Settings/components/Leftside/TimeZoneItem')
  },
  methods: {
    ...mapActions([
      'openApprovalDialog'
    ])
  }
}
</script>

<style scoped>
.header {
  padding: 1.5rem 1.5rem;
}

.settings {
  padding: 0 1.5rem;
}
</style>
