/*
 * Copyright D3 Ledger, Inc. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import axios from 'axios'
import configFile from '@/data/config'

let axiosNotary = axios.create({
  baseURL: configFile.notaryUrl
})

const addNewRelay = axios => () => {
  return axios
    .post()
    .then(({ data }) => ({ response: data }))
}

export default {
  addNewRelay: addNewRelay(axiosNotary)
}
