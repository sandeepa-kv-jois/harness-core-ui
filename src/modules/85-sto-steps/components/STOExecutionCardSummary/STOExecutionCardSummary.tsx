/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Spinner } from '@blueprintjs/core'
import { Text } from '@harness/uicore'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import SeverityPill from '@sto-steps/components/SeverityPill/SeverityPill'
import { SeverityCode } from '@sto-steps/types'
import { useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { useIssueCounts } from 'services/sto'
import css from './STOExecutionCardSummary.module.scss'

export default function STOExecutionCardSummary(
  props: ExecutionCardInfoProps<PipelineExecutionSummary>
): React.ReactElement {
  const { data } = props
  const { pipelineIdentifier = '', planExecutionId: executionId = '', status: pipelineStatus = '' } = data

  const { getString } = useStrings()
  const { data: issueCounts, loading, error } = useIssueCounts(pipelineIdentifier, executionId)

  if (!pipelineIdentifier || !executionId || !pipelineStatus) {
    return <></>
  }

  switch (pipelineStatus) {
    case 'Running':
    case 'AsyncWaiting':
    case 'TaskWaiting':
    case 'TimedWaiting':
    case 'NotStarted':
    case 'ResourceWaiting':
    case 'InterventionWaiting':
    case 'ApprovalWaiting':
    case 'InputWaiting':
      return (
        <div className={css.spinnerWrapper}>
          <Spinner size={Spinner.SIZE_SMALL} />
        </div>
      )
    case 'Success':
      if (loading) {
        return (
          <div className={css.spinnerWrapper}>
            <Spinner size={Spinner.SIZE_SMALL} />
          </div>
        )
      } else {
        // Determine if an informational message should be shown, instead of Security Issue counts
        let message: JSX.Element | undefined = undefined
        if (error?.status === 404 || (issueCounts && Object.keys(issueCounts).length === 0)) {
          message = <Text font={{ size: 'small' }}>{getString('stoSteps.noSecurityTests')}</Text>
        } else if (!issueCounts || error) {
          message = (
            <Text icon="error" intent="danger" font={{ size: 'small' }}>
              {getString('stoSteps.failedToGetIssueCounts')}
            </Text>
          )
        } else if (!(issueCounts?.critical || issueCounts?.high || issueCounts?.medium || issueCounts?.low)) {
          message = (
            <Text icon={'tick-circle'} iconProps={{ intent: 'success' }} font={{ size: 'small' }}>
              {getString('stoSteps.noSecurityIssues')}
            </Text>
          )
        }

        // Render the message or display issue counts
        if (message) {
          return <div className={css.main}>{message}</div>
        } else {
          return (
            <div className={css.main}>
              {issueCounts?.critical ? (
                <SeverityPill severity={SeverityCode.Critical} value={issueCounts.critical} />
              ) : null}
              {issueCounts?.high ? <SeverityPill severity={SeverityCode.High} value={issueCounts.high} /> : null}
              {issueCounts?.medium ? <SeverityPill severity={SeverityCode.Medium} value={issueCounts.medium} /> : null}
              {issueCounts?.low ? <SeverityPill severity={SeverityCode.Low} value={issueCounts.low} /> : null}
            </div>
          )
        }
      }
    case 'Failed':
    case 'Errored':
    case 'Expired':
    case 'IgnoreFailed':
    case 'Aborted':
    case 'Suspended':
      return (
        <div className={css.main}>
          <Text font={{ size: 'small' }}>{getString('stoSteps.noSecurityTests')}</Text>
        </div>
      )
    default:
      return <div className={css.main}></div>
  }
}
