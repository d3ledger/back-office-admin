/*
 * Copyright D3 Ledger, Inc. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import axios from 'axios'

const PROTOCOL = location.protocol

const axiosNotary = axios.create({
  baseURL: ''
})

const getFreeRelaysNumber = (url) => {
  return axios({
    url: '/free-addresses/number',
    baseURL: `${PROTOCOL}//${url}`
  })
    .then(({ data }) => data)
}

const addNewRelay = axios => () => {
  return axios
    .post('users', postData)
    .then(({ data }) => ({ response: data }))
}

const getFreeRelaysNumber = (url) => {
  return axios({
    url: '/free-addresses/number',
    baseURL: `${PROTOCOL}//${url}`
  })
    .then(({ data }) => data)
}

export default {
  get baseURL () { return axiosNotary.defaults.baseURL },
  set baseURL (baseURL) {
    axiosNotary.defaults.baseURL = `${PROTOCOL}//${baseURL}`
  },
  addNewRelay: addNewRelay(axiosNotary),
  getFreeRelaysNumber
}
