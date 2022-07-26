/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import {
  Card,
  Color,
  Container,
  ExpandingSearchInput,
  FlexExpander,
  FontVariation,
  Icon,
  Layout,
  PageBody,
  PageHeader,
  PageSpinner,
  Text
} from '@harness/uicore'
import { Link, useParams } from 'react-router-dom'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import { getResourceIcon, getServiceIcons } from '@ce/utils/iconsUtils'
import routes from '@common/RouteDefinitions'
import { BIDashboardSummary, useListBIDashboards } from 'services/ce'
import { QuickFilters } from '../perspective-list/PerspectiveListPage'
import css from './BIDashboard.module.scss'

/* istanbul ignore next */
const filterDashboardData: (
  biData: BIDashboardSummary[],
  searchParam: string,
  quickFilters: Record<string, boolean>
) => BIDashboardSummary[] = (biData, searchParam, quickFilters) => {
  return biData
    .filter((dashboardData: BIDashboardSummary) => {
      if (!dashboardData?.dashboardName) {
        return false
      }
      if (dashboardData.dashboardName.toLowerCase().indexOf(searchParam.toLowerCase()) < 0) {
        return false
      }
      return true
    })
    .filter((dashboardData: BIDashboardSummary) => {
      const quickFilterKeysArr = Object.keys(quickFilters)
      if (!quickFilterKeysArr.length) {
        return true
      }

      if (quickFilterKeysArr.includes(dashboardData?.cloudProvider || '')) {
        return true
      }

      return false
    })
}

const BIDashboard: React.FC = () => {
  const { getString } = useStrings()
  const [quickFilters, setQuickFilters] = useState<Record<string, boolean>>({})
  const [searchParam, setSearchParam] = useState<string>('')
  const { accountId } = useParams<{ accountId: string }>()

  const { data: dashboardList, loading } = useListBIDashboards({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const data = dashboardList?.data || /* istanbul ignore next */ []

  const filteredDashboardData = useMemo(() => {
    return filterDashboardData(data, searchParam, quickFilters)
  }, [data, searchParam, quickFilters])

  return (
    <>
      <PageHeader
        title={
          <Text
            color="grey800"
            style={{ fontSize: 20, fontWeight: 'bold' }}
            tooltipProps={{ dataTooltipId: 'ccmBIDashboards' }}
          >
            {getString('ce.biDashboard.sideNavText')}
          </Text>
        }
        breadcrumbs={<NGBreadcrumbs />}
      />
      <Layout.Horizontal className={css.header}>
        <QuickFilters
          quickFilters={quickFilters}
          setQuickFilters={setQuickFilters}
          countInfo={{}}
          showCount={false}
          showDefault={false}
        />
        <FlexExpander />
        <ExpandingSearchInput
          placeholder={getString('search')}
          alwaysExpanded
          onChange={text => {
            setSearchParam(text.trim())
          }}
        />
      </Layout.Horizontal>
      <PageBody>
        {loading ? <PageSpinner /> : null}
        <Container className={css.bannerWrapper}>
          <Layout.Horizontal className={css.banner} flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text font={{ variation: FontVariation.BODY2 }} icon="info-messaging" iconProps={{ size: 24 }}>
              {getString('ce.biDashboard.bannerText')}
              <Link
                to={routes.toCustomDashboardHome({
                  accountId: accountId
                })}
              >
                {getString('ce.biDashboard.bannerLinkText')}
              </Link>
            </Text>
            <Icon name="cross" size={18} />
          </Layout.Horizontal>
        </Container>
        <Container className={css.pageBodyWrapper}>
          <Layout.Masonry
            center
            gutter={25}
            items={filteredDashboardData || /* istanbul ignore next */ []}
            renderItem={item => (
              <Link
                to={routes.toViewCustomDashboard({
                  viewId: String(item.dashboardId),
                  accountId: accountId,
                  folderId: 'shared'
                })}
              >
                <Card style={{ width: '196px' }}>
                  <Layout.Vertical spacing={'medium'}>
                    <Text
                      font={{ variation: FontVariation.H6 }}
                      icon={getResourceIcon(item.cloudProvider as string)}
                      iconProps={{ size: 24, padding: { right: 'small' } }}
                    >
                      {item.dashboardName}
                    </Text>
                    <Icon
                      size={62}
                      name={getServiceIcons(item.serviceType as string)}
                      style={{
                        alignSelf: 'center',
                        color:
                          getServiceIcons(item.serviceType as string) === 'default-dashboard'
                            ? 'var(--primary-7)'
                            : 'inherit'
                      }}
                    />
                    <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                      {item.description}
                    </Text>
                  </Layout.Vertical>
                </Card>
              </Link>
            )}
            keyOf={item => String(item.dashboardId)}
          />
        </Container>
      </PageBody>
    </>
  )
}

export default BIDashboard
