/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import { parse } from 'yaml'

import {
  ButtonSize,
  ButtonVariation,
  Dialog,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  useToaster
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import { useStrings } from 'framework/strings'
import { EnvironmentResponse, EnvironmentResponseDTO, useGetEnvironmentListV2 } from 'services/cd-ng'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import RbacButton from '@rbac/components/Button/Button'

import { useMutateAsGet } from '@common/hooks'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import AddEditEnvironmentModal from '../AddEditEnvironmentModal'
import { isEditEnvironment } from '../utils'
import css from '../DeployInfrastructureStep.module.scss'

// TODO: Forward ref with formik
// interface DeployEnvironmentProps {
//   formikRef: React.MutableRefObject<FormikProps<DeploymentStageConfig> | null>
//   readonly?: boolean
//   // environmentIdentifier: string
//   allowableTypes: MultiTypeInputType[]
// }

export default function DeployEnvironment({ initialValues, readonly, formikRef, allowableTypes, expressions }: any) {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const {
    data: environmentsResponse,
    loading: environmentsLoading,
    error: environmentsError
  } = useMutateAsGet(useGetEnvironmentListV2, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    body: {
      filterType: 'Environment'
    }
  })

  const [environments, setEnvironments] = useState<EnvironmentResponseDTO[]>()
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentResponseDTO>()
  const [environmentsSelectOptions, setEnvironmentsSelectOptions] = useState<SelectOption[]>()
  const [environmentRefType, setEnvironmentRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues.environment.environmentRef)
  )

  useEffect(() => {
    if (!environmentsLoading && !get(environmentsResponse, 'data.empty')) {
      setEnvironments(
        defaultTo(
          get(environmentsResponse, 'data.content', [])?.map((environmentObj: EnvironmentResponse) => ({
            ...environmentObj.environment
          })),
          []
        )
      )
    }
  }, [environmentsLoading, environmentsResponse])

  useEffect(() => {
    if (!isNil(environments)) {
      setEnvironmentsSelectOptions(
        environments.map(environment => {
          return { label: defaultTo(environment.name, ''), value: defaultTo(environment.identifier, '') }
        })
      )
    }
  }, [environments])

  useEffect(() => {
    if (
      !isEmpty(environmentsSelectOptions) &&
      !isNil(environmentsSelectOptions) &&
      initialValues.environment.environmentRef
    ) {
      if (getMultiTypeFromValue(initialValues.environment.environmentRef) === MultiTypeInputType.FIXED) {
        const existingEnvironment = environmentsSelectOptions.find(
          env => env.value === initialValues.environment.environmentRef
        )
        if (!existingEnvironment) {
          if (!readonly) {
            formikRef.current?.setFieldValue('environment.environmentRef', '')
          } else {
            const options = [...environmentsSelectOptions]
            options.push({
              label: initialValues.environment.environmentRef,
              value: initialValues.environment.environmentRef
            })
            setEnvironmentsSelectOptions(options)
          }
        } else {
          formikRef.current?.setFieldValue('environment.environmentRef', existingEnvironment?.value)
          setSelectedEnvironment(
            environments?.find(environment => environment.identifier === existingEnvironment?.value)
          )
        }
      }
    }
  }, [environmentsSelectOptions])

  useEffect(() => {
    if (!isNil(environmentsError)) {
      showError(getRBACErrorMessage(environmentsError))
    }
  }, [environmentsError])

  const updateEnvironmentsList = (values: EnvironmentResponseDTO) => {
    formikRef.current?.setFieldValue('environment.environmentRef', values.identifier)
    if (!isNil(environments) && !isEmpty(environments)) {
      const newEnvironmentsList = [...environments]
      const existingIndex = newEnvironmentsList.findIndex(item => item.identifier === values.identifier)
      if (existingIndex >= 0) {
        newEnvironmentsList.splice(existingIndex, 1, values)
      } else {
        newEnvironmentsList.unshift(values)
      }
      setEnvironments(newEnvironmentsList)
      setSelectedEnvironment(newEnvironmentsList?.find(environment => environment.identifier === values?.identifier))
    }
    hideEnvironmentModal()
  }

  const [showEnvironmentModal, hideEnvironmentModal] = useModalHook(() => {
    const environmentValues = parse(defaultTo(selectedEnvironment?.yaml, '{}'))
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideEnvironmentModal}
        title={isEditEnvironment(selectedEnvironment) ? getString('editEnvironment') : getString('newEnvironment')}
        className={css.dialogStyles}
      >
        <AddEditEnvironmentModal
          data={{
            ...environmentValues
          }}
          onCreateOrUpdate={updateEnvironmentsList}
          closeModal={hideEnvironmentModal}
          isEdit={Boolean(selectedEnvironment)}
        />
      </Dialog>
    )
  }, [environments, updateEnvironmentsList])

  return (
    <Layout.Horizontal
      className={css.formRow}
      spacing="medium"
      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
    >
      <FormInput.MultiTypeInput
        label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
        tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
        name="environment.environmentRef"
        useValue
        disabled={readonly || (environmentRefType === MultiTypeInputType.FIXED && environmentsLoading)}
        placeholder={
          environmentsLoading ? getString('loading') : getString('cd.pipelineSteps.environmentTab.selectEnvironment')
        }
        multiTypeInputProps={{
          onTypeChange: setEnvironmentRefType,
          width: 280,
          onChange: item => {
            setSelectedEnvironment(
              environments?.find(environment => environment.identifier === (item as SelectOption)?.value)
            )
          },
          selectProps: {
            addClearBtn: !readonly,
            items: defaultTo(environmentsSelectOptions, [])
          },
          expressions,
          allowableTypes
        }}
        selectItems={defaultTo(environmentsSelectOptions, [])}
      />
      {environmentRefType === MultiTypeInputType.FIXED && (
        <RbacButton
          margin={{ top: 'xlarge' }}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          disabled={readonly}
          onClick={showEnvironmentModal}
          permission={{
            resource: {
              resourceType: ResourceType.ENVIRONMENT
            },
            permission: PermissionIdentifier.EDIT_ENVIRONMENT
          }}
          text={
            isEditEnvironment(selectedEnvironment)
              ? getString('common.editName', { name: getString('environment') })
              : getString('common.plusNewName', { name: getString('environment') })
          }
          id={isEditEnvironment(selectedEnvironment) ? 'edit-environment' : 'add-new-environment'}
        />
      )}
    </Layout.Horizontal>
  )
}
