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
              <span>Reports</span>
              <el-button
                class="action_button"
                @click="isReportDialogVisible = true"
              >
                New report
              </el-button>
            </div>
            <el-row>
              <el-table
                :data="reportData"
                class="report_table"
              >
                <el-table-column
                  prop="title"
                  label="Title"
                  min-width="180">
                </el-table-column>
              </el-table>
            </el-row>
            <el-row>
              <el-pagination
                class="pagination"
                background
                :page-size="reportForm.pageSize"
                layout="prev, pager, next"
                :total="totalPages">
              </el-pagination>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <el-dialog
      title="Create new report"
      width="450px"
      :visible="isReportDialogVisible"
      @close="isReportDialogVisible = false"
      center
    >
      <el-form
        label-position="top"
      >
        <el-form-item label="Domain">
          <el-input v-model="reportForm.domain" placeholder="Ex. d3" />
        </el-form-item>
        <el-form-item label="Date">
          <el-date-picker
            v-model="reportForm.date"
            type="daterange"
            range-separator="-"
            start-placeholder="Start date"
            end-placeholder="End date"
            class="dialog_date">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-form_buttons-block"
      >
        <el-button
          class="dialog-form_buttons action"
          @click="getNewReport"
        >
          Confirm
        </el-button>
        <el-button
          class="dialog-form_buttons close"
          @click="isReportDialogVisible = false"
        >
          Cancel
        </el-button>
      </div>
    </el-dialog>
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
        pageSize: 50
      },

      reportData: [],
      totalPages: 0
    }
  },
  methods: {
    getNewReport () {
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
      const url = `${config.reportUrl}/report/billing/transferAsset`
      axios.get(`${url}?${formattedString}`)
        .then(res => {
          this.reportData = res.transfers
          this.totalPages = res.total
        })
        .catch(err => console.log(err))
        .finally(() => {
          this.isReportDialogVisible = false
          this.reportForm = {
            domain: '',
            date: [],
            pageNum: 1,
            pageSize: 50
          }
        })
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
