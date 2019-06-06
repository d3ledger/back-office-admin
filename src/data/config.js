/*
 * Copyright D3 Ledger, Inc. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
const NOTARY_ACCOUNT = process.env.VUE_APP_NOTARY_ACCOUNT || 'notary@notary'
const RELAY_ACCOUNT_KEY = process.env.VUE_APP_RELAY_ACCOUNT_KEY || 'eth_registration_service@notary'
const REPORT_SERVICE_URL = process.env.VUE_APP_REPORT_URL || 'http://localhost:8090'

export default {
  account: NOTARY_ACCOUNT,
  reportUrl: REPORT_SERVICE_URL,
  ETH: {
    relayRegistrationIrohaAccount: RELAY_ACCOUNT_KEY
  }
}
