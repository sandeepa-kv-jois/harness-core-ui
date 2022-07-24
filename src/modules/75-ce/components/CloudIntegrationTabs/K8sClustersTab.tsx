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
  Icon,
  IconName,
  Layout,
  TableV2,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, Popover, PopoverInteractionKind, Position, Spinner } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import qs from 'qs'
import type { CellProps, Column, Renderer } from 'react-table'
import cx from 'classnames'
import { debounce } from 'lodash-es'
import ReactTimeago from 'react-timeago'

import routes from '@common/RouteDefinitions'
import RbacButton from '@rbac/components/Button/Button'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { useStrings } from 'framework/strings'
import {
  CcmK8sConnectorResponse,
  ConnectorInfoDTO,
  PageCcmK8sConnectorResponse,
  useGetCCMK8SConnectorList,
  useGetTestConnectionResult
} from 'services/cd-ng'
import { CcmK8sMetaInfo, useCCMK8SMetadata } from 'services/ce'
import { useFetchCcmMetaDataQuery } from 'services/ce/services'
import { generateFilters } from '@ce/utils/anomaliesUtils'
import { GROUP_BY_CLUSTER_NAME } from '@ce/utils/perspectiveUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { CloudProvider } from '@ce/types'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'

import { useCloudVisibilityModal } from '../CloudVisibilityModal/CloudVisibilityModal'
import { useAutoStoppingModal } from '../AutoStoppingModal/AutoStoppingModal'

import css from './CloudIntegrationTabs.module.scss'

type CustomColumn = Column<CustomConnectorResponse>[]
type CustomCell = Renderer<CellProps<CustomConnectorResponse>>

const ConnectorNameCell: CustomCell = cell => {
  const name = cell.row.original?.k8sConnector?.connector?.name

  return (
    <Text
      icon="app-kubernetes"
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

  const [status, setStatus] = useState(data?.k8sConnector?.status?.status)
  const [errorSummary, setErrorSummary] = useState(data.k8sConnector?.status?.errorSummary)
  const [lastTestedAt, setLastTestedAt] = useState<number | undefined>(
    data.k8sConnector?.status?.lastTestedAt || data.k8sConnector?.status?.testedAt
  )

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: data.k8sConnector?.connector?.identifier || '',
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
const FeaturesEnabledCell: CustomCell = cell => {
  const { getString } = useStrings()

  const featureInfo = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.CCM_K8S_CLUSTERS
    }
  })

  const k8sConnector = cell.row.original.k8sConnector?.connector as ConnectorInfoDTO
  const metadata = cell.row.original.metadata
  const ccmk8sConnectorList = cell.row.original?.ccmk8sConnector

  const ccmk8sConnector = ccmk8sConnectorList?.[0]?.connector as ConnectorInfoDTO
  const permissions = (ccmk8sConnector?.spec?.featuresEnabled || []) as string[]

  const [openCloudVisibilityModal] = useCloudVisibilityModal({ connector: k8sConnector })
  const [openAutoStoppingModal] = useAutoStoppingModal({ connector: ccmk8sConnector })

  const isReportingEnabled = permissions.includes('VISIBILITY')
  const isAutoStoppingEnabled = permissions.includes('OPTIMIZATION')

  const props = {
    className: cx(css.permissionTag, css.success),
    background: Color.PURPLE_50,
    color: Color.PURPLE_700,
    icon: 'tick' as IconName,
    iconProps: { size: 12, color: Color.PURPLE_700 }
  }

  const isLastEventRecieved = !metadata?.visibility?.[0]?.includes('No events received')

  return (
    <Layout.Horizontal className={css.features}>
      {!ccmk8sConnectorList?.length ? (
        <Button
          icon="ccm-solid"
          variation={ButtonVariation.SECONDARY}
          text={getString('ce.cloudIntegration.enableCloudCosts')}
          onClick={e => {
            e.stopPropagation()
            openCloudVisibilityModal()
          }}
          disabled={!featureInfo.enabled}
        />
      ) : (
        <>
          {isReportingEnabled ? (
            <Popover
              disabled={!metadata}
              popoverClassName={Classes.DARK}
              position={Position.BOTTOM}
              interactionKind={PopoverInteractionKind.HOVER}
              content={
                <Layout.Horizontal className={css.lastEvent} spacing={'small'}>
                  <Icon
                    name={isLastEventRecieved ? 'heart' : 'heart-broken'}
                    size={18}
                    padding={'xsmall'}
                    color={isLastEventRecieved ? Color.GREEN_700 : Color.RED_700}
                  />
                  <Text color={Color.WHITE} font={{ variation: FontVariation.BODY }}>
                    {metadata?.visibility}
                  </Text>
                </Layout.Horizontal>
              }
            >
              <Text {...props}>{getString('ce.cloudIntegration.reporting')}</Text>
            </Popover>
          ) : null}
          {isAutoStoppingEnabled ? (
            <Text {...props}>{getString('common.ce.autostopping')}</Text>
          ) : (
            <Button
              icon="plus"
              variation={ButtonVariation.SECONDARY}
              className={css.addAutoStoppingBtn}
              text={getString('common.ce.autostopping')}
              onClick={e => {
                e.stopPropagation()
                openAutoStoppingModal()
              }}
            />
          )}
        </>
      )}
    </Layout.Horizontal>
  )
}

type CustomPageConnectorResponse = PageCcmK8sConnectorResponse & {
  content?: {
    metadata?: CcmK8sMetaInfo
  }
}

type CustomConnectorResponse = CcmK8sConnectorResponse & {
  metadata?: CcmK8sMetaInfo
}

const K8sClustersTab: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()

  const [k8sClusters, setK8sClusters] = useState<CustomPageConnectorResponse>()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const [ccmMetaResult] = useFetchCcmMetaDataQuery()
  const { data: ccmMetaDataRes, fetching: fetchingCCMMetaData } = ccmMetaResult

  const { loading, mutate: fetchConnectors } = useGetCCMK8SConnectorList({
    queryParams: {
      searchTerm,
      pageIndex: page,
      pageSize: 10,
      accountIdentifier: accountId
    }
  })

  const { loading: k8sMetadataLoading, mutate: fetchK8sMetadata } = useCCMK8SMetadata({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const getK8sConnectors = async () => {
    const { data: connectorResponse } = await fetchConnectors({
      filterType: 'Connector',
      types: ['K8sCluster', 'CEK8sCluster']
    })

    const ccmK8sConnectorId = connectorResponse?.content
      ?.map(item => item.ccmk8sConnector?.[0]?.connector?.identifier)
      .filter(item => item) as string[]

    const { data: k8sMetadataRes } = await fetchK8sMetadata({ ccmK8sConnectorId })

    const res = {
      ...connectorResponse,
      content: connectorResponse?.content?.map(item => ({
        ...item,
        metadata: k8sMetadataRes?.ccmK8sMeta?.find(
          meta => meta.ccmk8sConnectorId === item.ccmk8sConnector?.[0]?.connector?.identifier
        )
      }))
    }

    setK8sClusters(res)
  }

  useEffect(() => {
    getK8sConnectors()
  }, [page, searchTerm])

  const cloudProvider = 'CLUSTER' as CloudProvider
  const defaultClusterPerspectiveId = ccmMetaDataRes?.ccmMetaData?.defaultClusterPerspectiveId as string

  const ViewCostsCell: CustomCell = cell => {
    const ccmk8sConnectorList = cell.row.original.ccmk8sConnector
    const connector = ccmk8sConnectorList?.[0]?.connector

    const connectorName = connector?.name || ''
    const isReportingEnabled = connector?.spec?.featuresEnabled?.includes('VISIBILITY')

    const route = useMemo(
      () =>
        routes.toPerspectiveDetails({
          accountId: accountId,
          perspectiveId: defaultClusterPerspectiveId,
          perspectiveName: defaultClusterPerspectiveId
        }) +
        `?${qs.stringify({
          filters: JSON.stringify(generateFilters({ clusterName: connectorName }, cloudProvider)),
          groupBy: JSON.stringify(GROUP_BY_CLUSTER_NAME)
        })}`,
      []
    )

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
        accessor: 'name',
        Header: getString('connectors.name'),
        Cell: ConnectorNameCell,
        width: '30%'
      },
      {
        accessor: 'status',
        Header: getString('ce.cloudIntegration.connectorStatus'),
        Cell: ConnectorStatusCell,
        width: '30%'
      },
      {
        accessor: 'featuresEnabled',
        Header: getString('ce.cloudIntegration.featuresEnabled'),
        Cell: FeaturesEnabledCell,
        width: '35%'
      },
      {
        accessor: 'viewCosts',
        Header: '',
        Cell: ViewCostsCell,
        width: '15%'
      }
    ],
    [defaultClusterPerspectiveId]
  )

  const debouncedSearch = useCallback(
    debounce((text: string) => setSearchTerm(text), 500),
    []
  )

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: getK8sConnectors
  })

  const isLoading = loading || fetchingCCMMetaData || k8sMetadataLoading

  return (
    <Container className={css.main}>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          text={getString('newConnector')}
          icon="plus"
          permission={{
            permission: PermissionIdentifier.UPDATE_CONNECTOR,
            resource: {
              resourceType: ResourceType.CONNECTOR
            }
          }}
          onClick={() => openConnectorModal(false, 'K8sCluster', undefined)}
          id="newConnectorBtn"
          data-test="newConnectorButton"
        />
        <FlexExpander />
        <ExpandingSearchInput
          placeholder={getString('search')}
          onChange={text => debouncedSearch(text)}
          className={css.search}
        />
      </Layout.Horizontal>
      {!isLoading ? (
        <TableV2<CustomConnectorResponse>
          data={k8sClusters?.content || []}
          columns={columns as CustomColumn}
          className={css.table}
          onRowClick={({ k8sConnector }) =>
            history.push(routes.toConnectorDetails({ accountId, connectorId: k8sConnector?.connector?.identifier }))
          }
          pagination={{
            itemCount: k8sClusters?.totalItems || 0,
            pageSize: k8sClusters?.pageSize || 10,
            pageCount: k8sClusters?.totalPages || -1,
            pageIndex: k8sClusters?.pageIndex || 0,
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

export default K8sClustersTab
