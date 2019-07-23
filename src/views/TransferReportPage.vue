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
            :body-style="{ padding: '1.5rem' }" class="fullheight">
            <div class="header">
              <span>Transfer report</span>
            </div>
            <div class="search">
              <el-form
                ref="form"
                :model="reportForm"
                style="width: 100%"
                @submit.native.prevent
              >
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="Domain">
                      <el-input
                        v-model="reportForm.domain"
                        placeholder="Ex. d3"
                        @input="updateReport()"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="11" :offset="1">
                    <el-form-item label="Date">
                      <el-date-picker
                        v-model="reportForm.date"
                        type="daterange"
                        range-separator="-"
                        start-placeholder="Start date"
                        end-placeholder="End date"
                        class="dialog_date"
                        @change="updateReport()"
                      >
                      </el-date-picker>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            <el-row>
              <el-table
                :data="reportData"
                class="report_table"
              >
                <el-table-column
                  prop="fromAccount"
                  label="Source account">
                </el-table-column>
                <el-table-column
                  prop="toAccount"
                  label="Destination account">
                </el-table-column>
                <el-table-column
                  prop="amount"
                  label="Amount">
                </el-table-column>
                <el-table-column
                  prop="fee"
                  label="Fee amount">
                </el-table-column>
                <el-table-column
                  prop="asset"
                  label="Asset">
                </el-table-column>
              </el-table>
            </el-row>
            <el-row>
              <el-pagination
                class="pagination"
                background
                :page-size="reportForm.pageSize"
                layout="prev, pager, next"
                :total="totalPages"
                @current-change="onNextPage"
              >
              </el-pagination>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import config from '@/data/config'
import querystring from 'querystring'

export default {
  name: 'report-page',
  data () {
    return {
      isReportDialogVisible: false,

      reportForm: {
        domain: '',
        date: [],
        pageNum: 1,
        pageSize: 10
      },

      reportData: [],
      totalPages: 0
    }
  },
  computed: {
    ...mapGetters([
      'servicesIPs'
    ])
  },
  methods: {
    onNextPage (page) {
      this.reportForm.pageNum = page
      this.updateReport()
    },
    updateReport () {
      const { date, ...params } = this.reportForm

      if (params.domain.length === 0) {
        this.$message.error('Please provide correct domain!')
        return
      }

      if (date.length < 2) {
        this.$message.error('Please select correct date!')
        return
      }

      params.from = date[0].getTime()
      params.to = date[1].getTime()
      const formattedString = querystring.stringify(params)
      const url = `${this.servicesIPs['report-service']}/report/billing/transferAsset/domain`
      axios.get(`${url}?${formattedString}`)
        .then(res => {
          this.reportData = res.data.transfers.map(item => {
            let data = {}
            data.fromAccount = item.transfer.srcAccountId
            data.toAccount = item.transfer.destAccountId
            data.asset = item.transfer.assetId
            data.amount = item.transfer.amount
            data.fee = item.fee.amount
            return data
          })
          this.totalPages = res.data.total
        })
        .catch(err => console.log(err))
    }
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
.report_table >>> .el-table__header th {
  font-weight: 500;
}
.report_table >>> .el-table__row td .cell {
  color: #000000;
}

.dialog_date {
  width: 100%;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

</style>
