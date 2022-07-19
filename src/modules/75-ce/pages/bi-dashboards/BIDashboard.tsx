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
  Text
} from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import { getResourceIcon, getServiceIcons } from '@ce/utils/iconsUtils'
import { QuickFilters } from '../perspective-list/PerspectiveListPage'
import css from './BIDashboard.module.scss'

const data = [
  {
    dashboardName: 'AWS EC2 Inventory Cost Dashboard',
    dashboardId: 661,
    cloudProvider: 'AWS',
    service: 'AWS EC2',
    description: 'This contains all the AWS EC2 instances inventory'
  },
  {
    dashboardName: 'AWS EC2 Inventory Cost Dashboard',
    dashboardId: 662,
    cloudProvider: 'AWS',
    service: 'AWS EC2',
    description: 'This contains all the AWS EC2 instances inventory'
  },
  {
    dashboardName: 'AWS EC2 Inventory Cost Dashboard',
    dashboardId: 663,
    cloudProvider: 'AWS',
    service: 'RDS',
    description: 'This contains all the AWS EC2 instances inventory'
  },
  {
    dashboardName: 'AWS Orphaned EBS Volumes and Snapshots',
    dashboardId: 664,
    cloudProvider: 'AWS',
    service: 'RDS',
    description: 'This contains all the AWS EC2 instances inventory'
  },
  {
    dashboardName: 'Amazon RDS',
    dashboardId: 665,
    cloudProvider: 'AWS',
    service: 'RDS',
    description: 'This contains all the AWS EC2 instances inventory'
  },
  {
    dashboardName: 'GCP Compute Engine',
    dashboardId: 666,
    service: 'RDS',
    cloudProvider: 'GCP',
    description: 'This contains all the AWS EC2 instances inventory'
  },
  {
    dashboardName: 'GCP Cost Dashboard',
    dashboardId: 230,
    cloudProvider: 'GCP',
    service: 'RDS',
    description: 'GCP Cost Dashboard..'
  },
  {
    dashboardName: 'GCP Cost Dashboard',
    dashboardId: 231,
    cloudProvider: 'GCP',
    service: 'RDS',
    description: 'GCP Cost Dashboard..'
  }
]

const filterDashboardData = (biData: any, searchParam: string, quickFilters: Record<string, boolean>) => {
  return biData
    .filter((dashboardData: any) => {
      if (!dashboardData?.dashboardName) {
        return false
      }
      if (dashboardData.dashboardName.toLowerCase().indexOf(searchParam.toLowerCase()) < 0) {
        return false
      }
      return true
    })
    .filter((dashboardData: any) => {
      const quickFilterKeysArr = Object.keys(quickFilters)
      if (!quickFilterKeysArr.length) {
        return true
      }

      if (quickFilterKeysArr.includes(dashboardData.cloudProvider)) {
        return true
      }

      return false
    })
}

const BIDashboard: React.FC = () => {
  const { getString } = useStrings()
  const [quickFilters, setQuickFilters] = useState<Record<string, boolean>>({})
  const [searchParam, setSearchParam] = useState<string>('')

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
        <Container className={css.bannerWrapper}>
          <Layout.Horizontal className={css.banner} flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text font={{ variation: FontVariation.BODY2 }} icon="info-messaging" iconProps={{ size: 24 }}>
              {getString('ce.biDashboard.bannerText')}
              <a href="#">{getString('ce.biDashboard.bannerLinkText')}</a>
            </Text>
            <Icon name="cross" size={18} />
          </Layout.Horizontal>
        </Container>
        <Container className={css.pageBodyWrapper}>
          <Layout.Masonry
            center
            gutter={25}
            items={filteredDashboardData || []}
            renderItem={item => (
              <Card style={{ width: '196px' }}>
                <Layout.Vertical spacing={'medium'}>
                  <Text
                    font={{ variation: FontVariation.H6 }}
                    icon={getResourceIcon(item.cloudProvider as string)}
                    iconProps={{ size: 24, padding: { right: 'small' } }}
                  >
                    {item.dashboardName}
                  </Text>
                  <Icon size={62} name={getServiceIcons(item.service as string)} style={{ alignSelf: 'center' }} />
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                    {item.description}
                  </Text>
                </Layout.Vertical>
              </Card>
            )}
            keyOf={item => String(item.dashboardId)}
          />
        </Container>
      </PageBody>
    </>
  )
}

export default BIDashboard
