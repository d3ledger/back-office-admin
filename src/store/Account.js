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
import irohaUtil from '@util/iroha'
import notaryUtil from '@util/notary-util'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET',
    'SET_REGISTRATION_IP'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'LOGIN',
  'LOGOUT',
  'SIGNUP'
])

function initialState () {
  return {
    accountId: '',
    nodeIp: irohaUtil.getStoredNodeIp(),
    registrationIp: '',
    accountInfo: {},
    accountQuorum: 0,
    connectionError: null
  }
}

const state = initialState()

const getters = {
  nodeIp (state) {
    return state.nodeIp
  },
  accountId (state) {
    return state.accountId
  },
  accountQuorum (state) {
    const quorum = find('user_quorum', state.accountInfo)
    return quorum ? parseInt(quorum.user_quorum) : state.accountQuorum
  },
  irohaQuorum (state, getters) {
    return getters.accountQuorum
  },
  domain (state) {
    return state.accountId.split('@')[1]
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
  [types.SET_REGISTRATION_IP] (state, ip) {
    notaryUtil.baseURL = ip
    state.registrationIp = ip
  },

  [types.RESET] (state) {
    const s = initialState()

    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },

  [types.LOGIN_REQUEST] (state) {},

  [types.LOGIN_SUCCESS] (state, account) {
    state.accountId = account.accountId
    state.accountInfo = JSON.parse(account.jsonData)
    state.accountQuorum = account.quorum
  },

  [types.LOGIN_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.LOGOUT_REQUEST] (state) {},

  [types.LOGOUT_SUCCESS] (state) {},

  [types.LOGOUT_FAILURE] (state, err) {
    handleError(state, err)
  },

  [types.SIGNUP_REQUEST] (state) {},

  [types.SIGNUP_SUCCESS] (state, params) {
  },

  [types.SIGNUP_FAILURE] (state, err) {
    handleError(state, err)
  }
}

const actions = {
  setRegistrationIp ({ commit }, { ip }) {
    commit(types.SET_REGISTRATION_IP, ip)
  },

  login ({ commit }, { username, privateKey, nodeIp }) {
    commit(types.LOGIN_REQUEST)

    return irohaUtil.login(username, privateKey, nodeIp)
      .then(account => commit(types.LOGIN_SUCCESS, account))
      .catch(err => {
        commit(types.LOGIN_FAILURE, err)
        throw err
      })
  },

  logout ({ commit }) {
    commit(types.LOGOUT_REQUEST)

    return irohaUtil.logout()
      .then(() => {
        commit(types.RESET)
        commit(types.LOGOUT_SUCCESS)
      })
      .catch(err => {
        commit(types.LOGOUT_FAILURE, err)
        throw err
      })
  },

  signupWithKey ({ commit }, { username, publicKey }) {
    commit(types.SIGNUP_REQUEST)
    return notaryUtil.signup(username, publicKey)
      .then(() => commit(types.SIGNUP_SUCCESS))
      .catch(err => {
        commit(types.SIGNUP_FAILURE, err)
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
