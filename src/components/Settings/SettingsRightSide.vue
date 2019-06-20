<!--
  Copyright D3 Ledger, Inc. All Rights Reserved.
  SPDX-License-Identifier: Apache-2.0
-->
<template>
  <el-col
    :span="12"
    class="right_column fullheight"
  >
  </el-col>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'SettingsRightSide',
  components: {
  },
  data () {
    return {
    }
  },
  methods: {
    ...mapActions([
      'openApprovalDialog'
    ]),
  }
}
</script>

<style scoped>
</style>
