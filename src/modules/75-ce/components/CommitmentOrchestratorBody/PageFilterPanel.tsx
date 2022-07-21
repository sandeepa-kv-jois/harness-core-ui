/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Select } from '@harness/uicore'
import TimeRangePicker from '@ce/common/TimeRangePicker/TimeRangePicker'
import type { TimeRangeFilterType } from '@ce/types'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import css from './CommitmentOrchestrationBody.module.scss'

const PageFilterPanel: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilterType>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  return (
    <Container padding={{ top: 'large', bottom: 'large', left: 'xlarge', right: 'xlarge' }} className={css.filterPanel}>
      <Layout.Horizontal flex>
        <Layout.Horizontal spacing={'medium'}>
          <Select items={[]} />
          <Select items={[]} />
          <Select items={[]} />
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'medium'}>
          <TimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default PageFilterPanel
