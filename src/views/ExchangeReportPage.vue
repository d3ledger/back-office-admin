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
              <span>Exchange report</span>
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
              <el-tabs type="card">
                <el-tab-pane label="By user">
                  <el-row>
                    <el-table
                      :data="reportByUser"
                      class="report_table"
                    >
                      <el-table-column
                        prop="offerAccount"
                        label="Offeraccount">
                      </el-table-column>
                      <el-table-column
                        prop="offerAmount"
                        label="Offer amount">
                      </el-table-column>
                      <el-table-column
                        prop="offerFee"
                        label="Offer fee">
                      </el-table-column>
                      <el-table-column
                        prop="Offer asset"
                        label="Account">
                      </el-table-column>
                      <el-table-column
                        prop="requestAccount"
                        label="Request account">
                      </el-table-column>
                      <el-table-column
                        prop="requestAmount"
                        label="request amount">
                      </el-table-column>
                      <el-table-column
                        prop="requestFee"
                        label="Request fee">
                      </el-table-column>
                      <el-table-column
                        prop="requestAsset"
                        label="Request asset">
                      </el-table-column>
                    </el-table>
                  </el-row>
                  <el-row>
                    <el-pagination
                      class="pagination"
                      background
                      :page-size="reportForm.pageSize"
                      layout="prev, pager, next"
                      :total="total"
                    >
                    </el-pagination>
                  </el-row>
                </el-tab-pane>
                <el-tab-pane label="By asset">
                  <el-table
                    :data="reportByAsset"
                    class="report_table"
                  >
                    <el-table-column
                      prop="0"
                      label="Asset"
                      min-width="180">
                    </el-table-column>
                    <el-table-column
                      prop="1"
                      label="Fee amount"
                      min-width="180">
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
              </el-tabs>
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

      reportByUser: [],
      reportByAsset: [],
      totalPages: 0,
      total: 0
    }
  },
  methods: {
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

      params.from = date[0].getTime()
      params.to = date[1].getTime()

      const url = `${config.reportUrl}/report/billing/exchange/domain`
      const formattedString = querystring.stringify(params)

      axios.get(`${url}?${formattedString}`)
        .then(res => {
          this.reportByUser = res.data.batches.map(item => {
            const data = {}
            data.offerAccount = item.transactions[0].creatorId
            data.offerFee = item.transactions[0].commands[0].amount
            data.offerAmount = item.transactions[0].commands[1].amount
            data.offerAsset = item.transactions[0].commands[1].assetId
            data.requestAccount = item.transactions[0].commands[1].destAccountId
            data.requestFee = item.transactions[1].commands[0].amount
            data.requestAmount = item.transactions[1].commands[1].amount
            data.requestAsset = item.transactions[1].commands[1].assetId
            return data
          })

          this.totalPages = res.data.pages
          this.total = res.data.total
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

.asset-name {
  font-weight: 500;
  text-transform: uppercase;
}

</style>
