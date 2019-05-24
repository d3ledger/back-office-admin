import Vue from 'vue'
import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import concat from 'lodash/fp/concat'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import { grpc } from 'grpc-web-client'
import configUtil from '@util/config-util'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'LOAD_CONFIGURATION_FILE'
])

function initialState () {
  return {
    config: {
      nodes: [],
      health: []
    }
  }
}

const state = initialState()

const getters = {
  registrationNodes (state) {
    return state.config.nodes
  },
  healthNodes (state) {
    return state.config.health.map(n => ({ ...n, status: '' }))
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
  [types.LOAD_CONFIGURATION_FILE_REQUEST] (state) {},

  [types.LOAD_CONFIGURATION_FILE_SUCCESS] (state, config) {
    Vue.set(state.config, 'nodes', config.nodes)
    Vue.set(state.config, 'health', config.health)
  },

  [types.LOAD_CONFIGURATION_FILE_FAILURE] (state, err) {
    handleError(state, err)
  }
}

const actions = {
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
