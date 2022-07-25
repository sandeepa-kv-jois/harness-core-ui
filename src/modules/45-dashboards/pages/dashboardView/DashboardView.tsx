/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Breadcrumb, Layout } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import { SHARED_FOLDER_ID } from '@dashboards/constants'
import { LookerEventType } from '@dashboards/constants/LookerEventType'
import type { DashboardFiltersChangedEvent, PageChangedEvent } from '@dashboards/types/LookerTypes'
import {
  ErrorResponse,
  useCreateSignedUrl,
  useGetDashboardDetail,
  useGetFolderDetail
} from 'services/custom-dashboards'
import css from './DashboardView.module.scss'

const DASHBOARDS_ORIGIN = 'https://dashboards.harness.io'
const DashboardViewPage: React.FC = () => {
  const { getString } = useStrings()
  const { includeBreadcrumbs } = useDashboardsContext()

  const { accountId, viewId, folderId } = useParams<AccountPathProps & { viewId: string; folderId: string }>()
  const [embedUrl, setEmbedUrl] = React.useState<string>()
  const [dashboardFilters, setDashboardFilters] = useQueryParamsState<string | undefined>('filters', undefined)
  const [iframeState] = React.useState(0)
  const history = useHistory()

  const signedQueryUrl: string = useMemo(() => {
    const filters = `&${dashboardFilters}` ?? ''
    return `/embed/dashboards-next/${viewId}?embed_domain=${location.host}${filters}`
  }, [dashboardFilters, viewId])

  const {
    mutate: createSignedUrl,
    loading,
    error
  } = useCreateSignedUrl({ queryParams: { accountId, dashboardId: viewId, src: signedQueryUrl } })

  const responseMessages = useMemo(() => (error?.data as ErrorResponse)?.responseMessages, [error])

  React.useEffect(() => {
    const generateSignedUrl = async (): Promise<void> => {
      const { resource } = (await createSignedUrl()) || {}
      setEmbedUrl(resource)
    }

    generateSignedUrl()
  }, [viewId])

  const lookerDashboardFilterChangedEvent = (eventData: DashboardFiltersChangedEvent): void => {
    setDashboardFilters(new URLSearchParams(eventData.dashboard.dashboard_filters).toString())
  }

  const lookerPageChangedEvent = (eventData: PageChangedEvent): void => {
    if (eventData.page?.url?.includes('embed/explore')) {
      history.go(0)
    }
  }

  React.useEffect(() => {
    const lookerEventHandler = (event: MessageEvent<string>): void => {
      if (event.origin === DASHBOARDS_ORIGIN) {
        const eventType = JSON.parse(event.data)
        switch (eventType.type) {
          case LookerEventType.PAGE_CHANGED:
            lookerPageChangedEvent(eventType as PageChangedEvent)
            break
          case LookerEventType.DASHBOARD_FILTERS_CHANGED:
            lookerDashboardFilterChangedEvent(eventType as DashboardFiltersChangedEvent)
            break
        }
      }
    }

    window.addEventListener('message', lookerEventHandler)

    return () => {
      window.removeEventListener('message', lookerEventHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, viewId])

  const { data: folderDetail, refetch: fetchFolderDetail } = useGetFolderDetail({
    lazy: true,
    queryParams: { accountId, folderId }
  })

  React.useEffect(() => {
    if (folderId !== SHARED_FOLDER_ID) {
      fetchFolderDetail()
    }
  }, [accountId, fetchFolderDetail, folderId])

  const { data: dashboardDetail } = useGetDashboardDetail({ dashboard_id: viewId, queryParams: { accountId } })

  React.useEffect(() => {
    const links: Breadcrumb[] = []
    if (folderDetail?.resource) {
      links.push({
        url: routes.toCustomFolderHome({ accountId }),
        label: getString('dashboards.homePage.folders')
      })
      links.push({
        url: routes.toViewCustomFolder({ folderId, accountId }),
        label: folderDetail.resource
      })
    }
    embedUrl &&
      dashboardDetail &&
      links.push({
        url: routes.toViewCustomDashboard({ viewId, folderId, accountId }),
        label: dashboardDetail.title
      })
    includeBreadcrumbs(links)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderDetail?.resource, dashboardDetail, accountId, viewId, embedUrl])

  return (
    <Page.Body
      className={css.pageContainer}
      loading={loading}
      error={responseMessages}
      noData={{
        when: () => embedUrl === undefined,
        icon: 'dashboard',
        message: 'Dashboard not available'
      }}
    >
      <Layout.Vertical className={css.frame}>
        <iframe
          src={embedUrl}
          key={iframeState}
          height="100%"
          width="100%"
          frameBorder="0"
          id="looker-dashboard"
          data-testid="dashboard-iframe"
        />
      </Layout.Vertical>
    </Page.Body>
  )
}

export default DashboardViewPage
