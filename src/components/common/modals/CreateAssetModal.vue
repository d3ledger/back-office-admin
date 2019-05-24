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
        <el-input
          v-model="form.privateKey"
        />
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
        ...others,
        precision: precisionFormatted,
        initialAmount: initialAmountFormatted.toString()
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
    }
  }
}
</script>

<style scoped>

</style>
