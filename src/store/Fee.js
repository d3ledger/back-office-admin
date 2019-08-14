/*
 * Copyright D3 Ledger, Inc. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import Vue from 'vue'
import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import concat from 'lodash/fp/concat'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import flatten from 'lodash/fp/flatten'
import { grpc } from '@improbable-eng/grpc-web'
import irohaUtil from '@util/iroha'
import notaryUtil from '@util/notary-util'
import collectorUtil from '@util/collector-util'
import billingUtil from '@util/billing-util'
import { FeeTypes } from '@data/consts'

// TODO: Move it into notary's API so we have the same list
const ASSETS = require('@util/crypto-list.json')

// TODO: Need to create file where we can store such variables
const DOMAIN_KEY = {
  security: 'securities',
  currency: 'currencies',
  utility: 'utilityAssets',
  private: 'privateAssets'
}

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET',
    'SET_NOTARY_IP'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'GET_ACCOUNT_ASSETS',
  'GET_CUSTOM_ASSETS',
  'SET_FEE',
  'GET_FULL_BILLING_DATA',
  'CHECK_TRANSFER_BILLING_ACCOUNT',
  'CHECK_CUSTODY_BILLING_ACCOUNT',
  'CHECK_WITHDRAWAL_BILLING_ACCOUNT',
  'CHECK_ACCOUNT_CREATION_BILLING_ACCOUNT',
  'CHECK_EXCHANGE_BILLING_ACCOUNT'
])

function initialState () {
  return {
    assets: [],
    customAssets: {},
    transferFee: {},
    custodyFee: {},
    accountCreationFee: {},
    exchangeFee: {},
    withdrawalFee: {},
    domain: 'd3',
    transferBillingAccountExists: false,
    custodyBillingAccountExists: false,
    exchangeBillingAccountExists: false,
    accountCreationBillingAccountExists: false,
    withdrawalBillingAccountExists: false
  }
}

const state = initialState()

const getters = {
  // TODO: Need to update this function due to all avaliable token already safed in iroha
  // TODO: Create more effective way to handle custom tokens
  wallets (state, getters) {
    const wallets = state.assets.map(a => {
      // TODO: it is to get asset's properties (e.g. color) which cannot be fetched from API.
      const assetParts = a.assetId.split('#')
      const assetName = assetParts[0].toLowerCase()

      const wallet = {
        id: a.assetId.replace(/#/g, '$'),
        assetId: a.assetId,
        domain: assetParts[1],
        amount: a.balance,
        billingId: a.assetId.replace(/#/g, '__')
      }

      const ASSET = ASSETS.find(d =>
        d.name.toLowerCase() === assetName || d.asset.toLowerCase() === assetName)

      if (ASSET) {
        return {
          ...wallet,
          name: ASSET.name,
          asset: ASSET.asset,
          color: ASSET.color,
          precision: ASSET.precision
        }
      }

      const DOMAIN_ASSETS = getters.getCustomAssetsByDomain(
        assetParts[1]
      )

      if (DOMAIN_ASSETS) {
        const customAssetName = Object.keys(DOMAIN_ASSETS)
          .find(key => DOMAIN_ASSETS[key] === assetParts[0])

        return {
          ...wallet,
          name: customAssetName,
          asset: assetParts[0],
          color: '#434343',
          precision: 5
        }
      }
    })

    return wallets.filter(Boolean)
  },

  getCustomAssetsByDomain: (state) => (domain) => {
    return state.customAssets[DOMAIN_KEY[domain]]
  },

  getCustomAssets (state) {
    return state.customAssets
  },

  availableAssets (state, getters) {
    const avaliable = ASSETS
      .map(t => {
        const isERC20 = !t.asset.match(/^(BTC|XOR|ETH)$/)
        if (isERC20) {
          return {
            id: `${t.name.toLowerCase()}$d3`,
            assetId: `${t.asset.toLowerCase()}#d3`,
            billingId: `${t.asset.toLowerCase()}__d3`,
            domain: 'd3',

            name: t.name,
            asset: t.asset
          }
        } else {
          let name = t.name.toLowerCase()
          let domain = ''
          switch (t.asset) {
            case 'ETH':
              domain = 'ethereum'
              break
            case 'BTC':
              // This is because in our system name of Bitcoin is BTC 🤪
              name = t.asset.toLowerCase()
              domain = 'bitcoin'
              break
            case 'XOR':
              name = t.asset.toLowerCase()
              domain = 'sora'
              break
            default:
              throw new Error('Undefined asset! Please check availableAssets method!')
          }
          return {
            id: `${name}$${domain}`,
            assetId: `${name}#${domain}`,
            billingId: `${name}__${domain}`,
            domain: domain,

            name: t.name,
            asset: t.asset
          }
        }
      })

    const customAssets = [
      'security',
      'currency',
      'utility',
      'private'
    ].map(domain => {
      const DOMAIN_ASSETS = getters.getCustomAssetsByDomain(
        domain
      )

      if (DOMAIN_ASSETS) {
        return Object.keys(DOMAIN_ASSETS)
          .map(key => {
            return {
              id: `${DOMAIN_ASSETS[key]}$${domain}`,
              assetId: `${DOMAIN_ASSETS[key]}#${domain}`,
              domain: domain,
              name: key,
              asset: DOMAIN_ASSETS[key],
              billingId: `${DOMAIN_ASSETS[key]}__${domain}`
            }
          })
      }
    })

    return [...avaliable, ...flatten(customAssets)]
      .filter(Boolean)
  },

  transferFee (state) {
    return state.transferFee
  },

  custodyFee (state) {
    return state.custodyFee
  },

  accountCreationFee (state) {
    return state.accountCreationFee
  },

  exchangeFee (state) {
    return state.exchangeFee
  },

  withdrawalFee (state) {
    return state.withdrawalFee
  },
  transferBillingAccountExists (state) {
    return state.transferBillingAccountExists
  },
  custodyBillingAccountExists (state) {
    return state.custodyBillingAccountExists
  },
  exchangeBillingAccountExists (state) {
    return state.exchangeBillingAccountExists
  },
  accountCreationBillingAccountExists (state) {
    return state.accountCreationBillingAccountExists
  },
  withdrawalBillingAccountExists (state) {
    return state.withdrawalBillingAccountExists
  }
}

/**
 * Store a connection error so the top component can handle it.
 * @param {Object} state
 * @param {Error} err
 */
function handleError (state, err) {
  switch (err.code) {
    case grpc.Code.Unavailable:
    case grpc.Code.Canceled:
      state.connectionError = err
      break

    default:
      state.connectionError = null
  }
}

const mutations = {
  [types.SET_FEE_SUCCESS] () {},
  [types.SET_FEE_REQUEST] () {},
  [types.SET_FEE_FAILURE] () {},

  [types.GET_FULL_BILLING_DATA_REQUEST] () {},

  [types.GET_FULL_BILLING_DATA_SUCCESS] (state, { response, domain }) {
    state.transferFee = response.transfer[domain] || {}
    state.custodyFee = response.custody[domain] || {}
    state.accountCreationFee = response.accountCreation[domain] || {}
    state.exchangeFee = response.exchange[domain] || {}
    state.withdrawalFee = response.withdrawal[domain] || {}
  },

  [types.GET_FULL_BILLING_DATA_FAILURE] () {},

  [types.GET_CUSTOM_ASSETS_REQUEST] (state) {},
  [types.GET_CUSTOM_ASSETS_SUCCESS] (state, { errorCode, message, ...domains }) {
    Vue.set(state, 'customAssets', domains)
  },
  [types.GET_CUSTOM_ASSETS_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.ADD_NETWORK_REQUEST] (state) {},
  [types.ADD_NETWORK_SUCCESS] (state) {},
  [types.ADD_NETWORK_FAILURE] (state) {},

  [types.CHECK_TRANSFER_BILLING_ACCOUNT_REQUEST] (state) {},
  [types.CHECK_TRANSFER_BILLING_ACCOUNT_SUCCESS] (state, result) {
    state.transferBillingAccountExists = result.itIs
  },
  [types.CHECK_TRANSFER_BILLING_ACCOUNT_FAILURE] (state) {},

  [types.CHECK_CUSTODY_BILLING_ACCOUNT_REQUEST] (state) {},
  [types.CHECK_CUSTODY_BILLING_ACCOUNT_SUCCESS] (state, result) {
    state.custodyBillingAccountExists = result.itIs
  },
  [types.CHECK_CUSTODY_BILLING_ACCOUNT_FAILURE] (state) {},

  [types.CHECK_EXCHANGE_BILLING_ACCOUNT_REQUEST] (state) {},
  [types.CHECK_EXCHANGE_BILLING_ACCOUNT_SUCCESS] (state, result) {
    state.exchangeBillingAccountExists = result.itIs
  },
  [types.CHECK_EXCHANGE_BILLING_ACCOUNT_FAILURE] (state) {},

  [types.CHECK_WITHDRAWAL_BILLING_ACCOUNT_REQUEST] (state) {},
  [types.CHECK_WITHDRAWAL_BILLING_ACCOUNT_SUCCESS] (state, result) {
    state.withdrawalBillingAccountExists = result.itIs
  },
  [types.CHECK_WITHDRAWAL_BILLING_ACCOUNT_FAILURE] (state) {},

  [types.CHECK_ACCOUNT_CREATION_BILLING_ACCOUNT_REQUEST] (state) {},
  [types.CHECK_ACCOUNT_CREATION_BILLING_ACCOUNT_SUCCESS] (state, result) {
    state.accountCreationBillingAccountExists = result.itIs
  },
  [types.CHECK_ACCOUNT_CREATION_BILLING_ACCOUNT_FAILURE] (state) {}
}

const actions = {
  addNetwork ({ commit, state, getters }) {
    commit(types.ADD_NETWORK_REQUEST)
    const username = getters.accountId.split('@')[0]

    return notaryUtil.signup(username, '')
      .then(() => commit(types.ADD_NETWORK_SUCCESS))
      .catch(err => {
        commit(types.ADD_NETWORK_FAILURE, err)
        throw err
      })
  },

  getCustomAssets ({ commit, getters }) {
    commit(types.GET_CUSTOM_ASSETS_REQUEST)
    const dataCollectorUrl = getters.servicesIPs['data-collector-service'].value
    return collectorUtil.getAllAssets(dataCollectorUrl.value)
      .then(res => commit(types.GET_CUSTOM_ASSETS_SUCCESS, res))
      .catch(err => {
        commit(types.GET_CUSTOM_ASSETS_FAILURE, err)
        throw err
      })
  },

  setFee ({ commit, state, dispatch, getters }, { privateKeys, asset, amount, type }) {
    commit(types.SET_FEE_REQUEST)

    const accountId = `${type}@${getters.domain}`

    return irohaUtil.setAccountDetail(privateKeys, getters.irohaQuorum, {
      accountId,
      key: asset,
      // eslint-disable-next-line
      value: amount
    })
      .then(() => {
        commit(types.SET_FEE_SUCCESS)
      })
      .catch(err => {
        commit(types.SET_FEE_FAILURE)
        throw err
      })
  },

  getFullBillingData ({ commit, getters }) {
    commit(types.GET_FULL_BILLING_DATA_REQUEST)

    const dataCollectorUrl = getters.servicesIPs['data-collector-service'].value
    return billingUtil.getFullBillingData(dataCollectorUrl)
      .then(response => {
        commit(types.GET_FULL_BILLING_DATA_SUCCESS, { response, domain: getters.domain })
      })
      .catch(err => {
        commit(types.GET_FULL_BILLING_DATA_FAILURE)
        throw err
      })
  },
  checkTransferAccount ({ commit, getters }) {
    const dataCollectorUrl = getters.servicesIPs['data-collector-service'].value
    return collectorUtil.checkAccountExists(dataCollectorUrl, `${FeeTypes.TRANSFER}@${getters.domain}`)
      .then(response => {
        commit(types.CHECK_TRANSFER_BILLING_ACCOUNT_SUCCESS, { response })
      })
      .catch(err => {
        commit(types.CHECK_TRANSFER_BILLING_ACCOUNT_FAILURE)
        throw err
      })
  },
  checkCustodyAccount ({ commit, getters }) {
    const dataCollectorUrl = getters.servicesIPs['data-collector-service'].value
    return collectorUtil.checkAccountExists(dataCollectorUrl, `${FeeTypes.CUSTODY}@${getters.domain}`)
      .then(response => {
        commit(types.CHECK_CUSTODY_BILLING_ACCOUNT_SUCCESS, { response })
      })
      .catch(err => {
        commit(types.CHECK_CUSTODY_BILLING_ACCOUNT_FAILURE)
        throw err
      })
  },
  checkExchangeAccount ({ commit, getters }) {
    const dataCollectorUrl = getters.servicesIPs['data-collector-service'].value
    return collectorUtil.checkAccountExists(dataCollectorUrl, `${FeeTypes.EXCHANGE}@${getters.domain}`)
      .then(response => {
        commit(types.CHECK_EXCHANGE_BILLING_ACCOUNT_SUCCESS, { response })
      })
      .catch(err => {
        commit(types.CHECK_EXCHANGE_BILLING_ACCOUNT_FAILURE)
        throw err
      })
  },
  checkWithdrawalAccount ({ commit, getters }) {
    const dataCollectorUrl = getters.servicesIPs['data-collector-service'].value
    return collectorUtil.checkAccountExists(dataCollectorUrl, `${FeeTypes.WITHDRAWAL}@${getters.domain}`)
      .then(response => {
        commit(types.CHECK_WITHDRAWAL_BILLING_ACCOUNT_SUCCESS, { response })
      })
      .catch(err => {
        commit(types.CHECK_WITHDRAWAL_BILLING_ACCOUNT_FAILURE)
        throw err
      })
  },
  checkAccountCreationAccount ({ commit, getters }) {
    const dataCollectorUrl = getters.servicesIPs['data-collector-service'].value
    return collectorUtil.checkAccountExists(dataCollectorUrl, `${FeeTypes.ACCOUNT_CREATION}@${getters.domain}`)
      .then(response => {
        commit(types.CHECK_ACCOUNT_CREATION_BILLING_ACCOUNT_SUCCESS, { response })
      })
      .catch(err => {
        commit(types.CHECK_ACCOUNT_CREATION_BILLING_ACCOUNT_FAILURE)
        throw err
      })
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
