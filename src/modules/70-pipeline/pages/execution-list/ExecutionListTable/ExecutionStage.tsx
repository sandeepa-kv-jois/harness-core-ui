/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Icon, IconName, Layout, Text } from '@harness/uicore'
import React from 'react'
import type { CellProps } from 'react-table'
import { Duration } from '@common/components'
import { ExecutionStatusIcon } from '@pipeline/components/ExecutionStatusIcon/ExecutionStatusIcon'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import css from './ExecutionListTable.module.scss'

export interface ExecutionStageProps {
  row?: CellProps<PipelineExecutionSummary>['row']
  stage: PipelineGraphState
}

const stageIconMap: Partial<Record<StageType, IconName>> = {
  [StageType.BUILD]: 'cd-main',
  [StageType.DEPLOY]: 'ci-main',
  [StageType.SECURITY]: 'sto-color-filled'
}

export const ExecutionStage = ({ stage }: ExecutionStageProps) => {
  // const {
  //   successfulStagesCount,
  //   runningStagesCount,
  //   failedStagesCount = 0,
  //   status,
  //   totalStagesCount,
  //   executionErrorInfo,
  //   pipelineIdentifier = '',
  //   planExecutionId = ''
  // } = data

  const iconName = stageIconMap[stage.type as StageType]
  return (
    <div className={css.stage}>
      <Layout.Horizontal spacing="small">
        {iconName && <Icon name={iconName} size={20} className={css.moduleIcon} />}
        <Text font={{ size: 'small' }} color={Color.GREY_900} lineClamp={1}>
          {stage.name}
        </Text>
      </Layout.Horizontal>
      <div>
        <ExecutionStatusIcon status={stage.data?.status as ExecutionStatus} className={css.status} />
      </div>
      <Text font={{ size: 'small' }} color={Color.GREY_900} lineClamp={1}>
        {stage.id}
      </Text>
      <Text font={{ size: 'small' }} color={Color.RED_800} lineClamp={1}>
        {stage.data?.failureInfo?.message}
      </Text>
      <Duration
        startTime={stage.data?.startTs}
        endTime={stage.data?.endTs}
        font={{ variation: FontVariation.SMALL }}
        color={Color.GREY_500}
        durationText=""
      />
    </div>
  )
}
