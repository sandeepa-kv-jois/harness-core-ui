/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import type { FormikContextType } from 'formik'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { Container, FormInput, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import RepositorySelect from '@common/components/RepositorySelect/RepositorySelect'
import RepoBranchSelectV2 from '@common/components/RepoBranchSelectV2/RepoBranchSelectV2'

interface GitSyncFormProps<T> {
  identifier?: string
  formikProps: FormikContextType<T>
  isEdit: boolean
  defaultValue?: any
  modalErrorHandler?: any
  handleSubmit: () => void
  closeModal?: () => void
}

interface GitSyncFormFields {
  identifier?: string
  remoteType?: string
  connectorRef?: ConnectorSelectedValue
  repoName?: string
  branch?: string
  filePath?: string
}

const getConnectorIdentifierWithScope = (scope: Scope, identifier: string): string => {
  return scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${identifier}` : identifier
}

export function GitSyncForm(props: GitSyncFormProps<GitSyncFormFields>): React.ReactElement {
  const { formikProps, modalErrorHandler, isEdit } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { branch, connectorRef, repoName } = useQueryParams<GitQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams()
  const { getString } = useStrings()

  useEffect(() => {
    formikProps.setFieldValue('remoteType', 'create')
    formikProps?.values?.identifier && formikProps.setFieldValue('filePath', `${formikProps.values.identifier}.yaml`)
  }, [formikProps?.values?.identifier])

  return (
    <Container padding={{ top: 'large' }} className={cx()}>
      <FormInput.RadioGroup
        name="remoteType"
        radioGroup={{ inline: true }}
        items={[
          { label: 'Use Existing Yaml', value: 'import', disabled: true },
          { label: 'Create New Yaml', value: 'create' }
        ]}
        onChange={elm => {
          formikProps.setFieldValue(
            'filePath',
            (elm.target as HTMLInputElement).value === 'import' ? '' : `${formikProps?.values?.identifier}.yaml`
          )
        }}
      />
      <ConnectorReferenceField
        name="connectorRef"
        width={350}
        type={['Github', 'Bitbucket']}
        selected={formikProps.values.connectorRef || connectorRef}
        label={'Select Git Connector'}
        placeholder={`- ${getString('select')} -`}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onChange={(value, scope) => {
          // modalErrorHandler?.hide()
          formikProps.setFieldValue('connectorRef', {
            label: defaultTo(value.name, ''),
            value: getConnectorIdentifierWithScope(scope, value?.identifier),
            scope: scope,
            live: value?.status?.status === 'SUCCESS',
            connector: value
          })
          formikProps.setFieldValue?.('repoName', '')
          formikProps.setFieldValue?.('branch', '')
          updateQueryParams({ connectorRef: value?.identifier, repoName: [] as any, branch: [] as any })
        }}
        disabled={isEdit}
      />

      <RepositorySelect
        formikProps={formikProps}
        connectorRef={formikProps.values.connectorRef?.value}
        //modalErrorHandler={modalErrorHandler}
        onChange={(selected: SelectOption, options?: SelectOption[]) => {
          if (!options?.find(repo => repo.value === selected.value)) {
            formikProps.setFieldValue?.('repository', '')
          }
          formikProps.setFieldValue?.('branch', '')
          updateQueryParams({ repoName: selected.value as string, branch: [] as any })
        }}
        selectedValue={formikProps.values.repoName || repoName}
        disabled={isEdit}
      />
      <RepoBranchSelectV2
        connectorIdentifierRef={formikProps.values.connectorRef?.value}
        repoName={formikProps.values.repoName}
        modalErrorHandler={modalErrorHandler}
        onChange={(selected: SelectOption, options?: SelectOption[]) => {
          if (!options?.find(currBranch => currBranch.value === selected.value)) {
            formikProps.setFieldValue?.('branch', '')
          }
          updateQueryParams({ branch: selected.value as string })
        }}
        selectedValue={formikProps.values.branch || branch}
        disabled={isEdit}
      />
      <FormInput.Text name="filePath" label={'Yaml Path'} placeholder={'Enter Yaml path'} disabled={isEdit} />
    </Container>
  )
}
