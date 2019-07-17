<!--
  Copyright D3 Ledger, Inc. All Rights Reserved.
  SPDX-License-Identifier: Apache-2.0
-->
<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col :span="24">
          <el-card :body-style="{ padding: '0' }">
            <div class="header">
              <span>Fee setting</span>
              <el-button
                class="action_button"
                @click="updateBillingData"
                :loading="billingDataUpdating"
              >
                Refresh
              </el-button>
            </div>
            <el-table
              :data="availableAssets"
              style="width: 100%"
            >
              <el-table-column
                label="Name"
                prop="name"
              />
              <el-table-column
                prop="id"
                label="Transfer fee"
              >
                <template slot-scope="scope">
                  {{ transferFee[scope.row.assetId] ? transferFee[scope.row.assetId].feeFraction : 0 }}
                  <el-button
                    size="mini"
                    @click="handleEdit(scope.row, FeeTypes.TRANSFER)"
                  >
                    Edit
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                prop="id"
                label="Exchange fee"
              >
                <template slot-scope="scope">
                  {{ exchangeFee[scope.row.assetId] ? exchangeFee[scope.row.assetId].feeFraction : 0 }}
                  <el-button
                    size="mini"
                    @click="handleEdit(scope.row, FeeTypes.EXCHANGE)"
                  >
                    Edit
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                prop="id"
                label="Withdrawal fee"
              >
                <template slot-scope="scope">
                  {{ withdrawalFee[scope.row.assetId] ? withdrawalFee[scope.row.assetId].feeFraction : 0 }}
                  <el-button
                    size="mini"
                    @click="handleEdit(scope.row, FeeTypes.WITHDRAWAL)"
                  >
                    Edit
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                prop="id"
                label="Custody fee"
              >
                <template slot-scope="scope">
                  {{ custodyFee[scope.row.assetId] ? custodyFee[scope.row.assetId].feeFraction : 0 }}
                  <el-button
                    size="mini"
                    @click="handleEdit(scope.row, FeeTypes.CUSTODY)"
                  >
                    Edit
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <el-dialog
      :visible.sync="setFeeFormVisible"
      data-cy="setFeeDialog"
      title="Set fee amount"
      width="450px"
      center
    >
      <el-form class="quorum_form">
        <el-form-item>
          <el-input
            v-model="$v.feeAmount.$model"
            :class="[
              _isValid($v.feeAmount) ? 'border_success' : '',
              _isError($v.feeAmount) ? 'border_fail' : ''
            ]"
            name="feeAmount"
            placeholder="0"
            type="number"
          >
          </el-input>
          <span
            v-if="_isError($v.feeAmount)"
            class="el-form-item__error"
          >{{ _showError($v.feeAmount) }}</span>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-form_buttons-block"
      >
        <el-button
          :loading="settingFee"
          type="danger"
          class="dialog-form_buttons action"
          @click="editFee"
        >
          Set
        </el-button>
        <el-button
          class="dialog-form_buttons close"
          @click="setFeeFormVisible = false"
        >
          Cancel
        </el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  _feeAmount,
  errorHandler
} from '@/components/mixins/validation'
import { required } from 'vuelidate/lib/validators'
import { FeeTypes } from '@/data/consts'

export default {
  name: 'FeePage',
  mixins: [
    errorHandler
  ],
  validations () {
    return {
      feeAmount: {
        required,
        _feeAmount
      }
    }
  },
  data () {
    return {
      billingDataUpdating: false,
      setFeeFormVisible: false,
      feeAmount: 0,
      assetToSet: null,
      settingFee: false,
      feeType: '',
      FeeTypes
    }
  },
  computed: {
    ...mapGetters([
      'availableAssets',
      'transferFee',
      'custodyFee',
      'accountCreationFee',
      'exchangeFee',
      'withdrawalFee'
    ])
  },

  created () {
    this.getFullBillingData()
  },

  methods: {
    ...mapActions([
      'setFee',
      'getFullBillingData',
      'openApprovalDialog'
    ]),

    updateBillingData () {
      this.billingDataUpdating = true
      this.getFullBillingData().finally(() => {
        this.billingDataUpdating = false
      })
    },

    handleEdit (asset, feeType) {
      let billingData = {}
      switch (feeType) {
        case FeeTypes.TRANSFER: billingData = this.transferFee; break
        case FeeTypes.CUSTODY: billingData = this.custodyFee; break
        case FeeTypes.WITHDRAWAL: billingData = this.withdrawalFee; break
        case FeeTypes.EXCHANGE: billingData = this.exchangeFee; break
      }
      this.feeAmount = billingData[asset.assetId] ? billingData[asset.assetId].feeFraction : 0
      this.assetToSet = asset
      this.setFeeFormVisible = true
      this.feeType = feeType
    },

    editFee () {
      this.$v.feeAmount.$touch()
      if (this.$v.feeAmount.$invalid) return

      this.openApprovalDialog()
        .then(privateKeys => {
          if (!privateKeys) return

          this.settingFee = true
          return this.setFee({
            privateKeys,
            asset: this.assetToSet.billingId,
            amount: this.feeAmount,
            type: this.feeType
          })
            .then(() => {
              this.getFullBillingData()
              this.$message.success('Fee successfully setted. Information will be updated soon.')
            })
            .catch((err) => {
              this.$message.error('Failed to set fee')
              console.error(err)
            })
        })
        .finally(() => {
          this.feeAmount = 0
          this.assetToSet = null
          this.settingFee = false
          this.setFeeFormVisible = false
        })
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem;
}
.action_button {
  border: 1px solid #000000;
  text-transform: uppercase;
  width: 7rem;
  padding: 0.5rem;
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
