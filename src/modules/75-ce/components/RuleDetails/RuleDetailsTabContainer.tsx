/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { isEmpty, defaultTo } from 'lodash-es'
import { Container, FontVariation, Icon, IconName, Layout, Table, Text } from '@harness/uicore'
import type { AccessPoint, Resource, Service } from 'services/lw'
import { useStrings } from 'framework/strings'
import { InstanceStatusIndicatorV2 } from '@ce/common/InstanceStatusIndicator/InstanceStatusIndicator'
import { Utils } from '@ce/common/Utils'
import CopyButton from '@ce/common/CopyButton'
import { allProviders, ceConnectorTypes } from '@ce/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useBooleanStatus } from '@common/hooks'
import css from './RuleDetailsBody.module.scss'

interface RuleDetailsTabContainerProps {
  service: Service
  healthStatus: string
  refetchHealthStatus: () => void
  connectorData?: ConnectorInfoDTO
  accessPointData?: AccessPoint
  resources?: Resource[]
}

interface DetailRowProps {
  label: string
  value: string | React.ReactNode
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <Container className={css.detailRow}>
      <Text font={{ variation: FontVariation.BODY2 }}>{label}</Text>
      {typeof value === 'string' ? <Text font={{ variation: FontVariation.BODY }}>{value}</Text> : value}
    </Container>
  )
}

const LinkWithCopy: React.FC<{ url: string; protocol: string }> = ({ url, protocol = 'http' }) => {
  const completeUrl = `${protocol}://${url}`
  return (
    <Layout.Horizontal>
      <Text
        lineClamp={1}
        className={css.link}
        onClick={() => {
          window.open(completeUrl, '_blank')
        }}
      >
        {url}
      </Text>
      <CopyButton textToCopy={completeUrl} iconProps={{ size: 14 }} small />
    </Layout.Horizontal>
  )
}

const ManagedVms: React.FC<{ resources: Resource[] }> = ({ resources }) => {
  const { getString } = useStrings()
  const { state, toggle } = useBooleanStatus()
  return (
    <Layout.Horizontal flex={{ alignItems: 'center' }}>
      <Text>{resources.length}</Text>
      {resources.length && (
        <Container>
          <Text rightIcon={state ? 'main-chevron-up' : 'main-chevron-down'} onClick={toggle}>
            {getString('ce.common.collapse')}
          </Text>
          {state && (
            <Table<Resource>
              data={resources}
              bpTableProps={{ bordered: true, condensed: true, striped: false }}
              columns={[
                {
                  accessor: 'name',
                  Header: 'Name/ID',
                  width: '25%',
                  Cell: ({ row }) => (
                    <Layout.Vertical>
                      <Text>{row.original.name}</Text>
                      <Text>{row.original.id}</Text>
                    </Layout.Vertical>
                  )
                },
                {
                  accessor: 'ipv4',
                  Header: 'Public/Private IP',
                  width: '25%',
                  Cell: ({ row }) => (
                    <Layout.Vertical>
                      <Text>{row.original.ipv4}</Text>
                      <Text>{row.original.private_ipv4}</Text>
                    </Layout.Vertical>
                  )
                },
                {
                  accessor: 'type',
                  Header: 'Instance family',
                  width: '25%',
                  Cell: ({ row }) => (
                    <Layout.Vertical>
                      <Text>{row.original.type}</Text>
                    </Layout.Vertical>
                  )
                },
                {
                  accessor: 'tags',
                  Header: 'Tags',
                  width: '25%',
                  Cell: ({ row }) => (
                    <Layout.Vertical>
                      {row.original.tags &&
                        Object.entries(row.original.tags).map(([key, value]) => {
                          return <Text key={key}>{`${key}: ${value}`}</Text>
                        })}
                    </Layout.Vertical>
                  )
                }
              ]}
            />
          )}
        </Container>
      )}
    </Layout.Horizontal>
  )
}

const RuleDetailsTabContainer: React.FC<RuleDetailsTabContainerProps> = ({
  service,
  healthStatus,
  refetchHealthStatus,
  connectorData,
  accessPointData,
  resources
}) => {
  const { getString } = useStrings()

  const domainProtocol = useMemo(() => {
    const hasHttpsConfig = !isEmpty(
      service.routing?.ports?.find(portConfig => portConfig.protocol?.toLowerCase() === 'https')
    )
    return Utils.getConditionalResult(hasHttpsConfig, 'https', 'http')
  }, [service.routing?.ports])

  const isK8sRule = service.kind === 'k8s'
  const cloudProvider = connectorData?.type && ceConnectorTypes[connectorData?.type]
  const provider = useMemo(() => allProviders.find(item => item.value === cloudProvider), [cloudProvider])
  const iconName = isK8sRule ? 'app-kubernetes' : (defaultTo(provider?.icon, 'spinner') as IconName)

  return (
    <Container className={css.tabRowContainer}>
      {!service ? (
        <Icon name="spinner" />
      ) : (
        <>
          <Layout.Vertical spacing={'medium'}>
            <Text font={{ variation: FontVariation.H5 }}>{getString('ce.co.gatewayReview.gatewayDetails')}</Text>
            <DetailRow label={getString('ce.co.ruleDetails.detailsTab.label.ruleId')} value={`${service.id}`} />
            <DetailRow label={getString('ce.co.ruleDetailsHeader.idleTime')} value={`${service.idle_time_mins} min`} />
            {/* AWS Details - EC2 */}
            <DetailRow
              label={getString('ce.co.gatewayReview.instanceType')}
              value={
                service.fulfilment === 'ondemand'
                  ? getString('ce.nodeRecommendation.onDemand')
                  : getString('ce.nodeRecommendation.spot')
              }
            />
            <DetailRow
              label={getString('ce.co.ruleDetailsHeader.hostName')}
              value={<LinkWithCopy url={defaultTo(service.host_name, '')} protocol={domainProtocol} />}
            />
            <DetailRow
              label={getString('connector')}
              value={
                <Text icon={iconName} iconProps={{ size: 22 }}>
                  {defaultTo(connectorData?.name, '')}
                </Text>
              }
            />
            <DetailRow
              label={getString('ce.co.accessPoint.loadbalancer')}
              value={defaultTo(accessPointData?.name, '')}
            />
            <DetailRow
              label={getString('ce.co.ruleDetails.detailsTab.label.vmsManaged')}
              value={<ManagedVms resources={defaultTo(resources, [])} />}
            />
            {/* AWS Details end */}
            <DetailRow
              label={getString('ce.co.rulesTableHeaders.status')}
              value={
                <InstanceStatusIndicatorV2
                  status={healthStatus}
                  disabled={service.disabled}
                  refetchStatus={refetchHealthStatus}
                />
              }
            />
          </Layout.Vertical>
        </>
      )}
    </Container>
  )
}

export default RuleDetailsTabContainer
