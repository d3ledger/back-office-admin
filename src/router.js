/*
 * Copyright D3 Ledger, Inc. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import Vue from 'vue'
import Router from 'vue-router'
import irohaUtil from '@util/iroha'

Vue.use(Router)

export const lazyComponent = (name) => () => import(`@/components/${name}.vue`)
export const lazyView = (name) => () => import(`@/views/${name}.vue`)

const defaultRouter = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: lazyView('HomePage'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: lazyView('DashboardPage')
        },
        {
          path: 'health',
          name: 'health',
          component: lazyView('HealthPage')
        },
        {
          path: 'custody-report',
          name: 'custody-report',
          component: lazyView('CustodyReportPage')
        },
        {
          path: 'accounts-report',
          name: 'accounts-report',
          component: lazyView('AccountsReportPage')
        },
        {
          path: 'exchange-report',
          name: 'exchange-report',
          component: lazyView('ExchangeReportPage')
        },
        {
          path: 'transfer-report',
          name: 'transfer-report',
          component: lazyView('TransferReportPage')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: lazyView('LoginPage')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

defaultRouter.beforeEach((to, from, next) => {
  if (to.name === 'login' || to.name === 'signup') return next()

  if (irohaUtil.isLoggedIn()) {
    next()
  } else {
    next({ name: 'login' })
  }
})

export default defaultRouter
