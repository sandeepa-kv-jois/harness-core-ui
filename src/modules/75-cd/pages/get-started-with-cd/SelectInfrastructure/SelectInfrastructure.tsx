/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Text,
  FontVariation,
  Layout,
  CardSelect,
  Icon,
  Container,
  Formik,
  FormikForm as Form,
  Accordion,
  FormInput,
  useToaster,
  PageSpinner,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import type { FormikContextType, FormikProps } from 'formik'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'

import {
  InfrastructureRequestDTO,
  InfrastructureRequestDTORequestBody,
  ServiceRequestDTO,
  useCreateEnvironmentV2,
  useCreateInfrastructure
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { InfrastructureTypes, InfrastructureType } from '../DeployProvisioningWizard/Constants'
import {
  SelectAuthenticationMethod,
  SelectAuthenticationMethodInterface,
  SelectAuthenticationMethodRef
} from './SelectAuthenticationMethod'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import {
  cleanEnvironmentDataUtil,
  getUniqueEntityIdentifier,
  newEnvironmentState,
  PipelineRefPayload
} from '../cdOnboardingUtils'
import defaultCss from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'
import css from './SelectInfrastructure.module.scss'
export interface SelectInfrastructureRef {
  values: SelectInfrastructureInterface
  validate?: () => boolean
  showValidationErrors?: () => void
  submitForm?: FormikProps<SelectInfrastructureInterface>['submitForm']
}
export interface SelectInfrastructureInterface extends SelectAuthenticationMethodInterface {
  infraType: string
  envId: string
  infraId: string
  namespace: string
}

interface SelectInfrastructureProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
  onSuccess?: (data: PipelineRefPayload) => void
}

export type SelectInfrastructureForwardRef =
  | ((instance: SelectInfrastructureRef | null) => void)
  | React.MutableRefObject<SelectInfrastructureRef | null>
  | null

const SelectInfrastructureRef = (
  props: SelectInfrastructureProps,
  forwardRef: SelectInfrastructureForwardRef
): React.ReactElement => {
  const { getString } = useStrings()
  const {
    saveEnvironmentData,
    saveInfrastructureData,
    state: { environment: environmentData, infrastructure: infrastructureData, service: serviceData }
  } = useCDOnboardingContext()
  const [disableBtn, setDisableBtn] = useState<boolean>(false)
  const [infrastructureType, setInfrastructureType] = useState<InfrastructureType | undefined>(
    InfrastructureTypes.find((item: InfrastructureType) => item.value === infrastructureData?.type)
  )
  const formikRef = useRef<FormikContextType<SelectInfrastructureInterface>>()
  const selectAuthenticationMethodRef = React.useRef<SelectAuthenticationMethodRef | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()

  const defaultInitialFormData: SelectAuthenticationMethodInterface = {
    authType: AuthTypes.USER_PASSWORD,
    delegateType: defaultTo(get(infrastructureData, 'data.delegateType'), ''),
    masterUrl: defaultTo(get(infrastructureData, 'data.masterUrl'), ''),
    username: get(infrastructureData, 'data.username') || '',
    password: get(infrastructureData, 'data.password') || undefined,
    serviceAccountToken: get(infrastructureData, 'data.serviceAccountToken') || undefined,
    oidcIssuerUrl: get(infrastructureData, 'data.oidcIssueUrl') || '',
    oidcUsername: get(infrastructureData, 'data.oidcIssueUsername') || undefined,
    oidcPassword: get(infrastructureData, 'data.oidcPassword') || undefined,
    oidcCleintId: get(infrastructureData, 'data.oidcCleintId') || undefined,
    oidcCleintSecret: get(infrastructureData, 'data.oidcCleintSecret') || undefined,
    oidcScopes: get(infrastructureData, 'data.oidcScopes') || '',
    clientKey: get(infrastructureData, 'data.clientKey') || undefined,
    clientKeyCertificate: get(infrastructureData, 'data.clientKeyCertificate') || undefined,
    clientKeyPassphrase: undefined,
    clientKeyAlgo: get(infrastructureData, 'data.clientKeyAlgo') || '',
    clientKeyCACertificate: undefined,
    connectorName: get(infrastructureData, 'infrastructure.infrastructureDefinition.spec.connectorRef') || '',
    connectorIdentifier:
      get(infrastructureData, 'infrastructure.infrastructureDefinition.spec.connectorIdentifier') || '',
    delegateSelectors: []
  }
  const { loading: createEnvLoading, mutate: createEnvironment } = useCreateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const openSetUpDelegateAccordion = (): boolean | undefined => {
    const validate = selectAuthenticationMethodRef.current?.validate()
    if (validate && isEmpty(formikRef?.current?.errors) ) {
      props.enableNextBtn()
      return true
    } else {
    props.disableNextBtn()
      return false
    }
  }


  const setForwardRef = ({ values}: Omit<SelectInfrastructureRef, 'validate'>): void => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }

    if (values) {
      forwardRef.current = {
        values,
        // validate: validateInfraSetup
        submitForm: formikRef?.current?.submitForm
      }
    }
  }

  const { mutate: createInfrastructure } = useCreateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    if (formikRef.current?.values) {
      setForwardRef({
        values: formikRef.current.values
      })
    }
  }, [formikRef?.current, formikRef?.current?.values])

  const { showSuccess, showError, clear } = useToaster()
  const handleSubmit = async (values: SelectInfrastructureInterface): Promise<SelectInfrastructureInterface> => {
    const {
      envId,
      infraId,
      infraType,
      namespace,
      masterUrl,
      connectorName,
      delegateType,
      username,
      password,
      serviceAccountToken,
      oidcCleintId,
      oidcIssuerUrl,
      oidcPassword,
      oidcUsername,
      oidcCleintSecret,
      clientKey,
      clientKeyCertificate,
      clientKeyAlgo,
      connectorIdentifier,
      authType
    } = values || {}
    if (!infraType) {
      showError(getString('common.validation.fieldIsRequired', { name: 'Infrastructure Type' }))
    } else if (!envId) {
      showError(getString('fieldRequired', { field: 'Environment' }))
    } else if (!infraId) {
      showError(getString('common.validation.fieldIsRequired', { name: 'Infrastructure' }))
    } else if (!namespace) {
      showError(getString('common.validation.fieldIsRequired', { name: 'Namespace' }))
    }
    const environmentIdentifier = getUniqueEntityIdentifier(envId as string)
    const updatedContextEnvironment = produce(newEnvironmentState.environment, draft => {
      set(draft, 'name', envId)
      set(
        draft,
        'identifier',
        // isEnvironmentNameUpdated ?
        environmentIdentifier
        // : get(environmentData, 'identifier')
      )
    })
    try {
      const cleanEnvironmentData = cleanEnvironmentDataUtil(updatedContextEnvironment as ServiceRequestDTO)
      if(selectAuthenticationMethodRef.current?.validatedConnector){
      const response = await createEnvironment({ ...cleanEnvironmentData, orgIdentifier, projectIdentifier })
      if (response.status === 'SUCCESS') {
        clear()
        showSuccess(getString('cd.environmentCreated'))
        envId &&
          saveEnvironmentData({
            environment: updatedContextEnvironment,
            environmentResponse: response
          })
        const infraIdentifier = getUniqueEntityIdentifier(envId as string)
        const updatedContextInfra = produce(newEnvironmentState.infrastructure, draft => {
          set(draft, 'name', infraId)
          set(draft, 'identifier', getUniqueEntityIdentifier(infraId))
          set(draft, 'type', infraType)
          set(draft, 'environmentRef', envId)
          set(draft, 'infrastructureDefinition.spec.namespace', namespace)
          set(draft, 'infrastructureDefinition.spec.connectorRef', connectorIdentifier)
          set(draft, 'data.connectorName', connectorName)
          set(draft, 'data.connectorIdentifier', connectorIdentifier)
          set(draft, 'data.authType', authType)
          set(draft, 'data.delegateType', delegateType)
          set(draft, 'data.masterUrl', masterUrl)
          set(draft, 'data.username', username)
          set(draft, 'data.password', password)
          set(draft, 'data.serviceAccountToken', serviceAccountToken)
          set(draft, 'data.oidcCleintId', oidcCleintId)
          set(draft, 'data.oidcIssueUrl', oidcIssuerUrl)
          set(draft, 'data.oidcPassword', oidcPassword)
          set(draft, 'data.oidcUsername', oidcUsername)
          set(draft, 'data.oidcCleintSecret', oidcCleintSecret)
          set(draft, 'data.clientKey', clientKey)
          set(draft, 'data.clientKeyAlgo', clientKeyAlgo)
          set(draft, 'data.clientKeyCertificate', clientKeyCertificate)
        })

        saveInfrastructureData({
          infrastructure: { ...updatedContextInfra }
        })
        const body: InfrastructureRequestDTORequestBody = {
          name: infraId,
          identifier: infraIdentifier,
          description: '',
          tags: {},
          orgIdentifier,
          projectIdentifier,
          type: infraType as InfrastructureRequestDTO['type'],
          environmentRef: environmentIdentifier
        }

        createInfrastructure({
          ...body,
          yaml: yamlStringify({
            infrastructureDefinition: {
              ...body,
              spec: get(updatedContextInfra, 'infrastructureDefinition.spec'),
              allowSimultaneousDeployments: false
            }
          })
        })
          .then(infraResponse => {
            const refsData = {
              serviceRef: serviceData.identifier,
              environmentRef: environmentIdentifier,
              infraStructureRef: infraIdentifier,
              deploymentType: serviceData.serviceDefinition.type
            }
            if (infraResponse.status === 'SUCCESS') {
              props?.onSuccess?.(refsData)
              showSuccess(
                getString('cd.infrastructure.created', {
                  identifier: infraResponse.data?.infrastructure?.identifier
                })
              )
              return Promise.resolve(values)
            } else {
              throw infraResponse
            }
          })
          .catch(e => {
            showError(getErrorInfoFromErrorObject(e))
          })

        return Promise.resolve(values)
      } else {
        throw response
      }
    }
    else{
      showError('Test Connector to create pipeline')
    }
   }catch (error: any) {
      showError(getRBACErrorMessage(error))
      return Promise.resolve({} as SelectInfrastructureInterface)
    }
    return Promise.resolve({} as SelectInfrastructureInterface)
  }

  const borderBottom = <div className={defaultCss.repoborderBottom} />

  if (createEnvLoading) {
    return <PageSpinner />
  }

  const validationSchema = Yup.object().shape({
    infraType: Yup.string().required(
      getString('common.getStarted.plsChoose', {
        field: `${getString('infrastructureText')}`
      })
    ),
    envId: Yup.string().required(
      getString('common.validation.fieldIsRequired', { name: getString('cd.getStartedWithCD.envName') })
    ),
    infraId: Yup.string().required(
      getString('common.validation.fieldIsRequired', { name: getString('infrastructureText') })
    ),
    namespace: Yup.string().required(
      getString('common.validation.fieldIsRequired', { name: getString('common.namespace') })
    ),
    connectorName: Yup.string().required(getString('validation.nameRequired')),
    delegateType: Yup.string().required(
      getString('connectors.chooseMethodForConnection', {
        name: getString('connectors.k8sConnection')
      })
    )
  })

  return (
    <Layout.Vertical width="80%">
      <Text font={{ variation: FontVariation.H4 }}>{getString('cd.getStartedWithCD.workloadDeploy')}</Text>
      <Formik<SelectInfrastructureInterface>
        initialValues={{
          ...defaultInitialFormData,
          infraType: get(infrastructureData, 'type') || '',
          envId: get(environmentData, 'name') || '',
          infraId: get(infrastructureData, 'name') || '',
          namespace: get(infrastructureData, 'infrastructureDefinition.spec.namespace') || ''
        }}
        formName="cdInfrastructure"
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <Form>
              <Container className={css.workloadType}>
               {props.disableNextBtn()}
                <CardSelect
                  data={InfrastructureTypes}
                  cornerSelected={true}
                  className={defaultCss.icons}
                  cardClassName={defaultCss.serviceDeploymentTypeCard}
                  renderItem={(item: InfrastructureType) => (
                    <>
                      <Layout.Vertical flex>
                        <Icon name={item.icon} size={30} flex className={defaultCss.serviceDeploymentTypeIcon} />

                        <Text font={{ variation: FontVariation.SMALL_SEMI }} padding={{ top: 'xxlarge' }} width={78}>
                          {getString(item.label)}
                        </Text>
                      </Layout.Vertical>
                    </>
                  )}
                  selected={infrastructureType}
                  onChange={(item: InfrastructureType) => {
                    formikProps.setFieldValue('infraType', item.value)
                    setInfrastructureType(item)
                  }}
                />
              </Container>
              <Layout.Horizontal className={css.infraInputs}>
                <FormInput.Text
                  tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                  label={getString('cd.getStartedWithCD.envName')}
                  name="envId"
                  className={defaultCss.formInput}
                />
                <FormInput.Text
                  // tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                  label={getString('infrastructureText')}
                  name="infraId"
                  className={defaultCss.formInput}
                />
                <FormInput.Text
                  tooltipProps={{ dataTooltipId: 'gcpInfraNamespace' }}
                  label={getString('common.namespace')}
                  placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
                  name="namespace"
                  className={defaultCss.formInput}
                />
              </Layout.Horizontal>
              {borderBottom}
              {infrastructureType &&
              formikRef?.current?.values?.envId &&
              formikRef?.current?.values?.infraId &&
              formikRef?.current?.values?.namespace ? (
                <Accordion
                  className={defaultCss.accordion}
                  activeId={infrastructureType ? 'authMethod' : 'setUpDelegate'}
                >
                  <Accordion.Panel
                    id="authMethod"
                    summary={
                      <Layout.Horizontal flex={{ alignItems: 'center' }}>
                        <Text font={{ variation: FontVariation.H5 }}>{'Connect to your Kubernetes cluster'}</Text>
                        {openSetUpDelegateAccordion() ? (
                          <Icon name="success-tick" size={20} className={defaultCss.accordionStatus} />
                        ) : (
                          <Icon name="danger-icon" size={20} className={defaultCss.accordionStatus} />
                        )}
                      </Layout.Horizontal>
                    }
                    details={
                      <SelectAuthenticationMethod
                        formikProps={formikProps}
                        ref={selectAuthenticationMethodRef}
                        onSuccess={data => {
                          return data
                        }}
                        disableNextBtn={() => setDisableBtn(true)}
                        enableNextBtn={() => setDisableBtn(disableBtn)}
                      ></SelectAuthenticationMethod>
                    }
                  />
                </Accordion>
              ) : null}
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const SelectInfrastructure = React.forwardRef(SelectInfrastructureRef)
