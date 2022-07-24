/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  FlexExpander,
  Layout,
  TableV2,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Spinner } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import { debounce } from 'lodash-es'
import ReactTimeago from 'react-timeago'

import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import {
  ConnectorResponse,
  PageConnectorResponse,
  useGetConnectorListV2,
  useGetTestConnectionResult
} from 'services/cd-ng'
import { CcmMetaData, useFetchCcmMetaDataQuery } from 'services/ce/services'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'

import css from './CloudIntegrationTabs.module.scss'

type CustomColumn = Column<ConnectorResponse>[]
type CustomCell = Renderer<CellProps<ConnectorResponse>>

const ConnectorNameCell: CustomCell = cell => {
  const name = cell.row.original?.connector?.name
  const connectorType = cell.row.original.connector?.type

  return (
    <Text
      icon={getIconByType(connectorType)}
      iconProps={{ size: 30, margin: { right: 'small' } }}
      font={{ variation: FontVariation.BODY2 }}
      className={css.nameCell}
      lineClamp={1}
    >
      {name}
    </Text>
  )
}

const ConnectorStatusCell: CustomCell = cell => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()

  const data = cell.row.original

  const [status, setStatus] = useState(data?.status?.status)
  const [errorSummary, setErrorSummary] = useState(data.status?.errorSummary)
  const [lastTestedAt, setLastTestedAt] = useState<number | undefined>(
    data?.status?.lastTestedAt || data?.status?.testedAt
  )

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: data.connector?.identifier || '',
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const isStatusSuccess = status === 'SUCCESS'

  return (
    <div className={css.statusCell}>
      <Text
        icon={'full-circle'}
        iconProps={{ size: 8, color: isStatusSuccess ? Color.GREEN_500 : Color.RED_500 }}
        font={{ variation: FontVariation.BODY }}
        tooltip={
          <Text className={css.statusError} color={Color.WHITE} font={{ variation: FontVariation.BODY }}>
            {errorSummary?.trim()}
          </Text>
        }
        tooltipProps={{ isDark: true, position: 'bottom', disabled: isStatusSuccess }}
        color={isStatusSuccess ? Color.GREY_800 : Color.RED_500}
      >
        <ReactTimeago date={lastTestedAt || ''} />
      </Text>
      {!isStatusSuccess ? (
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text={getString('common.smtp.testConnection')}
          className={css.testBtn}
          onClick={async e => {
            try {
              e.stopPropagation()
              const res = await testConnection()
              if (res.status === 'SUCCESS') {
                setStatus(res.status)
              }
            } catch (err) {
              setErrorSummary(err?.data?.message)
            } finally {
              setLastTestedAt(new Date().getTime())
            }
          }}
        />
      ) : null}
    </div>
  )
}

const LastUpdatedCell: CustomCell = cell => {
  const lastModifiedAt = cell.row.original.lastModifiedAt

  return (
    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800} lineClamp={1}>
      <ReactTimeago date={lastModifiedAt || ''} />
    </Text>
  )
}

const defaultPerspectiveIdMap: Record<string, keyof CcmMetaData> = {
  CEAzure: 'defaultAzurePerspectiveId',
  CEAws: 'defaultAwsPerspectiveId',
  GcpCloudCost: 'defaultGcpPerspectiveId'
}

const CloudAccountsTab: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()

  const [cloudAccounts, setCloudAccounts] = useState<PageConnectorResponse>()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const [ccmMetaResult] = useFetchCcmMetaDataQuery()
  const { data: ccmMetaDataRes, fetching: fetchingCCMMetaData } = ccmMetaResult

  const { loading, mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: {
      searchTerm,
      pageIndex: page,
      pageSize: 10,
      accountIdentifier: accountId
    }
  })

  const getCloudAccounts = async () => {
    const { data: connectorResponse } = await fetchConnectors({
      filterType: 'Connector',
      types: ['CEAws', 'GcpCloudCost', 'CEAzure']
    })

    setCloudAccounts(connectorResponse)
  }

  useEffect(() => {
    getCloudAccounts()
  }, [page, searchTerm])

  const ccmMetaData = ccmMetaDataRes?.ccmMetaData

  const ViewCostsCell: CustomCell = cell => {
    const connector = cell.row.original.connector
    const connectorType = connector?.type || ''
    const isReportingEnabled = connector?.spec?.featuresEnabled?.includes('VISIBILITY')
    const defaultPerspectiveIdString = defaultPerspectiveIdMap[connectorType]
    const defaultPerspectiveId = ccmMetaData?.[defaultPerspectiveIdString] as string

    const route = routes.toPerspectiveDetails({
      accountId: accountId,
      perspectiveId: defaultPerspectiveId,
      perspectiveName: defaultPerspectiveId
    })

    return isReportingEnabled ? (
      <Button
        variation={ButtonVariation.LINK}
        rightIcon="launch"
        iconProps={{ size: 12, color: Color.PRIMARY_7 }}
        text={getString('ce.cloudIntegration.viewCosts')}
        onClick={e => {
          e.stopPropagation()
          const baseUrl = window.location.href.split('#')[0]
          window.open(`${baseUrl}#${route}`)
        }}
      />
    ) : null
  }

  const columns = useMemo(
    () => [
      {
        accessor: 'connector.name',
        Header: getString('connectors.name'),
        Cell: ConnectorNameCell,
        width: '25%'
      },
      {
        accessor: 'connector.status',
        Header: getString('ce.cloudIntegration.connectorStatus'),
        Cell: ConnectorStatusCell,
        width: '35%'
      },
      {
        accessor: 'lastUpdated',
        Header: getString('delegates.lastUpdated'),
        Cell: LastUpdatedCell,
        width: '25%'
      },
      {
        accessor: 'viewCosts',
        Header: '',
        Cell: ViewCostsCell,
        width: '15%'
      }
    ],
    [ccmMetaData]
  )

  const debouncedSearch = useCallback(
    debounce((text: string) => setSearchTerm(text), 500),
    []
  )

  const isLoading = loading || fetchingCCMMetaData

  return (
    <Container className={css.main}>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <FlexExpander />
        <ExpandingSearchInput
          placeholder={getString('search')}
          onChange={text => debouncedSearch(text)}
          className={css.search}
        />
      </Layout.Horizontal>
      {!isLoading ? (
        <TableV2<ConnectorResponse>
          data={cloudAccounts?.content || []}
          columns={columns as CustomColumn}
          className={css.table}
          onRowClick={({ connector }) =>
            history.push(routes.toConnectorDetails({ accountId, connectorId: connector?.identifier }))
          }
          pagination={{
            itemCount: cloudAccounts?.totalItems || 0,
            pageSize: cloudAccounts?.pageSize || 10,
            pageCount: cloudAccounts?.totalPages || -1,
            pageIndex: cloudAccounts?.pageIndex || 0,
            gotoPage: pageNo => setPage(pageNo)
          }}
        />
      ) : (
        <Container className={css.spinner}>
          <Spinner />
        </Container>
      )}
    </Container>
  )
}

export default CloudAccountsTab
