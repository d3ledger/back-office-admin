import Vue from 'vue'
import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import concat from 'lodash/fp/concat'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import { grpc } from 'grpc-web-client'
import irohaUtil from '@util/iroha'
import configFile from '@/data/config'
import notaryUtil from '@util/notary-util'

const ETH_TOKEN_SERVICE = 'eth_token_service@notary'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET',
    'SET_NOTARY_IP'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'GET_RELAYS_BY_ACCOUNT',
  'ADD_NEW_RELAY',
  'GET_IROHA_ANCHORED_ASSETS',
  'GET_ETH_ANCHORED_ASSETS',

  'CREATE_ASSET',
  'CHECK_DOMAIN',
  'CHECK_ASSET',
  'ADD_ASSET_QUANTITY',
  'CHECK_ACCOUNT',
  'SET_ACCOUNT_DETAIL',
  'GET_ACCOUNT_ASSETS'
])

function initialState () {
  return {
    rawJsonInfo: {},
    assets: {
      iroha: [],
      eth: []
    },
    accountAssets: []
  }
}

const state = initialState()

const getters = {
  freeRelays (state) {
    const relays = state.rawJsonInfo[configFile.ETH.relayRegistrationIrohaAccount]
    return relays ? Object.keys(relays).filter(key => relays[key] === 'free').length : 0
  },
  registeredRelays (state) {
    const relays = state.rawJsonInfo[configFile.ETH.relayRegistrationIrohaAccount]
    return relays ? Object.keys(relays).filter(key => relays[key] !== 'free').length : 0
  },
  avaliableAssets (state) {
    return state.assets
  },
  accountAssets (state) {
    return state.accountAssets
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

  [types.RESET] (state) {
    const s = initialState()

    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },

  [types.GET_RELAYS_BY_ACCOUNT_REQUEST] (state) {},
  [types.GET_RELAYS_BY_ACCOUNT_SUCCESS] (state, { jsonData }) {
    state.rawJsonInfo = JSON.parse(jsonData)
  },
  [types.GET_RELAYS_BY_ACCOUNT_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.ADD_NEW_RELAY_REQUEST] (state) {},
  [types.ADD_NEW_RELAY_SUCCESS] (state) {},
  [types.ADD_NEW_RELAY_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.GET_IROHA_ANCHORED_ASSETS_REQUEST] (state) {},
  [types.GET_IROHA_ANCHORED_ASSETS_SUCCESS] (state, object) {
    const assets = Object.values(object[ETH_TOKEN_SERVICE])
    Vue.set(state.assets, 'iroha', assets)
  },
  [types.GET_IROHA_ANCHORED_ASSETS_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.GET_ETH_ANCHORED_ASSETS_REQUEST] (state) {},
  [types.GET_ETH_ANCHORED_ASSETS_SUCCESS] (state, object) {
    const assets = Object.values(object[ETH_TOKEN_SERVICE])
    Vue.set(state.assets, 'eth', assets)
  },
  [types.GET_ETH_ANCHORED_ASSETS_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.GET_ACCOUNT_ASSETS_REQUEST] (state) {},
  [types.GET_ACCOUNT_ASSETS_SUCCESS] (state, assets) {
    Vue.set(state, 'accountAssets', assets)
  },
  [types.GET_ACCOUNT_ASSETS_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.CREATE_ASSET_REQUEST] (state) {},
  [types.CREATE_ASSET_SUCCESS] (state) {},
  [types.CREATE_ASSET_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.CHECK_DOMAIN_REQUEST] (state) {},
  [types.CHECK_DOMAIN_SUCCESS] (state) {},
  [types.CHECK_DOMAIN_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.CHECK_ASSET_REQUEST] (state) {},
  [types.CHECK_ASSET_SUCCESS] (state) {},
  [types.CHECK_ASSET_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.ADD_ASSET_QUANTITY_REQUEST] (state) {},
  [types.ADD_ASSET_QUANTITY_SUCCESS] (state) {},
  [types.ADD_ASSET_QUANTITY_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.CHECK_ACCOUNT_REQUEST] (state) {},
  [types.CHECK_ACCOUNT_SUCCESS] (state) {},
  [types.CHECK_ACCOUNT_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.SET_ACCOUNT_DETAIL_REQUEST] (state) {},
  [types.SET_ACCOUNT_DETAIL_SUCCESS] (state) {},
  [types.SET_ACCOUNT_DETAIL_FAILURE] (state, err) {
    handleError(state, err)
  }
}

const actions = {
  getRelays ({ commit }) {
    commit(types.GET_RELAYS_BY_ACCOUNT_REQUEST)
    return irohaUtil.getAccount({
      accountId: configFile.account
    })
      .then(account => commit(types.GET_RELAYS_BY_ACCOUNT_SUCCESS, account))
      .catch(err => {
        commit(types.GET_RELAYS_BY_ACCOUNT_FAILURE)
        throw err
      })
  },
  addRelay ({ commit }) {
    commit(types.ADD_NEW_RELAY_REQUEST)
    return notaryUtil.addNewRelay()
      .then(() => commit(types.ADD_NEW_RELAY_SUCCESS))
      .catch(err => {
        commit(types.ADD_NEW_RELAY_FAILURE)
        throw err
      })
  },
  getIrohaAssets ({ commit }) {
    commit(types.GET_IROHA_ANCHORED_ASSETS_REQUEST)
    return irohaUtil.getAccountDetail({
      accountId: 'iroha_anchored_token_service@notary',
      key: undefined,
      writer: 'eth_token_service@notary'
    })
      .then(assets => {
        commit(types.GET_IROHA_ANCHORED_ASSETS_SUCCESS, assets)
      })
      .catch(err => {
        commit(types.GET_IROHA_ANCHORED_ASSETS_FAILURE, err)
        throw err
      })
  },
  getEthAssets ({ commit }) {
    commit(types.GET_ETH_ANCHORED_ASSETS_REQUEST)
    return irohaUtil.getAccountDetail({
      accountId: 'eth_anchored_token_service@notary',
      key: undefined,
      writer: 'eth_token_service@notary'
    })
      .then(assets => {
        commit(types.GET_ETH_ANCHORED_ASSETS_SUCCESS, assets)
      })
      .catch(err => {
        commit(types.GET_ETH_ANCHORED_ASSETS_FAILURE, err)
        throw err
      })
  },

  async createAsset ({ commit, dispatch }, form) {
    const {
      longName,
      shortName,
      precision,
      assetType,
      initialAmount,
      privateKey
    } = form

    commit(types.CREATE_ASSET_REQUEST)

    try {
      await dispatch('checkCreateDomain', { assetType, privateKey })
      await dispatch('checkCreateAsset', { shortName, assetType, precision, privateKey })
      await dispatch('addAssetQuantity', { shortName, assetType, initialAmount, privateKey })
      await dispatch('checkCreateAccount', { assetType, privateKey })
      await dispatch('checkSetDetail', { assetType, longName, shortName, privateKey })
      await dispatch('getAccountAssets')
      commit(types.CREATE_ASSET_SUCCESS)
    } catch (error) {
      commit(types.CREATE_ASSET_FAILURE, error)
      throw error
    }
  },

  async checkCreateDomain ({ commit }, { assetType, privateKey }) {
    commit(types.CHECK_DOMAIN_REQUEST)
    try {
      await irohaUtil.createDomain([ privateKey ], 1, {
        domainId: assetType,
        defaultRole: 'eth_token_list_storage'
      })
      commit(types.CHECK_DOMAIN_SUCCESS)
    } catch (error) {
      // It does not mean that function will fail
      commit(types.CHECK_DOMAIN_FAILURE, error)
      console.log('Domain already exist', error)
    }
  },

  async checkCreateAsset ({ commit }, { shortName, assetType, precision, privateKey }) {
    commit(types.CHECK_ASSET_REQUEST)
    try {
      await irohaUtil.createAsset([ privateKey ], 1, {
        assetName: shortName,
        domainId: assetType,
        precision
      })
      commit(types.CHECK_ASSET_SUCCESS)
    } catch (error) {
      commit(types.CHECK_ASSET_FAILURE, error)
      throw error
    }
  },

  async addAssetQuantity ({ commit }, { shortName, assetType, initialAmount, privateKey }) {
    commit(types.ADD_ASSET_QUANTITY_REQUEST)
    try {
      irohaUtil.addAssetQuantity([ privateKey ], 1, {
        assetId: `${shortName}#${assetType}`,
        amount: initialAmount
      })
      commit(types.ADD_ASSET_QUANTITY_SUCCESS)
    } catch (error) {
      commit(types.ADD_ASSET_QUANTITY_FAILURE, error)
      throw error
    }
  },
  async checkCreateAccount ({ commit }, { assetType, privateKey }) {
    commit(types.CHECK_ACCOUNT_REQUEST)
    try {
      await irohaUtil.createAccount([ privateKey ], 1, {
        accountName: `assets_list`,
        domainId: assetType,
        publicKey: '0000000000000000000000000000000000000000000000000000000000000000'
      })
      commit(types.CHECK_ACCOUNT_SUCCESS)
    } catch (error) {
      // It does not mean that function will fail
      commit(types.CHECK_ACCOUNT_FAILURE, error)
      console.log('Account already exist', error)
    }
  },

  async checkSetDetail ({ commit }, { assetType, longName, shortName, privateKey }) {
    commit(types.SET_ACCOUNT_DETAIL_REQUEST)
    try {
      await irohaUtil.setAccountDetail([ privateKey ], 1, {
        accountId: `assets_list@${assetType}`,
        key: longName,
        value: shortName
      })
      commit(types.SET_ACCOUNT_DETAIL_SUCCESS)
    } catch (error) {
      commit(types.SET_ACCOUNT_DETAIL_FAILURE, error)
      throw error
    }
  },

  async getAccountAssets ({ commit }) {
    commit(types.GET_ACCOUNT_ASSETS_REQUEST)
    try {
      const assets = await irohaUtil.getAccountAssets({
        accountId: 'test@notary'
      })
      commit(types.GET_ACCOUNT_ASSETS_SUCCESS, assets)
    } catch (error) {
      commit(types.GET_ACCOUNT_ASSETS_FAILURE, error)
      throw error
    }
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
