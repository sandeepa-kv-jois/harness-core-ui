/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef, useContext } from 'react'
import { Layout, FormInput, SelectOption, Formik, FormikForm } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { debounce, noop, get } from 'lodash-es'
import { useToaster } from '@common/exports'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import {
  getAzureResourceGroupsBySubscriptionPromise,
  getAzureSubscriptionsPromise,
  SshWinRmAzureInfrastructure,
  getSubscriptionTagsPromise,
  AzureResourceGroupDTO
} from 'services/cd-ng'
import type { AzureSubscriptionDTO, AzureTagDTO } from 'services/cd-ng'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { Connectors } from '@connectors/constants'
import { Scope } from '@common/interfaces/SecretsInterface'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import { setSecretField } from '@secrets/utils/SecretField'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import {
  AzureInfrastructureSpecEditableProps,
  getValue,
  getValidationSchema,
  subscriptionLabel,
  resourceGroupLabel
} from './SshWinRmAzureInfrastructureInterface'
import css from './SshWinRmAzureInfrastructureSpec.module.scss'

interface AzureInfrastructureUI extends Omit<SshWinRmAzureInfrastructure, 'subscriptionId' | 'resourceGroup'> {
  subscriptionId?: any
  resourceGroup?: any
}

export const AzureInfrastructureSpecForm: React.FC<AzureInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { showError } = useToaster()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [subscriptions, setSubscriptions] = useState<SelectOption[]>([])
  const [isSubsLoading, setIsSubsLoading] = useState(false)

  const [resourceGroups, setResourceGroups] = useState<SelectOption[]>([])
  const [isResGroupLoading, setIsResGroupLoading] = useState(false)

  const [azureTags, setAzureTags] = useState([])
  const [isTagsLoading, setIsTagsLoading] = useState(false)

  const delayedOnUpdate = useRef(debounce(onUpdate || noop, 300)).current
  const { getString } = useStrings()

  const formikRef = useRef<FormikProps<AzureInfrastructureUI> | null>(null)

  const fetchSubscriptions = async (connectorRef: string) => {
    setIsSubsLoading(true)
    try {
      const response = await getAzureSubscriptionsPromise({
        queryParams: {
          connectorRef: connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      })
      if (response.status === 'SUCCESS') {
        const subs = get(response, 'data.subscriptions', []).map((sub: AzureSubscriptionDTO) => ({
          label: sub.subscriptionName,
          value: sub.subscriptionId
        }))
        setSubscriptions(subs)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.responseMessage[0])
    } finally {
      setIsSubsLoading(false)
    }
  }

  const fetchSubscriptionTags = async (connectorRef: string, subscriptionId: string) => {
    setIsTagsLoading(true)
    try {
      const response = await getSubscriptionTagsPromise({
        subscriptionId,
        queryParams: {
          connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      })
      if (response.status === 'SUCCESS') {
        setAzureTags(
          get(response, 'data.tags', []).map((azureTag: AzureTagDTO) => ({ label: azureTag.tag, value: azureTag.tag }))
        )
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.errorMessage)
    } finally {
      setIsTagsLoading(false)
    }
  }

  const fetchResourceGroups = async (connectorRef: string, subscriptionId: string) => {
    try {
      const response = await getAzureResourceGroupsBySubscriptionPromise({
        queryParams: {
          connectorRef: connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        subscriptionId: subscriptionId
      })
      if (response.status === 'SUCCESS') {
        setResourceGroups(
          get(response, 'data.resourceGroups', []).map((rg: AzureResourceGroupDTO) => ({
            label: rg.resourceGroup,
            value: rg.resourceGroup
          }))
        )
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.errorMessage)
    } finally {
      setIsResGroupLoading(false)
    }
  }

  useEffect(() => {
    debugger
    if (initialValues.connectorRef) {
      const { connectorRef } = initialValues
      fetchSubscriptions(connectorRef)
      if (initialValues.subscriptionId) {
        const { subscriptionId } = initialValues
        fetchResourceGroups(connectorRef, subscriptionId)
        fetchSubscriptionTags(connectorRef, subscriptionId)
      }
    }
    if (initialValues.credentialsRef) {
      ;(async () => {
        try {
          const secretData = await setSecretField(initialValues.credentialsRef, {
            accountIdentifier: accountId,
            projectIdentifier,
            orgIdentifier
          })
          /* istanbul ignore next */
          formikRef.current?.setFieldValue('sshKey', secretData)
        } catch (e) {
          /* istanbul ignore next */
          showError(e.data?.message || e.message)
        }
      })()
    }
  }, [])

  const getInitialValues = (): AzureInfrastructureUI => {
    debugger
    const currentValues: AzureInfrastructureUI = {
      ...initialValues,
      tags: Object.values(initialValues.tags || {})
    }
    currentValues.subscriptionId = initialValues.subscriptionId
      ? { label: initialValues.subscriptionId, value: initialValues.subscriptionId }
      : ''
    currentValues.resourceGroup = initialValues.resourceGroup
      ? { label: initialValues.resourceGroup, value: initialValues.resourceGroup }
      : ''
    return currentValues
  }

  const { subscribeForm, unSubscribeForm } = useContext(StageErrorContext)

  useEffect(() => {
    subscribeForm({
      tab: DeployTabs.INFRASTRUCTURE,
      form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
    })
    return () =>
      unSubscribeForm({
        tab: DeployTabs.INFRASTRUCTURE,
        form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearTags = () => {
    /* istanbul ignore next */
    formikRef.current?.setFieldValue('tags', [])
    setAzureTags([])
  }

  const clearResourceGroup = () => {
    /* istanbul ignore next */
    formikRef.current?.setFieldValue('resourceGroup', '')
    setResourceGroups([])
    clearTags()
  }

  const clearSubscriptionId = () => {
    /* istanbul ignore next */
    formikRef.current?.setFieldValue('subscriptionId', '')
    /* istanbul ignore next */
    setSubscriptions([])
    /* istanbul ignore next */
    clearResourceGroup()
  }

  return (
    <Layout.Vertical spacing="medium">
      <Formik<AzureInfrastructureUI>
        formName="sshWinRmAzureInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<SshWinRmAzureInfrastructure> = {
            connectorRef: getValue(value.connectorRef) || value.connectorRef,
            subscriptionId:
              getValue(value.subscriptionId) === ''
                ? /* istanbul ignore next */ undefined
                : getValue(value.subscriptionId),
            resourceGroup:
              getValue(value.resourceGroup) === ''
                ? /* istanbul ignore next */ undefined
                : getValue(value.resourceGroup),
            tags: /* istanbul ignore next */ value.tags.reduce(
              (obj: object, tag: AzureTagDTO) => ({
                ...obj,
                [tag.tag]: tag.tag
              }),
              {}
            ),
            usePublicDns: value.usePublicDns
          }
          if (value.sshKey) {
            const prefix = value.sshKey.projectIdentifier ? '' : value.sshKey.projectIdentifier ? 'org.' : 'account.'
            data.credentialsRef = `${prefix}${value.sshKey.identifier}`
          }
          delayedOnUpdate(data)
        }}
        validationSchema={getValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik
          return (
            <FormikForm>
              <Layout.Vertical spacing="medium">
                <Layout.Vertical className={css.inputWidth}>
                  <SSHSecretInput name={'sshKey'} label={getString('cd.steps.common.specifyCredentials')} />
                </Layout.Vertical>
                <ConnectorReferenceField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('connectors.selectConnector')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  className={css.inputWidth}
                  type={Connectors.AZURE}
                  selected={formik.values.connectorRef}
                  onChange={(value, scope) => {
                    /* istanbul ignore next */
                    if (get(value, 'identifier', '')) {
                      const connectorValue = `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`
                      formik.setFieldValue('connectorRef', {
                        label: value.name || '',
                        value: connectorValue,
                        scope: scope,
                        live: get(value, 'status.status', '') === 'SUCCESS',
                        connector: value
                      })
                      clearSubscriptionId()
                      fetchSubscriptions(connectorValue)
                    }
                  }}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                <FormInput.Select
                  name="subscriptionId"
                  className={`subscriptionId-select ${css.inputWidth}`}
                  items={subscriptions}
                  placeholder={
                    isSubsLoading ? getString('loading') : getString('cd.steps.azureInfraStep.subscriptionPlaceholder')
                  }
                  label={getString(subscriptionLabel)}
                  onChange={
                    /* istanbul ignore next */ value => {
                      if (value) {
                        clearResourceGroup()
                        const connectorRefIdentifier = getValue(get(formik, 'values.connectorRef', ''))
                        const subsId = getValue(value)
                        fetchResourceGroups(connectorRefIdentifier, subsId)
                        fetchSubscriptionTags(connectorRefIdentifier, subsId)
                      }
                    }
                  }
                />
                <FormInput.Select
                  name="resourceGroup"
                  className={`resourceGroup-select ${css.inputWidth}`}
                  items={resourceGroups}
                  placeholder={
                    isResGroupLoading
                      ? getString('loading')
                      : getString('cd.steps.azureInfraStep.resourceGroupPlaceholder')
                  }
                  onChange={value => {
                    formik.setFieldValue('resourceGroup', value)
                  }}
                  label={getString(resourceGroupLabel)}
                />
                <FormInput.MultiSelect
                  name="tags"
                  label={getString('tagLabel')}
                  items={azureTags}
                  placeholder={isTagsLoading ? getString('loading') : undefined}
                  className={`${css.inputWidth} ${css.tagsSelect}`}
                />
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'sshWinrmAzureUsePublicDns'
                  }}
                  name={'usePublicDns'}
                  label={getString('cd.infrastructure.sshWinRmAzure.usePublicDns')}
                  disabled={readonly}
                />
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
