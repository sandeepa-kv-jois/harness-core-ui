/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import cx from 'classnames'
import { Container, FontVariation, Layout, Text } from '@harness/uicore'
import ComputeCoverage from './ComputeCoverage'
import css from '../CommitmentOrchestrationBody.module.scss'

interface DataVisualisationContainerProps {
  data?: any
}

interface TabProps {
  title: string
  component: React.ReactNode
}

interface TabNavigationProps {
  tabs: TabProps[]
  commonProps?: Record<string, any>
  className?: string
  defaultTab?: number
}

const DataVisualisationContainer: React.FC<DataVisualisationContainerProps> = () => {
  const tabsData: TabProps[] = useMemo(() => {
    return [
      {
        title: 'Compute coverage',
        component: <ComputeCoverage />
      },
      {
        title: 'Savings',
        component: <Container></Container>
      },
      {
        title: 'Commitment Utilisation',
        component: <Container></Container>
      }
    ]
  }, [])

  return (
    <Container className={cx(css.bodyWidgetsContainer, css.dataVisualisationContainer)}>
      <TabNavigation tabs={tabsData} className={css.tabsContainer} />
    </Container>
  )
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, commonProps, className, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState<number>(defaultTab)
  return (
    <Container>
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Layout.Horizontal className={className} flex={{ justifyContent: 'center', alignItems: 'center' }}>
          {tabs.map((tab, index) => {
            return (
              <Container
                key={tab.title}
                className={cx(css.tab, {
                  [css.activeTab]: activeTab === index
                })}
                onClick={() => activeTab !== index && setActiveTab(index)}
              >
                <Text font={{ variation: FontVariation.H6 }}>{tab.title}</Text>
              </Container>
            )
          })}
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Container className={css.infoContainer}>
        {React.cloneElement((tabs[activeTab]?.component || <div />) as React.ReactElement, { ...commonProps })}
      </Container>
    </Container>
  )
}

export default DataVisualisationContainer
