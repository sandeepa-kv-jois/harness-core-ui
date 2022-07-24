import React from 'react'
import { Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import PrometheusDIgnoreThresholdTabContent from './PrometheusIgnoreThresholdTabContent'
import PrometheusFailFastThresholdTabContent from './PrometheusFailFastThresholdTabContent'
import css from '../PrometheusMetricThresholdContent.module.scss'

export default function PrometheusMetricThresholdTab(): JSX.Element {
  const { getString } = useStrings()

  return (
    <Tabs
      id={'horizontalTabs'}
      defaultSelectedTabId={getString('cv.monitoringSources.appD.ignoreThresholds')}
      className={css.appDMetricThresholdContentTabs}
      tabList={[
        {
          id: getString('cv.monitoringSources.appD.ignoreThresholds'),
          title: getString('cv.monitoringSources.appD.ignoreThresholds'),
          panel: <PrometheusDIgnoreThresholdTabContent />
        },
        {
          id: getString('cv.monitoringSources.appD.failFastThresholds'),
          title: getString('cv.monitoringSources.appD.failFastThresholds'),
          panel: <PrometheusFailFastThresholdTabContent />
        }
      ]}
    />
  )
}
