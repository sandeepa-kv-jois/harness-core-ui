/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, FontVariation, Layout, PageBody, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Service } from 'services/lw'
import type { TimeRangeFilterType } from '@ce/types'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import TimeRangePicker from '@ce/common/TimeRangePicker/TimeRangePicker'
import css from './RuleDetailsBody.module.scss'

interface RulesDetailsBodyProps {
  service?: Service
}

interface CostCardProps {
  title: string
  changeInPercentage?: number | string
  cost: string
}

const CostCard: React.FC<CostCardProps> = ({ title, changeInPercentage, cost }) => {
  return (
    <Container>
      <Layout.Horizontal>
        <Text font={{ variation: FontVariation.SMALL }}>{title}</Text>
        {changeInPercentage && <Text>{changeInPercentage}</Text>}
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.H5 }}>{cost}</Text>
    </Container>
  )
}

const RulesDetailsBody: React.FC<RulesDetailsBodyProps> = () => {
  const { getString } = useStrings()

  const [timeRange, setTimeRange] = useState<TimeRangeFilterType>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  return (
    <PageBody className={css.ruleDetailsBody}>
      <Layout.Horizontal>
        <Container className={css.col1}>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Text font={{ variation: FontVariation.H3 }}>{getString('summary')}</Text>
            <TimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
          </Layout.Horizontal>
          <Layout.Horizontal>
            <CostCard title="Total Savings" changeInPercentage={17.32} cost={'$2994.18'} />
          </Layout.Horizontal>
        </Container>
        <div className={css.colDivider} />
        <Container className={css.col2}>
          <Text font={{ variation: FontVariation.H3 }}>{getString('summary')}</Text>
        </Container>
      </Layout.Horizontal>
    </PageBody>
  )
}

export default RulesDetailsBody
