<!--
  Copyright D3 Ledger, Inc. All Rights Reserved.
  SPDX-License-Identifier: Apache-2.0
-->
<template>
  <el-container class="fullheight">
    <el-main class="fullheight">
      <el-row class="fullheight">
        <el-col
          :xs="24"
          :lg="{ span: 18, offset: 3 }"
          :xl="{ span: 16, offset: 4 }"
        >
          <el-card
            :body-style="{ padding: '0' }" class="fullheight">
            <div class="header">
              <span>Dashboard</span>
            </div>
            <div class="settings">
              <el-row class="settings_item">
                <div class="settings_item-header">
                  <span class="settings_item-header-title">Relays</span>
                    <el-button
                      class="action_button"
                      @click="isRelayFormVisible = true">Add relay
                    </el-button>
                </div>
                <div>
                  <el-row class="relay_number">
                    <p class="list-title">Free</p>
                    <el-col>
                      {{ freeRelays }}
                    </el-col>
                  </el-row>
                  <el-row class="relay_number">
                    <p class="list-title">Registered</p>
                    <el-col>
                      {{ registeredRelays }}
                    </el-col>
                  </el-row>
                </div>
              </el-row>
              <el-row class="settings_item">
                <div class="settings_item-header">
                  <span class="settings_item-header-title">Avaliable assets</span>
                    <el-button
                      data-cy="createAsset"
                      class="action_button"
                      @click="isCreateAssetModalVisible = true">Add asset
                    </el-button>
                </div>
                <div>
                  <el-row class="relay_number">
                    <p class="list-title">Iroha anchored</p>
                    <el-col>
                      <p
                        v-for="(v, i) in avaliableAssets.iroha"
                        :key="i"
                      >
                        {{ v.toUpperCase() }}
                      </p>
                    </el-col>
                  </el-row>
                  <el-row class="relay_number">
                    <p class="list-title">Ether anchored</p>
                    <el-col>
                      <p
                        v-for="(v, i) in avaliableAssets.eth"
                        :key="i"
                      >
                        {{ v.toUpperCase() }}
                      </p>
                    </el-col>
                  </el-row>
                  <el-row
                    v-if="accountAssets.length"
                    class="relay_number"
                  >
                    <p class="list-title">Others</p>
                    <el-col>
                      <p
                        v-for="(v, i) in accountAssets"
                        :key="i"
                      >
                        {{ v.assetId.toUpperCase() }} - {{ v.balance}}
                      </p>
                    </el-col>
                  </el-row>
                </div>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <el-dialog
      data-cy="isRelayFormVisible"
      title="Add new relay"
      :visible.sync="isRelayFormVisible"
      width="500px"
      center>
      <div class="approval_form-desc">
        Are you sure want to add new relay?
      </div>
      <div
        slot="footer"
        class="dialog-form_buttons-block"
      >
        <el-button
          @click="onAddRelay"
          class="dialog-form_buttons fullwidth action"
          :loading="isRelayLoading"
        >
          ADD
        </el-button>
      </div>
    </el-dialog>
    <CreateAssetModal
      :isVisible.sync="isCreateAssetModalVisible"
    />
  </el-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { lazyComponent } from '@router'

export default {
  name: 'dashboard-page',
  components: {
    CreateAssetModal: lazyComponent('common/modals/CreateAssetModal')
  },
  data () {
    return {
      isRelayFormVisible: false,
      isRelayLoading: false,

      isCreateAssetModalVisible: false
    }
  },
  methods: {
    ...mapActions([
      'getRelays',
      'getEthAssets',
      'getIrohaAssets',
      'addRelay',
      'getAccountAssets'
    ]),
    onAddRelay () {
      this.isRelayLoading = true
      this.addRelay()
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          this.isRelayLoading = false
        })
    }
  },
  computed: {
    ...mapGetters([
      'freeRelays',
      'registeredRelays',
      'avaliableAssets',
      'accountAssets'
    ])
  },
  created () {
    this.getRelays()
    this.getIrohaAssets()
    this.getEthAssets()
    this.getAccountAssets()
  }
}
</script>

<style scoped>
.header {
  padding: 1.5rem 1.5rem;
}

.card {
  margin-top: 0.5rem;
}

.settings {
  padding: 0 1.5rem;
}

.settings_item {
  margin-bottom: 20px;
}

.row_sub-header {
  margin-bottom: 10px;
}

.row_sub-header > .header_small {
  font-size: 0.8rem;
}

.settings_item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.settings_item-header-title {
  font-size: 1rem;
}

.relay_number {
  margin-bottom: 10px;
}

.list-title {
  font-size: 0.8rem;
  margin-bottom: 6px;
}

.action_button {
  border: 1px solid #000000;
  text-transform: uppercase;
  width: 7rem;
  padding: 0.5rem;
}

.approval_form-desc {
  text-align: center;
}

.action_button:active,
.action_button:focus,
.action_button:hover {
  background-color: #ffffff;
  color: #000000;
}

.action_button-icon {
  font-size: 0.7rem;
  height: 0.8rem;
  margin-left: -0.2rem;
  margin-right: 0.3rem;
}
</style>
