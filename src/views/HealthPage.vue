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
            :body-style="{ padding: '1.5rem' }" class="fullheight">
            <div class="header">
              <span>Services health</span>
              <el-button
                class="action_button"
                @click="checkHealth"
              >
                Refresh
              </el-button>
            </div>
            <el-row>
              <el-table
                :data="healthNodes"
                class="health_table">
                <el-table-column
                  prop="title"
                  label="Title"
                  min-width="180">
                </el-table-column>
                <el-table-column
                  prop="url"
                  label="URL"
                  min-width="180">
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="Status">
                  <template slot-scope="scope">
                    {{ scope.row.status }}
                  </template>
                </el-table-column>
              </el-table>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import axios from 'axios'
import config from '@/data/config'

const healthNodes = config.healthNodes.map(n => ({ ...n, status: '' }))

export default {
  name: 'health-page',
  data () {
    return {
      healthNodes,
      refreshInterval: null
    }
  },
  methods: {
    checkHealth () {
      for (let i = 0; i < this.healthNodes.length; i++) {
        this.healthNodes[i].status = 'Checking'
        try {
          axios.get(this.healthNodes[i].url)
            .then(() => {
              this.healthNodes[i].status = 'Working'
            })
            .catch(() => {
              this.healthNodes[i].status = 'Not working'
            })
        } catch {
          this.healthNodes[i].status = 'Not working'
        }
      }
    }
  },
  created () {
    this.refreshInterval = setInterval(() => {
      this.checkHealth()
    }, 5 * 1000)
  },
  beforeDestroy () {
    clearInterval(this.refreshInterval)
    this.refreshInterval = null
  }
}
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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
.health_table >>> .el-table__header th {
  font-weight: 500;
}
.health_table >>> .el-table__row td .cell {
  color: #000000;
}

</style>
