<!--
  Copyright D3 Ledger, Inc. All Rights Reserved.
  SPDX-License-Identifier: Apache-2.0
-->
<template>
  <el-dialog
    title="Create asset"
    :visible="isVisible"
    @close="onModalClose"
    top="2%"
    width="500px"
    center
  >
    <el-form
      label-position="top"
      :model="form"
      class="create-asset_form"
    >
      <el-form-item
        prop="longName"
        class="approval_form-item-clearm"
        label="Long name"
      >
        <el-input
          v-model="form.longName"
          placeholder="Sora"
        />
      </el-form-item>
      <el-form-item
        prop="shortName"
        class="approval_form-item-clearm"
        label="Short name"
      >
        <el-input
          v-model="form.shortName"
          placeholder="XOR"
        />
      </el-form-item>
      <el-form-item
        prop="precision"
        class="approval_form-item-clearm"
        label="Precision"
      >
        <el-input
          type="number"
          v-model="form.precision"
        />
      </el-form-item>
      <el-form-item
        prop="assetType"
        class="approval_form-item-clearm"
        label="Asset Type"
      >
        <el-select
          class="fullwidth"
          v-model="form.assetType"
          placeholder="Select"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        prop="initialAmount"
        class="approval_form-item-clearm"
        label="Initial amount"
      >
        <el-input
          type="number"
          v-model="form.initialAmount"
        />
      </el-form-item>
      <el-form-item
        prop="privateKey"
        class="approval_form-item-clearm"
        label="Private key"
      >
        <el-row type="flex" justify="space-between">
          <el-col :span="20">
            <el-input
              name="privateKey"
              v-model="form.privateKey"
            />
          </el-col>

          <el-upload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onFileChosen"
            class="approval_form-upload"
          >
            <el-button>
              <fa-icon icon="upload" />
            </el-button>
          </el-upload>
        </el-row>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button
        @click="onCreateAsset"
        class="fullwidth black clickable"
        :loading="isCreating">ADD
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'CreateAssetModal',
  props: {
    isVisible: Boolean
  },
  data () {
    return {
      form: {
        longName: '',
        shortName: '',
        precision: 0,
        assetType: '',
        initialAmount: 0,
        privateKey: ''
      },

      options: [{
        label: 'Security',
        value: 'security'
      }, {
        label: 'Utility',
        value: 'utility'
      }, {
        label: 'Currency',
        value: 'currency'
      }, {
        label: 'Private',
        value: 'private'
      }],

      isCreating: false
    }
  },
  methods: {
    ...mapActions([
      'createAsset'
    ]),
    onCreateAsset () {
      this.isCreating = true

      const { precision, initialAmount, ...others } = this.form

      const precisionFormatted = Number(precision)
      const initialAmountFormatted = Number(initialAmount)

      if (!Number.isInteger(precisionFormatted)) {
        this.$message.error('Error! Precision should be a number!')
        return
      }

      if (!Number.isFinite(initialAmountFormatted)) {
        this.$message.error('Error! amount should be a number!')
        return
      }

      this.createAsset({
        assetType: others.assetType,
        longName: others.longName.toLowerCase(),
        shortName: others.shortName.toLowerCase(),
        precision: precisionFormatted,
        initialAmount: initialAmountFormatted.toString(),
        privateKey: others.privateKey
      })
        .then(() => {
          this.$message.success('New asset created!')
        })
        .catch((err) => {
          this.$message.error('Error! Something goes wrong!')
          console.error(err)
        })
        .finally(() => {
          this.onModalClose()
        })
    },
    onModalClose () {
      this.$emit('update:isVisible', false)
      this.isCreating = false
      this.form = {
        longName: '',
        shortName: '',
        precision: 0,
        assetType: '',
        initialAmount: 0
      }
    },
    onFileChosen (file, fileList) {
      const reader = new FileReader()

      reader.onload = (ev) => {
        this.$set(this.form, 'privateKey', (ev.target.result || '').trim())
      }

      reader.readAsText(file.raw)
    }
  }
}
</script>

<style scoped>
.approval_form-upload .el-button,
.approval_form-upload .el-button:focus {
  width: 3.8rem;
  height: 4.5rem;
  border: solid 1px #dcdfe6;
  background-color: rgba(0, 0, 0, 0.04) ;
  color: rgba(0, 0, 0, 0.2);
  padding: 0;
  font-size: 1.2rem;
  border-radius: 0.3rem;
}

.approval_form-upload .el-button:hover {
  border-color: #000000;
  color: #000000;
}

</style>
