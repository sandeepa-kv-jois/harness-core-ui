/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { InitCustomHealthSourceInterface } from './CustomHealthSource.types'

export const CustomHealthSourceFieldNames = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'metricIdentifier',
  GROUP_NAME: 'groupName',

  SLI: 'sli',
  HEALTH_SCORE: 'healthScore',
  CONTINUOUS_VERIFICATION: 'continuousVerification',

  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation',

  BASE_URL: 'baseURL',
  PATH: 'pathURL',

  QUERY: 'query',
  QUERY_TYPE: 'queryType',
  REQUEST_METHOD: 'requestMethod',

  METRIC_VALUE: 'metricValue',
  TIMESTAMP_LOCATOR: 'timestamp',
  TIMESTAMP_FORMAT: 'timestampFormat',
  SERVICE_INSTANCE: 'serviceInstanceIdentifier'
}

export const defaultMetricName = 'CustomHealth Metric'

export const INITFORMDATA: InitCustomHealthSourceInterface = {
  sli: false,
  healthScore: false,
  continuousVerification: false,
  serviceInstanceMetricPath: '',
  baseURL: '',
  pathURL: '',
  metricValue: '',
  timestamp: '',
  timestampFormat: '',
  queryType: '',
  query: '',
  requestMethod: '',
  startTime: {
    timestampFormat: 'SECONDS'
  },
  endTime: {
    timestampFormat: 'SECONDS'
  }
}

export const CustomHealthProduct = {
  METRICS: 'metrics',
  LOGS: 'logs'
}
