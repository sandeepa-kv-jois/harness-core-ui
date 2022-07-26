/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  IconName,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { parse } from 'yaml'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get } from 'lodash-es'
import type { FormikErrors, FormikProps } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings, UseStringsReturn } from 'framework/strings'
import {
  getConnectorListV2Promise,
  listSecretsV2Promise,
  ConnectorResponse,
  SecretResponseWrapper,
  SshWinRmAwsInfrastructure,
  regionsForAwsPromise,
  loadBalancersPromise,
  tagsPromise,
  autoScalingGroupsPromise,
  vpcsPromise,
  AwsVPC
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import { InfraDeploymentType } from '../PipelineStepsUtil'
import css from './SshWinRmAwsInfrastructureSpec.module.scss'

const logger = loggerFor(ModuleName.CD)

type SshWinRmAwsInfrastructureTemplate = { [key in keyof SshWinRmAwsInfrastructure]: string }

function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    sshKey: Yup.object().required(getString('validation.password'))
  })
}
interface SshWinRmAwsInfrastructureSpecEditableProps {
  initialValues: SshWinRmAwsInfrastructure
  allValues?: SshWinRmAwsInfrastructure
  onUpdate?: (data: SshWinRmAwsInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: SshWinRmAwsInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SshWinRmAwsInfrastructure
  allowableTypes: MultiTypeInputType[]
}

interface SshWinRmAwsInfrastructureUI extends SshWinRmAwsInfrastructure {
  sshKey: SecretReferenceInterface
}

const AutoScalingGroup = {
  TRUE: 'true',
  FALSE: 'false'
}

const SshWinRmAwsInfrastructureSpecEditable: React.FC<SshWinRmAwsInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  /* istanbul ignore next */
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const formikRef = React.useRef<FormikProps<SshWinRmAwsInfrastructureUI> | null>(null)

  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { showError } = useToaster()

  const [regions, setRegions] = useState<SelectOption[]>([])
  const [isRegionsLoading, setIsRegionsLoading] = useState(false)

  const [loadBalancers, setLoadBalancers] = useState<SelectOption[]>([])
  const [isLoadBalancersLoading, setIsLoadBalancersLoading] = useState(false)
  const [loadbalancerRefType, setLoadbalancerRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(formikRef.current?.values?.loadBalancer)
  )

  const [autoScalingGroups, setAutoScalingGroups] = useState<SelectOption[]>([])
  const [isAutoScalingGroupLoading, setIsAutoScalingGroupLoading] = useState(false)

  const [vpcs, setVpcs] = useState<SelectOption[]>([])
  const [isVpcsLoading, setIsVpcsLoading] = useState(false)

  const [tags, setTags] = useState<SelectOption[]>([])
  const [isTagsLoading, setIsTagsLoading] = useState(false)

  const [isAutoScalingGroupSelected, setIsAutoScalingGroupSelected] = useState(
    get(initialValues, 'useAutoScalingGroup', true)
  )

  useEffect(() => {
    const { connectorRef, region, loadBalancer, autoScalingGroupName, awsInstanceFilter, useAutoScalingGroup } =
      initialValues
    if (connectorRef) {
      fetchRegions()
      if (region) {
        fetchLoadBalancers(region)
        fetchAutoScalingGroups(region)
        fetchVpcs(region)
        fetchTags(region)
        /* istanbul ignore next */
        formikRef.current?.setFieldValue('region', region)
      }
      /* istanbul ignore next */
      if (loadBalancer) {
        /* istanbul ignore next */
        formikRef.current?.setFieldValue('loadBalancer', loadBalancer)
      }
      /* istanbul ignore next */
      if (useAutoScalingGroup) {
        /* istanbul ignore next */
        formikRef.current?.setFieldValue('autoScalingGroupName', autoScalingGroupName)
      } else if (awsInstanceFilter) {
        /* istanbul ignore next */
        formikRef.current?.setFieldValue('vpcs', awsInstanceFilter.vpcs)
        /* istanbul ignore next */
        formikRef.current?.setFieldValue('tags', awsInstanceFilter.tags)
      }
    }
  }, [])

  const fetchRegions = async () => {
    setIsRegionsLoading(true)
    try {
      const response = await regionsForAwsPromise({})
      if (response.status === 'SUCCESS') {
        const regionOptions = Object.entries(get(response, 'data', {})).map(regEntry => ({
          value: regEntry[0],
          label: regEntry[1]
        }))
        setRegions(regionOptions)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(get(e, 'message', '') || get(e, 'responseMessage[0]', ''))
    } finally {
      setIsRegionsLoading(false)
    }
  }

  const fetchLoadBalancers = async (region: string) => {
    setIsLoadBalancersLoading(true)
    try {
      const response = await loadBalancersPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          region,
          awsConnectorRef: get(formikRef, 'current.values.connectorRef.value', '')
        }
      })
      if (response.status === 'SUCCESS') {
        const loadBalancerOptions = Object.values(get(response, 'data', {})).map(value => ({
          value,
          label: value
        }))
        setLoadBalancers(loadBalancerOptions)
        /* istanbul ignore next */
        formikRef.current?.setFieldValue('loadBalancer', undefined)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(get(e, 'message', '') || get(e, 'responseMessage[0]', ''))
    } finally {
      setIsLoadBalancersLoading(false)
    }
  }

  const fetchTags = async (region: string) => {
    setIsTagsLoading(true)
    try {
      const response = await tagsPromise({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          awsConnectorRef: get(formikRef, 'current.values.connectorRef.value', ''),
          region
        }
      })
      if (response.status === 'SUCCESS') {
        const tagOptions = Object.entries(get(response, 'data', {})).map(tagEntry => ({
          value: tagEntry[0],
          label: tagEntry[1]
        }))
        setTags(tagOptions)
        /* istanbul ignore next */
        formikRef.current?.setFieldValue('tags', undefined)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(get(e, 'message', '') || get(e, 'responseMessage[0]', ''))
    } finally {
      setIsTagsLoading(false)
    }
  }

  const fetchAutoScalingGroups = async (region: string) => {
    setIsAutoScalingGroupLoading(true)
    try {
      const response = await autoScalingGroupsPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          region,
          awsConnectorRef: get(formikRef, 'current.values.connectorRef.value', '')
        }
      })
      if (response.status === 'SUCCESS') {
        const autoScalingGroupEntryOptions = Object.entries(get(response, 'data', {})).map(autoScalingGroupEntry => ({
          value: autoScalingGroupEntry[0],
          label: autoScalingGroupEntry[1]
        }))
        setAutoScalingGroups(autoScalingGroupEntryOptions)
        /* istanbul ignore next */
        formikRef.current?.setFieldValue('autoScalingGroupName', undefined)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(get(e, 'message', '') || get(e, 'responseMessage[0]', ''))
    } finally {
      setIsAutoScalingGroupLoading(false)
    }
  }

  const fetchVpcs = async (region: string) => {
    setIsVpcsLoading(true)
    try {
      const response = await vpcsPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          region,
          awsConnectorRef: get(formikRef, 'current.values.connectorRef.value', '')
        }
      })
      if (response.status === 'SUCCESS') {
        const vpcsOptions = get(response, 'data', []).map((vpcEntry: AwsVPC) => ({
          value: get(vpcEntry, 'id', ''),
          label: get(vpcEntry, 'name', '')
        }))
        setVpcs(vpcsOptions)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(get(e, 'message', '') || get(e, 'responseMessage[0]', ''))
    } finally {
      setIsVpcsLoading(false)
    }
  }

  return (
    <Layout.Vertical spacing="medium">
      <>
        <Formik<SshWinRmAwsInfrastructureUI>
          formName="sshWinRmAWSInfra"
          initialValues={{ ...initialValues } as SshWinRmAwsInfrastructureUI}
          validationSchema={getValidationSchema(getString) as Partial<SshWinRmAwsInfrastructureUI>}
          validate={value => {
            /* istanbul ignore next */
            const credentialsRef = `${
              get(value, 'sshKey.projectIdentifier', '')
                ? ''
                : get(value, 'sshKey.orgIdentifier', '')
                ? 'org.'
                : 'account.'
            }${value.identifier}`
            const data: Partial<SshWinRmAwsInfrastructure> = {
              connectorRef: get(value, 'connectorRef.value', ''),
              credentialsRef,
              hostNameConvention: value.hostNameConvention,
              steps: [],
              loadBalancer: value.loadBalancer,
              region: value.region
            }
            if (isAutoScalingGroupSelected) {
              data.autoScalingGroupName = value.autoScalingGroupName
              data.useAutoScalingGroup = true
            } else {
              data.vpcs = value.vpcs
              data.tags = value.tags
              data.useAutoScalingGroup = false
            }
            delayedOnUpdate(data)
          }}
          onSubmit={noop}
        >
          {formik => {
            window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
            formikRef.current = formik
            return (
              <FormikForm>
                <Layout.Vertical className={css.formRow} spacing="medium" margin={{ bottom: 'large' }}>
                  <div className={css.inputWidth}>
                    <SSHSecretInput name={'sshKey'} label={getString('cd.steps.common.specifyCredentials')} />
                  </div>
                  <Layout.Vertical>
                    <FormMultiTypeConnectorField
                      error={get(formik, 'errors.connectorRef', undefined)}
                      name="connectorRef"
                      type={['Aws']}
                      label={getString('connector')}
                      width={490}
                      placeholder={getString('connectors.selectConnector')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      multiTypeProps={{ allowableTypes, expressions }}
                      onChange={
                        /* istanbul ignore next */ (selected, _typeValue, type) => {
                          const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                          if (type === MultiTypeInputType.FIXED) {
                            const connectorRef =
                              item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                                ? `${item.scope}.${item?.record?.identifier}`
                                : item.record?.identifier
                            /* istanbul ignore next */
                            const connectorValue = `${
                              item.scope !== Scope.PROJECT ? `${item.scope}.` : ''
                            }${connectorRef}`
                            formik.setFieldValue('connectorRef', {
                              label: item?.record?.name || '',
                              value: connectorValue,
                              scope: item.scope,
                              live: get(item.record, 'status.status', '') === 'SUCCESS',
                              connector: item.record
                            })
                            /* istanbul ignore next */
                            formikRef.current?.setFieldValue('region', undefined)
                            fetchRegions()
                          }
                        }
                      }
                    />
                  </Layout.Vertical>
                </Layout.Vertical>
                <FormInput.MultiTypeInput
                  name="region"
                  className={`regionId-select ${css.inputWidth}`}
                  selectItems={regions}
                  placeholder={isRegionsLoading ? getString('loading') : getString('pipeline.regionPlaceholder')}
                  label={getString('regionLabel')}
                  multiTypeInputProps={{
                    onTypeChange: setLoadbalancerRefType,
                    allowableTypes,
                    expressions,
                    onChange: /* istanbul ignore next */ option => {
                      const { value } = option as SelectOption
                      if (value) {
                        formik.setFieldValue('region', value)
                        formik.setFieldValue('loadBalancer', '')
                        formik.setFieldValue('autoScalingGroupName', '')
                        formik.setFieldValue('vpcs', [])
                        formik.setFieldValue('tags', {})
                        fetchLoadBalancers(value as string)
                        fetchVpcs(value as string)
                        fetchAutoScalingGroups(value as string)
                        fetchTags(value as string)
                      }
                    }
                  }}
                />
                <FormInput.MultiTypeInput
                  name="loadBalancer"
                  className={`loadBalancer-select ${css.inputWidth}`}
                  selectItems={loadBalancers}
                  placeholder={
                    isLoadBalancersLoading
                      ? getString('loading')
                      : getString('cd.steps.awsInfraStep.placeholders.loadBalancer')
                  }
                  label={getString('cd.steps.awsInfraStep.labels.loadBalancer')}
                  multiTypeInputProps={{
                    onTypeChange: setLoadbalancerRefType,
                    allowableTypes,
                    expressions,
                    onChange: option => {
                      const { value } = option as SelectOption
                      if (value) {
                        formik.setFieldValue('loadBalancer', value?.value || value)
                      }
                    }
                  }}
                />
                <FormInput.MultiTextInput
                  name="hostNameConvention"
                  className={`hostNameConvention-text ${css.inputWidth}`}
                  placeholder={getString('cd.steps.awsInfraStep.placeholders.hostName')}
                  label={getString('cd.steps.awsInfraStep.labels.hostName')}
                  multiTextInputProps={{
                    allowableTypes,
                    expressions
                  }}
                  onChange={
                    /* istanbul ignore next */ e => {
                      if (get(e, 'target.value', false)) {
                        formik.setFieldValue('hostNameConvention', get(e, 'target.value', ''))
                      }
                    }
                  }
                />
                <Layout.Horizontal>
                  <RadioGroup
                    selectedValue={isAutoScalingGroupSelected ? AutoScalingGroup.TRUE : AutoScalingGroup.FALSE}
                    className={css.radioGroup}
                    onChange={
                      /* istanbul ignore next */ (e: any) => {
                        setIsAutoScalingGroupSelected(e.target.value === AutoScalingGroup.TRUE)
                      }
                    }
                  >
                    <Radio
                      value={AutoScalingGroup.TRUE}
                      label={getString('cd.steps.awsInfraStep.labels.useAutoScallingGroup')}
                    />
                    <Radio
                      value={AutoScalingGroup.FALSE}
                      label={getString('cd.steps.awsInfraStep.labels.useAwsInstanceFilter')}
                    />
                  </RadioGroup>
                </Layout.Horizontal>
                {isAutoScalingGroupSelected ? (
                  <Layout.Horizontal>
                    <FormInput.MultiTypeInput
                      name="autoScalingGroupName"
                      className={`autoscalinggroup-select ${css.inputWidth}`}
                      selectItems={autoScalingGroups}
                      placeholder={
                        isAutoScalingGroupLoading
                          ? getString('loading')
                          : getString('cd.steps.awsInfraStep.placeholders.autoScallingGroup')
                      }
                      label={getString('cd.steps.awsInfraStep.labels.autoScallingGroup')}
                      multiTypeInputProps={{
                        onTypeChange: setLoadbalancerRefType,
                        allowableTypes,
                        expressions,
                        onChange: /* istanbul ignore next */ option => {
                          const { value } = option as SelectOption
                          if (value) {
                            formik.setFieldValue('autoScalingGroupName', value)
                          }
                        }
                      }}
                    />
                  </Layout.Horizontal>
                ) : (
                  <>
                    <Layout.Horizontal>
                      <FormInput.MultiTypeInput
                        name="vpcs"
                        className={`vpcs-select ${css.inputWidth}`}
                        selectItems={vpcs}
                        placeholder={
                          isVpcsLoading ? getString('loading') : getString('cd.steps.awsInfraStep.placeholders.vpcs')
                        }
                        label={getString('cd.steps.awsInfraStep.labels.vpcs')}
                        multiTypeInputProps={{
                          onTypeChange: setLoadbalancerRefType,
                          allowableTypes,
                          expressions,
                          onChange: /* istanbul ignore next */ option => {
                            const { value } = option as SelectOption
                            if (value) {
                              formik.setFieldValue('vpcs', value)
                            }
                          }
                        }}
                      />
                    </Layout.Horizontal>
                    <Layout.Horizontal>
                      <FormInput.MultiTypeInput
                        name="tags"
                        label={getString('tagLabel')}
                        selectItems={tags}
                        className={css.inputWidth}
                        multiTypeInputProps={{
                          onTypeChange: setLoadbalancerRefType,
                          allowableTypes,
                          expressions,
                          onChange: /* istanbul ignore next */ option => {
                            const { value } = option as SelectOption
                            if (value) {
                              formik.setFieldValue('tags', value)
                            }
                          }
                        }}
                      />
                    </Layout.Horizontal>
                  </>
                )}
              </FormikForm>
            )
          }}
        </Formik>
      </>
    </Layout.Vertical>
  )
}

const SshWinRmAwsInfraSpecVariablesForm: React.FC<SshWinRmAwsInfrastructure> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
    />
  ) : null
}

interface SshWinRmAwsInfrastructureStep extends SshWinRmAwsInfrastructure {
  name?: string
  identifier?: string
}

export const ConnectorRefRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
export const SshKeyRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.sshKeyRef$/
export class SshWinRmAwsInfrastructureSpec extends PipelineStep<SshWinRmAwsInfrastructureStep> {
  /* istanbul ignore next */
  protected type = StepType.SshWinRmAws
  /* istanbul ignore next */
  protected defaultValues: SshWinRmAwsInfrastructure = {
    autoScalingGroupName: '',
    awsInstanceFilter: { tags: {}, vpcs: [] },
    connectorRef: '',
    credentialsRef: '',
    delegateSelectors: [],
    hostNameConvention: '',
    loadBalancer: '',
    region: '',
    useAutoScalingGroup: true
  }

  /* istanbul ignore next */
  protected stepIcon: IconName = 'service-aws'
  /* istanbul ignore next */
  protected stepName = 'Specify your AWS Infrastructure'
  /* istanbul ignore next */
  protected stepPaletteVisible = false
  /* istanbul ignore next */
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(ConnectorRefRegex, this.getConnectorsListForYaml.bind(this))
    this.invocationMap.set(SshKeyRegex, this.getSshKeyListForYaml.bind(this))

    this._hasStepVariables = true
  }

  protected getConnectorsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err as any)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const connectorRef = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (connectorRef) {
        /* istanbul ignore next */
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Pdc'], filterType: 'Connector' }
        }).then(response =>
          get(response, 'data.content', []).map((connector: ConnectorResponse) => ({
            label: getConnectorName(connector),
            insertText: getConnectorValue(connector),
            kind: CompletionItemKind.Field
          }))
        )
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  protected getSshKeyListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err as any)
    }
    const { accountId } = params as {
      accountId: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.sshKey', ''))
      if (obj.type === InfraDeploymentType.SshWinRmAws) {
        /* istanbul ignore next */
        return listSecretsV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            includeSecretsFromEverySubScope: true,
            types: ['SSHKey'],
            pageIndex: 0,
            pageSize: 100
          }
        }).then(response =>
          get(response, 'data.content', []).map((secret: SecretResponseWrapper) => ({
            label: secret.secret.name,
            insertText: secret.secret.identifier,
            kind: CompletionItemKind.Field
          }))
        )
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  validateInputSet({
    data,
    getString,
    viewType
  }: ValidateInputSetProps<SshWinRmAwsInfrastructure>): FormikErrors<SshWinRmAwsInfrastructure> {
    const errors: Partial<SshWinRmAwsInfrastructureTemplate> = {}
    /* istanbul ignore else */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (isEmpty(data.credentialsRef) && isRequired) {
      /* istanbul ignore next */
      errors.credentialsRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    return errors
  }

  renderStep(props: StepProps<SshWinRmAwsInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, customStepProps, readonly, allowableTypes, inputSetData } = props
    if (stepViewType === StepViewType.InputVariable) {
      return (
        <SshWinRmAwsInfraSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as SshWinRmAwsInfrastructure)}
          initialValues={initialValues}
        />
      )
    }
    return (
      <SshWinRmAwsInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        path={inputSetData?.path || ''}
        {...(customStepProps as SshWinRmAwsInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
