/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Container, FontVariation, Layout, Page, Text, Utils } from '@harness/uicore'
import formatCost from '@ce/utils/formatCost'
import SimpleBar from '@ce/common/SimpleBar/SimpleBar'
import PageFilterPanel from './PageFilterPanel'
import CEChart from '../CEChart/CEChart'
import { getRadialChartOptions } from '../CEChart/CEChartOptions'
import css from './CommitmentOrchestrationBody.module.scss'

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

const CommitmentOrchestrationBody: React.FC = () => {
  return (
    <Page.Body className={css.commitmentBody}>
      <PageFilterPanel />
      <Container className={css.bodyWidgetsContainer}>
        <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
          <Layout.Vertical spacing={'small'} className={css.infoContainer}>
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_600}>
              {'Compute spend'}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{formatCost(22135.13, { decimalPoints: 2 })}</Text>
            <Text font={{ variation: FontVariation.SMALL }}>{'month-to-date'}</Text>
          </Layout.Vertical>
          <Layout.Horizontal className={css.infoContainer} flex={{ alignItems: 'center' }}>
            <Container>
              <CEChart
                options={{
                  ...getRadialChartOptions(
                    [
                      { name: 'savingsPlans', value: 60 },
                      { name: 'reservedInstances', value: 18.5 }
                    ],
                    ['#03C0CD', '#6938C0'],
                    {
                      chart: { height: 100, width: 100 },
                      plotOptions: {
                        pie: { size: '180%' }
                      }
                    }
                  ),
                  title: {
                    text: `${70}%`,
                    align: 'center',
                    verticalAlign: 'middle',
                    style: { fontSize: '15px', fontWeight: '700' }
                  }
                }}
              />
            </Container>
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_600}>
                {'Compute coverage'}
              </Text>
              {computeCoverageItems.map(item => (
                <Layout.Horizontal flex key={item.label}>
                  <div style={{ backgroundColor: item.color, height: 10, width: 10 }} />
                  <Text font={{ variation: FontVariation.BODY }}>{item.label}</Text>
                </Layout.Horizontal>
              ))}
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Vertical className={css.infoContainer}>
            <SimpleBar
              widthInPercentage={43.1}
              primaryColor={Color.TEAL_600}
              secondaryColor={Color.TEAL_50}
              description={'Savings Plans'}
            />
            <SimpleBar
              widthInPercentage={79.4}
              primaryColor={Color.PURPLE_600}
              secondaryColor={Color.PURPLE_50}
              description={'Reserved Instances'}
            />
          </Layout.Vertical>
          <Layout.Horizontal className={css.infoContainer} flex={{ alignItems: 'center' }}>
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
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_600}>
                {'Savings till date'}
              </Text>
              <Text font={{ variation: FontVariation.H3 }}>{formatCost(22135.22, { decimalPoints: 2 })}</Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Container>
    </Page.Body>
  )
}

export default CommitmentOrchestrationBody
