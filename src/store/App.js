/*
 * Copyright D3 Ledger, Inc. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import concat from 'lodash/fp/concat'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import { grpc } from '@improbable-eng/grpc-web'
import configUtil from '@util/config-util'
import notaryUtil from '@util/notary-util'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'LOAD_CONFIGURATION_FILE',
  'GET_FREE_ETH_RELAYS',
  'GET_FREE_BTC_RELAYS'
])

function initialState () {
  return {
    health: [],
    nodes: [],
    freeEthRelaysNumber: 0,
    freeBtcRelaysNumber: 0,
    btcRegistrationIp: null,
    ethRegistrationIp: null,
    services: []
  }
}

const state = initialState()

const getters = {
  nodesIPs (state) {
    return state.nodes
  },
  healthNodes (state) {
    return state.health.map(n => ({ ...n, status: '' }))
  },
  freeEthRelaysNumber (state) {
    return state.freeEthRelaysNumber
  },
  freeBtcRelaysNumber (state) {
    return state.freeBtcRelaysNumber
  },
  btcRegistrationIp (state) {
    return state.btcRegistrationIp
  },
  ethRegistrationIp (state) {
    return state.ethRegistrationIp
  },
  servicesIPs (state) {
    return state.services
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
  [types.GET_FREE_ETH_RELAYS_REQUEST] (state) {},

  [types.GET_FREE_ETH_RELAYS_SUCCESS] (state, relays) {
    state.freeEthRelaysNumber = relays
  },

  [types.GET_FREE_ETH_RELAYS_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.GET_FREE_BTC_RELAYS_REQUEST] (state) {},

  [types.GET_FREE_BTC_RELAYS_SUCCESS] (state, relays) {
    state.freeBtcRelaysNumber = relays
  },

  [types.GET_FREE_BTC_RELAYS_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.LOAD_CONFIGURATION_FILE_REQUEST] (state) {},
  [types.LOAD_CONFIGURATION_FILE_SUCCESS] (state, config) {
    state.nodes = config.nodes
    state.health = config.health

    state.btcRegistrationIp = config.relays.BTC.value
    state.ethRegistrationIp = config.relays.ETH.value

    state.services = config.services
  },
  [types.LOAD_CONFIGURATION_FILE_FAILURE] (state, err) {
    handleError(state, err)
  }
}

const actions = {
  getFreeEthRelaysNumber ({ commit, state }) {
    commit(types.GET_FREE_ETH_RELAYS_REQUEST)

    return notaryUtil.getFreeRelaysNumber(state.ethRegistrationIp)
      .then(relays => {
        commit(types.GET_FREE_ETH_RELAYS_SUCCESS, relays)
      })
      .catch(err => {
        commit(types.GET_FREE_ETH_RELAYS_FAILURE, err)
        throw err
      })
  },

  getFreeBtcRelaysNumber ({ commit, state }) {
    commit(types.GET_FREE_BTC_RELAYS_REQUEST)

    return notaryUtil.getFreeRelaysNumber(state.btcRegistrationIp)
      .then(relays => {
        commit(types.GET_FREE_BTC_RELAYS_SUCCESS, relays)
      })
      .catch(err => {
        commit(types.GET_FREE_BTC_RELAYS_FAILURE, err)
        throw err
      })
  },

  getConfiguration ({ commit }) {
    commit(types.LOAD_CONFIGURATION_FILE_REQUEST)

    return configUtil.getConfiguration()
      .then(res => commit(types.LOAD_CONFIGURATION_FILE_SUCCESS, res))
      .catch(err => {
        commit(types.LOAD_CONFIGURATION_FILE_FAILURE, err)
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
