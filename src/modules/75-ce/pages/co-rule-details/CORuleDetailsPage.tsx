/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  Icon,
  IconName,
  Layout,
  PageHeader,
  PageSpinner,
  Text
} from '@harness/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Service, useRouteDetails } from 'services/lw'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useGetAggregatedUsers, useGetConnector, UserAggregate } from 'services/cd-ng'
import { allProviders, ceConnectorTypes } from '@ce/constants'
import { getRelativeTime } from '@ce/components/COGatewayList/Utils'
import { CE_DATE_FORMAT_INTERNAL_MOMENT } from '@ce/utils/momentUtils'
import RuleStatusToggleSwitch from '@ce/components/RuleDetails/RuleStatusToggleSwitch'
import RulesDetailsBody from '@ce/components/RuleDetails/RuleDetailsBody'

const CORuleDetailsPage: React.FC = () => {
  const { accountId, ruleId } = useParams<AccountPathProps & { ruleId: string }>()
  const { getString } = useStrings()
  const history = useHistory()

  const [user, setUser] = useState<UserAggregate>()

  const { data, loading } = useRouteDetails({ account_id: accountId, rule_id: Number(ruleId) })

  const [service, setService] = useState<Service>()

  const { data: connectorData, refetch: refetchConnector } = useGetConnector({
    identifier: service?.cloud_account_id as string,
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const { mutate: fetchAllUsers } = useGetAggregatedUsers({
    queryParams: {
      pageIndex: 0,
      accountIdentifier: accountId
    }
  })

  useDocumentTitle(defaultTo(service?.name, 'Rule details'), true)

  useEffect(() => {
    const serviceResponse = get(data, 'response.service', {})
    if (!isEmpty(serviceResponse)) {
      setService(serviceResponse)
    }
  }, [data?.response?.service])

  useEffect(() => {
    if (!isEmpty(service)) {
      refetchConnector()
      getUserInfo()
    }
  }, [service])

  const getUserInfo = async () => {
    const response = await fetchAllUsers({})
    const content = defaultTo(get(response, 'data.content', []), []).find(
      (item: UserAggregate) => item.user.uuid === service?.created_by
    )
    if (content) {
      setUser(content)
    }
  }

  const breadcrumbs = useMemo(
    () => [
      {
        url: routes.toCECORules({ accountId, params: '' }),
        label: getString('ce.co.breadCrumb.rules')
      }
    ],
    [accountId]
  )

  const isK8sRule = service?.kind === 'k8s'
  const cloudProviderType =
    connectorData?.data?.connector?.type && ceConnectorTypes[connectorData?.data?.connector?.type]
  const provider = useMemo(() => allProviders.find(item => item.value === cloudProviderType), [cloudProviderType])
  const iconName = isK8sRule ? 'app-kubernetes' : defaultTo(provider?.icon, 'spinner')
  // const ruleTypeStringKey = getRuleType(tableProps.row.original, provider) as keyof StringsMap

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Container>
      <PageHeader
        size="xlarge"
        breadcrumbs={<NGBreadcrumbs links={breadcrumbs} />}
        title={
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name={iconName as IconName} size={30} />
            <Container>
              <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Text font={{ variation: FontVariation.H4 }}>{defaultTo(service?.name, '')}</Text>
                {service && (
                  <Container>
                    <RuleStatusToggleSwitch serviceData={service} onSuccess={setService} />
                  </Container>
                )}
              </Layout.Horizontal>
              <Layout.Horizontal spacing={'small'} margin={{ top: 'small' }}>
                <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY, size: 'small' }}>
                  {'AWS EC2'}
                </Text>
                {user && (
                  <>
                    <Text>{' | '}</Text>
                    <Text font={{ variation: FontVariation.BODY, size: 'small' }}>{getString('createdBy')}</Text>
                    <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY, size: 'small' }}>
                      {user.user.name}
                    </Text>
                  </>
                )}
                {service?.created_at && (
                  <>
                    <Text>{' | '}</Text>
                    <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY, size: 'small' }}>
                      {getRelativeTime(service.created_at, CE_DATE_FORMAT_INTERNAL_MOMENT)}
                    </Text>
                  </>
                )}
              </Layout.Horizontal>
            </Container>
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal>
            <Button
              variation={ButtonVariation.SECONDARY}
              icon="Edit"
              onClick={() => {
                history.push(
                  routes.toCECOEditGateway({
                    accountId: service?.account_identifier as string,
                    gatewayIdentifier: service?.id?.toString() as string
                  })
                )
              }}
            >
              {getString('edit')}
            </Button>
          </Layout.Horizontal>
        }
      />
      <RulesDetailsBody />
    </Container>
  )
}

export default CORuleDetailsPage
