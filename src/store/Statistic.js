import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import concat from 'lodash/fp/concat'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import { grpc } from 'grpc-web-client'
import irohaUtil from '@util/iroha'
import configFile from '@/data/config'
import notaryUtil from '@util/notary-util'

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
  'ADD_NEW_RELAY'
])

function initialState () {
  return {
    rawJsonInfo: {}
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
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
