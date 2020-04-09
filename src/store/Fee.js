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
import { grpc } from 'grpc-web-client'
import irohaUtil from '@util/iroha'
import notaryUtil from '@util/notary-util'
import collectorUtil from '@util/collector-util'
import billingUtil from '@util/billing-util'

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
  'GET_FULL_BILLING_DATA'
])

function initialState () {
  return {
    assets: [],
    customAssets: {},
    transferFee: {},
    custodyFee: {},
    accountCreationFee: {},
    exchangeFee: {},
    withdrawalFee: {}
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

  [types.GET_FULL_BILLING_DATA_SUCCESS] (state, { response }) {
    state.transferFee = response.transfer.d3 || {}
    state.custodyFee = response.custody.d3 || {}
    state.accountCreationFee = response.accountCreation.d3 || {}
    state.exchangeFee = response.exchange.d3 || {}
    state.withdrawalFee = response.withdrawal.d3 || {}
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
  [types.ADD_NETWORK_FAILURE] (state) {}
}

const actions = {
  addNetwork ({ commit, state }) {
    commit(types.ADD_NETWORK_REQUEST)
    const username = state.accountId.split('@')[0]

    return notaryUtil.signup(username, '')
      .then(() => commit(types.ADD_NETWORK_SUCCESS))
      .catch(err => {
        commit(types.ADD_NETWORK_FAILURE, err)
        throw err
      })
  },

  getAccountAssets ({ commit, state }) {
    commit(types.GET_ACCOUNT_ASSETS_REQUEST)

    return irohaUtil.getAccountAssets({
      accountId: state.accountId
    })
      .then(assets => {
        commit(types.GET_ACCOUNT_ASSETS_SUCCESS, assets)
      })
      .catch(err => {
        commit(types.GET_ACCOUNT_ASSETS_FAILURE, err)
        throw err
      })
  },

  getCustomAssets ({ commit, getters }) {
    commit(types.GET_CUSTOM_ASSETS_REQUEST)
    const dataCollectorUrl = getters.servicesIPs['data-collector-service']
    return collectorUtil.getAllAssets(dataCollectorUrl.value)
      .then(res => commit(types.GET_CUSTOM_ASSETS_SUCCESS, res))
      .catch(err => {
        commit(types.GET_CUSTOM_ASSETS_FAILURE, err)
        throw err
      })
  },

  setFee ({ commit, state, dispatch, getters }, { privateKeys, asset, amount, type }) {
    commit(types.SET_FEE_REQUEST)

    const accountId = `${type}@d3`

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
        commit(types.GET_FULL_BILLING_DATA_SUCCESS, { response })
      })
      .catch(err => {
        commit(types.GET_FULL_BILLING_DATA_FAILURE)
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
