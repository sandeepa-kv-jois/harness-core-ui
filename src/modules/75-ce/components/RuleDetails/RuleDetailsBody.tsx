/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { Container, FontVariation, Layout, PageBody, PageSpinner, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { Service, ServiceSavings, useSavingsOfService } from 'services/lw'
import type { TimeRangeFilterType } from '@ce/types'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import TimeRangePicker from '@ce/common/TimeRangePicker/TimeRangePicker'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import formatCost from '@ce/utils/formatCost'
import COGatewayLogs from '../COGatewayList/COGatewayLogs'
import css from './RuleDetailsBody.module.scss'

interface RulesDetailsBodyProps {
  service?: Service
}

interface CostCardProps {
  title: string
  changeInPercentage?: number | string
  cost: string
  intent: 'saving' | 'spend' | 'potential'
}

const CostCard: React.FC<CostCardProps> = ({ title, changeInPercentage, cost, intent }) => {
  return (
    <Layout.Vertical
      className={cx(css.costWidget, {
        [css.savingsWidget]: intent === 'saving',
        [css.spendWidget]: intent === 'spend'
      })}
      spacing="small"
    >
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text className={css.costText} font={{ variation: FontVariation.BODY2_SEMI }}>
          {title}
        </Text>
        {changeInPercentage && <Text font={{ variation: FontVariation.SMALL }}>{changeInPercentage}</Text>}
      </Layout.Horizontal>
      <Text className={css.costText} font={{ variation: FontVariation.H2 }}>
        {cost}
      </Text>
    </Layout.Vertical>
  )
}

const RulesDetailsBody: React.FC<RulesDetailsBodyProps> = ({ service }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const [timeRange, setTimeRange] = useState<TimeRangeFilterType>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  const {
    data: savingsData,
    loading: savingsLoading,
    refetch: refetchSavingsData
  } = useSavingsOfService({
    account_id: accountId,
    rule_id: service?.id as number,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  useEffect(() => {
    if (service && !savingsData) {
      refetchSavingsData()
    }
  }, [service])

  if (savingsLoading) {
    return <PageSpinner />
  }

  return (
    <PageBody className={css.ruleDetailsBody}>
      <Layout.Horizontal>
        <Container className={css.col1}>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Text font={{ variation: FontVariation.H3 }}>{getString('summary')}</Text>
            <TimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
          </Layout.Horizontal>
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} margin={{ top: 'medium' }}>
            <CostCard
              title="Total Savings"
              cost={formatCost(defaultTo((savingsData?.response as ServiceSavings)?.actual_savings, 0), {
                decimalPoints: 2
              })}
              intent="saving"
            />
            <CostCard
              title="Total actual spend"
              cost={formatCost(defaultTo((savingsData?.response as ServiceSavings)?.actual_cost, 0), {
                decimalPoints: 2
              })}
              intent="spend"
            />
            <CostCard
              title="Potential cost w/o rule"
              cost={formatCost(defaultTo((savingsData?.response as ServiceSavings)?.potential_cost, 0), {
                decimalPoints: 2
              })}
              intent="potential"
            />
          </Layout.Horizontal>
          <Layout.Vertical spacing={'medium'}>
            <Text font={{ variation: FontVariation.H6 }}>{'Logs'}</Text>
            <COGatewayLogs service={service} />
          </Layout.Vertical>
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
