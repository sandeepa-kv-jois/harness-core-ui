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
  Button,
  ButtonVariation,
  Accordion,
  FormInput,
  FormError
} from '@harness/uicore'
import type { FormikContextType } from 'formik'
import cx from 'classnames'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import { CreateDelegateWizard } from '@delegates/components/CreateDelegate/CreateDelegateWizard'
import { InfrastructureTypes, InfrastructureType } from '../DeployProvisioningWizard/Constants'
import { SelectAuthenticationMethod, SelectAuthenticationMethodRef } from './SelectAuthenticationMethod'
import css from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface SelectInfrastructureRef {
  values: SelectInfrastructureInterface
  setFieldTouched(
    field: keyof SelectInfrastructureInterface & string,
    isTouched?: boolean,
    shouldValidate?: boolean
  ): void
  validate?: () => boolean
  showValidationErrors?: () => void
}
export interface SelectInfrastructureInterface {
  infraType: string
  envId: string
  infraId: string
}

interface SelectInfrastructureProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
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
  const [disableBtn, setDisableBtn] = useState<boolean>(false)
  const [infrastructureType, setInfrastructureType] = useState<InfrastructureType | undefined>()
  const formikRef = useRef<FormikContextType<SelectInfrastructureInterface>>()
  const selectAuthenticationMethodRef = React.useRef<SelectAuthenticationMethodRef | null>(null)
  // useEffect(() => {
  //   if (infrastructureType) enableNextBtn()
  //   else disableNextBtn()
  // })

  const openSetUpDelegateAccordion = (): boolean | undefined => {
    return selectAuthenticationMethodRef?.current?.validate()
  }

  const setForwardRef = ({ values, setFieldTouched }: Omit<SelectInfrastructureRef, 'validate'>): void => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }

    if (values) {
      forwardRef.current = {
        values,
        setFieldTouched: setFieldTouched
        // validate: validateInfraSetup
      }
    }
  }
  useEffect(() => {
    if (formikRef.current?.values && formikRef.current?.setFieldTouched) {
      setForwardRef({
        values: formikRef.current.values,
        setFieldTouched: formikRef.current.setFieldTouched
      })
    }
  }, [formikRef?.current?.values, formikRef?.current?.setFieldTouched])

  const [showDelegateModal, hideDelegateModal] = useModalHook(() => {
    const onClose = (): void => {
      hideDelegateModal()
    }
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <CreateDelegateWizard onClose={onClose}></CreateDelegateWizard>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [])
  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const borderBottom = <div className={css.repoborderBottom} />
  return (
    <Layout.Vertical width="80%">
      <Text font={{ variation: FontVariation.H4 }}>{getString('cd.getStartedWithCD.workloadDeploy')}</Text>
      <Formik<SelectInfrastructureInterface>
        initialValues={{
          infraType: '',
          infraId: '',
          envId: ''
        }}
        formName="cdInfrastructure"
        onSubmit={(values: SelectInfrastructureInterface) => Promise.resolve(values)}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <Form>
              <Container padding={{ top: 'xxlarge', bottom: 'xxxlarge' }}>
                <CardSelect
                  data={InfrastructureTypes}
                  cornerSelected={true}
                  className={css.icons}
                  cardClassName={css.serviceDeploymentTypeCard}
                  renderItem={(item: InfrastructureType) => (
                    <>
                      <Layout.Vertical flex>
                        <Icon name={item.icon} size={30} flex className={css.serviceDeploymentTypeIcon} />

                        <Text font={{ variation: FontVariation.SMALL_SEMI }} padding={{ top: 'xxlarge' }} width={78}>
                          {getString(item.label)}
                        </Text>
                      </Layout.Vertical>
                    </>
                  )}
                  selected={infrastructureType}
                  onChange={(item: InfrastructureType) => {
                    formikProps.setFieldValue('infraType', item)
                    setInfrastructureType(item)
                  }}
                />
                {formikProps.touched.infraType && !formikProps.values.infraType ? (
                  <FormError
                    className={css.marginTop}
                    name={'infraType'}
                    errorMessage={getString('common.getStarted.plsChoose', {
                      field: `${getString('infrastructureText')}`
                    })}
                  />
                ) : null}
              </Container>
              <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'xxlarge' }}>
                <FormInput.Text
                  tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                  label={getString('cd.getStartedWithCD.envName')}
                  name="envId"
                  className={css.formInput}
                />
                <FormInput.Text
                  // tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                  label={getString('cd.getStartedWithCD.infraName')}
                  name="infraId"
                  className={css.formInput}
                />
              </Layout.Vertical>
              {borderBottom}
              {infrastructureType && formikRef?.current?.values?.envId && formikRef?.current?.values?.infraId ? (
                <Accordion className={css.accordion} activeId={infrastructureType ? 'authMethod' : 'setUpDelegate'}>
                  <Accordion.Panel
                    id="authMethod"
                    summary={
                      <Layout.Horizontal width={300}>
                        <Text font={{ variation: FontVariation.H5 }}>{getString('common.authMethod')}</Text>
                        {openSetUpDelegateAccordion() ? (
                          <Icon name="success-tick" size={20} className={css.accordionStatus} />
                        ) : (
                          <Icon name="danger-icon" size={20} className={css.accordionStatus} />
                        )}
                      </Layout.Horizontal>
                    }
                    details={
                      <SelectAuthenticationMethod
                        ref={selectAuthenticationMethodRef}
                        disableNextBtn={() => setDisableBtn(true)}
                        enableNextBtn={() => setDisableBtn(disableBtn)}
                      ></SelectAuthenticationMethod>
                      // <Stepk8ClusterDetails
                      //   setIsEditMode={props.setIsEditMode}
                      //   identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
                      //   connectorInfo={props.connectorInfo}
                      //   accountId={''}
                      //   orgIdentifier={''}
                      //   projectIdentifier={''}
                      //   isEditMode={false}
                      //   // gitDetails={props.gitDetails}
                      //   onConnectorCreated={props.onSuccess}
                      //   onBoarding={true}
                      // ></Stepk8ClusterDetails>
                    }
                  />

                  <Accordion.Panel
                    id="setUpDelegate"
                    summary={
                      <Text font={{ variation: FontVariation.H5 }} width={300}>
                        {getString('cd.getStartedWithCD.setupDelegate')}
                      </Text>
                    }
                    details={
                      <>
                        <Text padding={{ bottom: 'medium' }}>{getString('cd.getStartedWithCD.delegateInfo')}</Text>
                        <Button
                          text={getString('cd.getStartedWithCD.setupaNewDelegate')}
                          variation={ButtonVariation.SECONDARY}
                          onClick={showDelegateModal}
                        />
                      </>
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
