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
              <span>D3</span>
            </div>
            <div class="settings">
              <el-row class="settings_item">
                <div class="settings_item-header">
                  <span class="settings_item-header-title">Relays</span>
                    <el-button
                      data-cy="editQuorum"
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
      <div slot="footer">
        <el-button
          @click="onAddRelay"
          class="fullwidth black clickable"
          :loading="isRelayLoading">ADD
        </el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'dashboard-page',
  data () {
    return {
      isRelayFormVisible: false,
      isRelayLoading: false
    }
  },
  methods: {
    ...mapActions([
      'getRelays',
      'addRelay'
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
      'registeredRelays'
    ])
  },
  created () {
    this.getRelays()
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
