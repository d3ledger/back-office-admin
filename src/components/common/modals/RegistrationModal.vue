<!--
  Copyright D3 Ledger, Inc. All Rights Reserved.
  SPDX-License-Identifier: Apache-2.0
-->
<template>
  <el-dialog
    title="Create new account"
    :visible="registrationDialogVisible"
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
        label="Registration IP"
        prop="nodeIp"
      >
        <el-select
          v-model="$v.form.nodeIp.$model"
          :disabled="isLoading"
          :class="[
            'auth-form_select',
            _isValid($v.form.nodeIp) ? 'border_success' : '',
            _isError($v.form.nodeIp) ? 'border_fail' : ''
          ]"
          style="width: 100%;"
          filterable
          allow-create
          popper-class="black-form_select-dropdown"
          @change="selectRegistrationIp"
        >
          <el-option
            v-for="node in registrationIPs"
            :key="node.value"
            :label="node.label"
            :value="node.value"
          >
            <span class="option left">{{ node.label }}</span>
            <span class="option right">{{ node.value }}</span>
          </el-option>
        </el-select>
        <span
          v-if="_isError($v.form.nodeIp)"
          class="el-form-item__error"
        >{{ _showError($v.form.nodeIp) }}</span>
      </el-form-item>
      <el-form-item
        label="Public key"
        prop="publicKey"
      >
        <el-row
          type="flex"
          justify="space-between"
        >
          <el-col :span="20">
            <el-input
              v-model="$v.form.publicKey.$model"
              :disabled="isLoading"
              :class="[
                _isValid($v.form.publicKey) ? 'border_success' : '',
                _isError($v.form.publicKey) ? 'border_fail' : ''
              ]"
              name="publicKey"
            />
          </el-col>

          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onFileChosen"
            :disabled="isLoading"
            :class="[
              'auth-form_upload',
              _isValid($v.form.publicKey) ? 'border_success' : '',
              _isError($v.form.publicKey) ? 'border_fail' : ''
            ]"
            action=""
          >
            <el-button>
              <fa-icon icon="upload" />
            </el-button>
          </el-upload>
        </el-row>
        <span
          v-if="_isError($v.form.publicKey)"
          class="el-form-item__error"
        >{{ _showError($v.form.publicKey) }}</span>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button
        @click="onSubmit"
        :loading="isLoading"
        class="fullwidth black clickable"
      >
        Add account
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import messageMixin from '@/components/mixins/message'

import { _nodeIp, _keyPattern, errorHandler } from '@/components/mixins/validation'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'RegistrationModal',
  mixins: [
    messageMixin,
    errorHandler
  ],
  validations: {
    form: {
      nodeIp: {
        required,
        _nodeIp
      },
      publicKey: {
        required: required,
        _keyPattern
      }
    }
  },
  data () {
    return {
      isLoading: false,
      predefinedDomain: 'd3',
      form: {
        nodeIp: '',
        publicKey: ''
      },
      dialogVisible: false,
      dialog: {
        privateKey: ''
      },
      downloaded: false
    }
  },
  computed: {
    ...mapGetters([
      'registrationDialogVisible',
      'registrationDialogUsername',
      'registrationIPs',
      'domain'
    ])
  },

  created () {
    this.form.nodeIp = this.registrationIPs[0].value || ''
  },

  beforeMount () {
    this.selectRegistrationIp()
  },

  methods: {
    ...mapActions([
      'setRegistrationIp',
      'signupWithKey',
      'closeRegistrationDialog'
    ]),

    selectRegistrationIp () {
      this.setRegistrationIp({ ip: this.form.nodeIp })
    },

    onFileChosen (file, fileList) {
      const reader = new FileReader()

      reader.onload = (ev) => {
        this.form.publicKey = (ev.target.result || '').trim()
        this.$v.$touch()
      }

      reader.readAsText(file.raw)
    },

    onSubmit () {
      this.$v.$touch()
      if (this.$v.$invalid) return
      this.isLoading = true

      this.selectRegistrationIp()

      this.signupWithKey({
        username: `${this.registrationDialogUsername}@${this.domain}`,
        publicKey: this.form.publicKey
      })
        .then(() => {
          this.$message.success('Success! Registration completed!')
          this.onModalClose()
        })
        .catch(err => {
          console.error(err)
          this.$_showRegistrationError(err.message, err.response)
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    onModalClose () {
      this.closeRegistrationDialog()
    }
  }
}
</script>

<style scoped>
.approval_form-item-clearm {
  margin-bottom: 1rem;
}

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

.auth-form_tag {
  width: 3.8rem;
  height: 4.5rem;
  border: solid 1px rgba(255, 255, 255, 0.4);
  background-color: #363636;
  color: #ffffff;
  padding-top: 1rem;
  text-align: center;
  text-transform: uppercase;
  font-size: 1.2rem;
  border-radius: 0.3rem;
  line-height: 2
}

.auth_whitelist {
  margin: 3rem 0 0 0;
  height: 4rem;
  overflow-y: scroll;
}

.auth_whitelist >>> .el-form-item__content {
  display: flex;
}

.auth_whitelist-tag {
  background-color: #363636;
  border: solid 1px rgba(255, 255, 255, 0.4);
  color: #ffffff;
  opacity: 0.8;
}

.auth_whitelist-tag >>> i {
  color: #ffffff;
  opacity: 0.8;
}

.auth_whitelist-tag >>> .el-icon-close:hover {
  opacity: 1;
  background-color: #505050;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.el-tag {
  margin-right: 1rem;
}

.option.left {
  float: left;
  margin-right: 10px;
  color: #ffffff;
}

.option.right {
  float: right;
  font-size: 0.8rem;
  color: #8492a6;
}

.checkbox_key {
  color: rgba(255, 255, 255, 0.4);
  background-color: #363636;
  color: rgba(255, 255, 255, 0.8);
  border: solid 1px rgba(255, 255, 255, 0.4);
  font-weight: 700;
  height: 4.5rem;
  padding-left: 1.2rem;
  padding-top: 1.2rem;
  line-height: 2;
  font-size: 1rem;
}

.checkbox_key >>> .el-checkbox__label {
  font-size: 1rem;
}

.checkbox_key.is-checked {
  border-color: rgba(255, 255, 255, 0.4);
}

.checkbox_key.is-checked >>> .el-checkbox__label {
  font-size: 1rem;
  color: #ffffff;
}

.checkbox_key.is-checked >>> .el-checkbox__inner {
  background-color: #ffffff;
  border-color: #ffffff;
}

.checkbox_key.is-checked >>> .el-checkbox__inner::after {
  border-color: black;
}
</style>
