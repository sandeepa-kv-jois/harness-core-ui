/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { defaultTo, get } from 'lodash-es'
import { Color, Container, FontVariation, Layout, Text, Utils } from '@harness/uicore'
import formatCost from '@ce/utils/formatCost'
import SimpleBar from '@ce/common/SimpleBar/SimpleBar'
import CEChart from '../CEChart/CEChart'
import { getRadialChartOptions } from '../CEChart/CEChartOptions'
import css from './CommitmentOrchestrationBody.module.scss'

interface ComputedDataWidgetsRowProps {
  data?: any
}

const computeCoverageItems = [
  {
    label: 'Savings Plans',
    color: Utils.getRealCSSColor(Color.TEAL_600)
  },
  {
    label: 'Reserved instances',
    color: Utils.getRealCSSColor(Color.PURPLE_600)
  },
  {
    label: 'On-demand instances',
    color: Utils.getRealCSSColor(Color.GREY_200)
  }
]

const ComputedDataWidgetsRow: React.FC<ComputedDataWidgetsRowProps> = () => {
  const [summaryData, setSummaryData] = useState()

  useEffect(() => {
    fetch(
      'https://autocud.lightwingtest.com/accounts/kmpySmUISimoRrJL6NL73w/co/v1/summary?start_date=2022-07-08&end_date=2022-07-15',
      {
        method: 'POST',
        body: JSON.stringify({})
      }
    )
      .then(res => res.json())
      .then(res => {
        setSummaryData(res.response)
      })
  }, [])

  const savingsPlanPercentage = get(summaryData, 'coverage_percentage.savings_plan', 60)
  const reservedInstancesPercentage = get(summaryData, 'coverage_percentage.reserved_instances', 18.5)

  return (
    <Container className={css.bodyWidgetsContainer}>
      <Layout.Horizontal flex={{ alignItems: 'stretch' }}>
        <Layout.Vertical spacing={'small'} className={cx(css.infoContainer, css.semiLargeContainer)}>
          <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
            {'Compute spend'}
          </Text>
          <Text font={{ variation: FontVariation.H3 }}>
            {formatCost(defaultTo(get(summaryData, 'compute_spend', 22135.13), 0), { decimalPoints: 2 })}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }}>{'month-to-date'}</Text>
        </Layout.Vertical>
        <Layout.Horizontal
          className={cx(css.infoContainer, css.largeContainer)}
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
        >
          <Layout.Horizontal flex>
            <CEChart
              options={{
                ...getRadialChartOptions(
                  [
                    { name: 'savingsPlans', value: savingsPlanPercentage },
                    {
                      name: 'reservedInstances',
                      value: reservedInstancesPercentage
                    },
                    {
                      name: 'onDemandInstances',
                      value: get(summaryData, 'coverage_percentage.ondemand', 18.5)
                    }
                  ],
                  ['#03C0CD', '#6938C0', '#D9DAE6'],
                  {
                    chart: { height: 100, width: 100 },
                    plotOptions: {
                      pie: { size: '180%' }
                    }
                  }
                ),
                title: {
                  text: `${(savingsPlanPercentage + reservedInstancesPercentage).toFixed(2)}%`,
                  align: 'center',
                  verticalAlign: 'middle',
                  style: { fontSize: '15px', fontWeight: '700' }
                }
              }}
            />
          </Layout.Horizontal>
          <Layout.Vertical margin={{ left: 'small' }} spacing="small">
            <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
              {'Compute coverage'}
            </Text>
            <Container>
              {computeCoverageItems.map(item => (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} key={item.label}>
                  <div style={{ backgroundColor: item.color, height: 10, width: 10, marginRight: 10 }} />
                  <Text font={{ variation: FontVariation.BODY }}>{item.label}</Text>
                </Layout.Horizontal>
              ))}
            </Container>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical className={cx(css.infoContainer, css.largeContainer)} spacing="small">
          <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
            {'Commitment Utilisation'}
          </Text>
          <Container>
            <SimpleBar
              widthInPercentage={Number(get(summaryData, 'utilization_percentage.savings_plan', 43.1).toFixed(2))}
              primaryColor={Color.TEAL_600}
              secondaryColor={Color.TEAL_50}
              description={'Savings Plans'}
            />
            <SimpleBar
              widthInPercentage={Number(get(summaryData, 'utilization_percentage.reserved_instances', 79.4).toFixed(2))}
              primaryColor={Color.PURPLE_600}
              secondaryColor={Color.PURPLE_50}
              description={'Reserved Instances'}
              descriptionDirection="bottom"
            />
          </Container>
        </Layout.Vertical>
        <Layout.Horizontal
          className={cx(css.infoContainer, css.largeContainer)}
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
        >
          <Container>
            <CEChart
              options={{
                ...getRadialChartOptions(
                  [
                    { name: 'savingsPlans', value: 60 },
                    { name: 'reservedInstances', value: 18.5 }
                  ],
                  ['#299B2C', '#D9DAE6'],
                  {
                    chart: { height: 100, width: 100 },
                    plotOptions: {
                      pie: { size: '180%' }
                    }
                  }
                ),
                title: {
                  text: `${77}%`,
                  align: 'center',
                  verticalAlign: 'middle',
                  style: { fontSize: '15px', fontWeight: '700' }
                }
              }}
            />
          </Container>
          <Layout.Vertical spacing={'medium'}>
            <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
              {'Savings till date'}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>
              {formatCost(get(summaryData, 'savings.total', 22135.22), { decimalPoints: 2 })}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default ComputedDataWidgetsRow
