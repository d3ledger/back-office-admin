/*
 * Copyright D3 Ledger, Inc. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import Vue from 'vue'
import map from 'lodash/fp/map'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import omit from 'lodash/fp/omit'
import isEqual from 'lodash/fp/isEqual'
import flatMap from 'lodash/fp/flatMap'
import concat from 'lodash/fp/concat'
import { getParsedItem, setParsedItem, setStringifyItem } from '@util/storage-util'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'LOAD_SETTINGS',
    'UPDATE_SETTINGS_VIEW_TIMEZONE'
  ]),
  map(x => [x, x]),
  fromPairs
)([
])

function initialState () {
  return {
    view: {
      timezone: 'Europe/Moscow'
    }
  }
}

const state = initialState()

const getters = {
  settingsView (state) {
    return state.view
  }
}

const mutations = {
  [types.LOAD_SETTINGS] (state, storage) {
    if (!isEqual(state, storage)) {
      Object.keys(state).map(key => {
        if (key !== 'default') {
          state[key] = storage[key]
        }
      })
    }
  },

  [types.UPDATE_SETTINGS_VIEW_TIMEZONE] (state, timezone) {
    Vue.set(state.view, 'timezone', timezone)
  }
}

const actions = {
  loadSettings ({ commit, state }) {
    const storage = getParsedItem('settings')
    if (storage) {
      commit(types.LOAD_SETTINGS, storage)
    } else {
      setStringifyItem('settings', omit('default')(state))
    }
  },
  updateSettingsViewTime ({ commit }, timezone) {
    setParsedItem('settings.view.timezone', timezone)
    commit(types.UPDATE_SETTINGS_VIEW_TIMEZONE, timezone)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
