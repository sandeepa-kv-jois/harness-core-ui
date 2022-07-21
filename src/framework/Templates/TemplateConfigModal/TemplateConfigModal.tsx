/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import * as Yup from 'yup'
import { defaultTo, isEmpty, isEqual, omit, unset, pick } from 'lodash-es'
import type { FormikProps } from 'formik'
import {
  Button,
  ButtonVariation,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Icon,
  Layout,
  Select,
  SelectOption,
  Text
} from '@wings-software/uicore'
import produce from 'immer'
import { Classes, Divider } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import classNames from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { EntityGitDetails, NGTemplateInfoConfig } from 'services/template-ng'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { PageSpinner } from '@common/components'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import GitContextForm from '@common/components/GitContextForm/GitContextForm'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { IdentifierSchema, NameSchema, TemplateVersionLabelSchema } from '@common/utils/Validation'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { GitSyncForm, gitSyncFormSchema } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { InlineRemoteSelect } from '@common/components/InlineRemoteSelect/InlineRemoteSelect'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from '../templates'
import css from './TemplateConfigModal.module.scss'

export enum Fields {
  Name = 'name',
  Identifier = 'identifier',
  Description = 'description',
  Tags = 'tags',
  VersionLabel = 'versionLabel',
  Repo = 'repo',
  RepoName = 'repoName',
  Branch = 'branch',
  ConnectorRef = 'connectorRef',
  FilePath = 'filePath'
}

export interface PromiseExtraArgs {
  isEdit?: boolean
  updatedGitDetails?: EntityGitDetails
  comment?: string
  storeMetadata?: StoreMetadata
}

export enum Intent {
  START = 'Start',
  EDIT = 'Edit',
  SAVE = 'SAVE'
}

export interface ModalProps {
  initialValues: NGTemplateInfoConfig & StoreMetadata
  promise: (values: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs) => Promise<UseSaveSuccessResponse>
  gitDetails?: EntityGitDetails
  title: string
  intent: Intent
  disabledFields?: Fields[]
  shouldGetComment?: boolean
  showGitFields?: boolean
  allowScopeChange?: boolean
  lastPublishedVersion?: string
}

export interface TemplateConfigValues extends NGTemplateInfoConfigWithGitDetails {
  comment?: string
}

export interface NGTemplateInfoConfigWithGitDetails extends NGTemplateInfoConfig {
  connectorRef?: string
  repo?: string
  branch?: string
  storeType?: StoreType
  filePath?: string
}

export interface ConfigModalProps extends ModalProps {
  onClose: () => void
}

interface BasicDetailsInterface extends ConfigModalProps {
  setPreviewValues: Dispatch<SetStateAction<NGTemplateInfoConfigWithGitDetails>>
}

const BasicTemplateDetails = (props: BasicDetailsInterface): JSX.Element => {
  const { getString } = useStrings()

  const {
    initialValues,
    setPreviewValues,
    onClose,
    gitDetails,
    allowScopeChange = false,
    showGitFields,
    shouldGetComment,
    title,
    intent,
    disabledFields = [],
    promise,
    lastPublishedVersion
  } = props
  const pathParams = useParams<TemplateStudioPathProps>()
  const { orgIdentifier, projectIdentifier, templateIdentifier } = pathParams
  const { isGitSyncEnabled, isGitSimplificationEnabled } = useAppStore()
  const formName = `create${initialValues.type}Template`
  const [loading, setLoading] = React.useState<boolean>()
  const { isReadonly } = useContext(TemplateContext)
  const scope = getScopeFromDTO(pathParams)
  const SCOPE_OPTIONS: SelectOption[] = [
    {
      value: Scope.ACCOUNT,
      label: getString('account')
    },
    {
      value: Scope.ORG,
      label: getString('orgLabel')
    },
    {
      value: Scope.PROJECT,
      label: getString('projectLabel')
    }
  ]

  const [isEdit, setIsEdit] = React.useState(() =>
    isGitSimplificationEnabled
      ? !!templateIdentifier && templateIdentifier !== DefaultNewTemplateId
      : initialValues.identifier !== DefaultNewTemplateId
  )

  const formInitialValues = React.useMemo(
    () =>
      produce(initialValues as TemplateConfigValues, draft => {
        if (isEmpty(initialValues.name)) {
          draft.name = getString('templatesLibrary.createNewModal.namePlaceholder', { entity: initialValues.type })
        }
        if (isEqual(initialValues.identifier, DefaultNewTemplateId)) {
          draft.identifier = getString('templatesLibrary.createNewModal.identifierPlaceholder', {
            entity: initialValues.type.toLowerCase()
          })
        }
        if (isEqual(initialValues.versionLabel, DefaultNewVersionLabel)) {
          unset(draft, 'versionLabel')
        }
        if (isGitSyncEnabled) {
          draft.repo = gitDetails?.repoIdentifier
          draft.branch = gitDetails?.branch
        }
      }),
    [initialValues]
  )

  const getSubmitButtonLabel = React.useCallback(
    (formik: FormikProps<TemplateConfigValues>) => {
      if (intent === Intent.EDIT) {
        return getString('continue')
      } else {
        if (intent === Intent.START) {
          return getString('start')
        } else {
          if (isGitSyncEnabled && getScopeFromDTO(formik.values) === Scope.PROJECT) {
            return getString('continue')
          } else {
            return getString('save')
          }
        }
      }
    },
    [intent, isGitSyncEnabled]
  )

  React.useEffect(() => {
    const edit = isGitSimplificationEnabled
      ? !!templateIdentifier && templateIdentifier !== DefaultNewTemplateId
      : initialValues.identifier !== DefaultNewTemplateId
    setIsEdit(edit)
  }, [initialValues])

  const onSubmit = React.useCallback(
    (values: TemplateConfigValues) => {
      setLoading(true)
      const storeMetadata = {
        storeType: values.storeType,
        connectorRef:
          typeof values.connectorRef === 'string'
            ? values.connectorRef
            : (values.connectorRef as unknown as ConnectorSelectedValue)?.value,
        repoName: values.repo,
        branch: values.branch,
        filePath: values.filePath
      }

      promise(omit(values, 'repo', 'branch', 'comment', 'connectorRef', 'storeType', 'filePath'), {
        isEdit: false,
        ...(!isEmpty(values.repo) && {
          updatedGitDetails: { ...gitDetails, repoIdentifier: values.repo, branch: values.branch }
        }),
        ...(isGitSimplificationEnabled ? { storeMetadata } : {}),
        ...(!isEmpty(values.comment?.trim()) && { comment: values.comment?.trim() })
      })
        .then(response => {
          setLoading(false)
          if (response && response.status === 'SUCCESS') {
            onClose()
          } else {
            throw response
          }
        })
        .catch(_error => {
          setLoading(false)
        })
    },
    [setLoading, promise, gitDetails, onClose]
  )

  const onScopeChange = ({ value }: SelectOption, formik: FormikProps<TemplateConfigValues>) => {
    formik.setValues(
      produce(formik.values, draft => {
        draft.projectIdentifier = value === Scope.PROJECT ? projectIdentifier : undefined
        draft.orgIdentifier = value === Scope.ACCOUNT ? undefined : orgIdentifier
        if (isGitSyncEnabled) {
          if (value === Scope.PROJECT) {
            draft.repo = gitDetails?.repoIdentifier
            draft.branch = gitDetails?.branch
          } else {
            unset(draft, 'repo')
            unset(draft, 'branch')
          }
        }
      })
    )
  }

  React.useEffect(() => {
    setPreviewValues(formInitialValues)
  }, [formInitialValues])

  return (
    <Container
      width={'55%'}
      className={classNames(css.basicDetails, {
        [css.gitBasicDetails]: isGitSimplificationEnabled
      })}
      background={Color.FORM_BG}
      padding={'huge'}
    >
      {loading && <PageSpinner />}
      <Text
        color={Color.GREY_800}
        font={{ weight: 'bold', size: 'medium' }}
        margin={{ bottom: 'xlarge', left: 0, right: 0 }}
      >
        {defaultTo(title, '')}
      </Text>
      <Formik<TemplateConfigValues>
        initialValues={formInitialValues}
        onSubmit={onSubmit}
        validate={setPreviewValues}
        formName={formName}
        validationSchema={Yup.object().shape({
          name: NameSchema({
            requiredErrorMsg: getString('common.validation.fieldIsRequired', {
              name: getString('templatesLibrary.createNewModal.nameError')
            })
          }),
          identifier: IdentifierSchema(),
          versionLabel: TemplateVersionLabelSchema(),
          ...(isGitSimplificationEnabled
            ? gitSyncFormSchema(getString)
            : isGitSyncEnabled && showGitFields
            ? {
                repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
                branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
              }
            : {})
        })}
      >
        {(formik: FormikProps<TemplateConfigValues>) => {
          return (
            <FormikForm>
              <Layout.Vertical spacing={'huge'}>
                <Container
                  className={classNames({
                    [css.gitFormWrapper]: isGitSimplificationEnabled
                  })}
                >
                  <Layout.Vertical spacing={'small'}>
                    <Container>
                      <Layout.Vertical>
                        <NameIdDescriptionTags
                          tooltipProps={{ dataTooltipId: formName }}
                          formikProps={formik}
                          identifierProps={{
                            isIdentifierEditable: !disabledFields.includes(Fields.Identifier) && !isReadonly,
                            inputGroupProps: { disabled: disabledFields.includes(Fields.Name) || isReadonly }
                          }}
                          className={classNames(css.nameIdDescriptionTags, {
                            [css.gitNameIdDescriptionTags]: isGitSimplificationEnabled
                          })}
                          descriptionProps={{
                            disabled: disabledFields.includes(Fields.Description) || isReadonly
                          }}
                          tagsProps={{
                            disabled: disabledFields.includes(Fields.Tags) || isReadonly
                          }}
                        />
                        <FormInput.Text
                          name="versionLabel"
                          placeholder={getString('templatesLibrary.createNewModal.versionPlaceholder')}
                          label={getString('common.versionLabel')}
                          disabled={disabledFields.includes(Fields.VersionLabel) || isReadonly}
                          className={classNames({
                            [css.gitNameIdDescriptionTags]: isGitSimplificationEnabled
                          })}
                        />
                        {lastPublishedVersion && (
                          <Container
                            border={{ radius: 4, color: Color.BLUE_100 }}
                            background={Color.BLUE_100}
                            flex={{ alignItems: 'center' }}
                            padding={'small'}
                            margin={{ bottom: 'medium' }}
                          >
                            <Layout.Horizontal spacing="small" flex={{ justifyContent: 'start' }}>
                              <Icon name="info-messaging" size={18} />
                              <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'small' }}>
                                {getString('templatesLibrary.createNewModal.lastPublishedVersion')}
                              </Text>
                              <Text
                                lineClamp={1}
                                color={Color.BLACK}
                                font={{ size: 'small' }}
                                margin={{ left: 'none' }}
                              >
                                {lastPublishedVersion}
                              </Text>
                            </Layout.Horizontal>
                          </Container>
                        )}
                        {allowScopeChange && scope === Scope.PROJECT && (
                          <Container className={Classes.FORM_GROUP} width={160} margin={{ bottom: 'medium' }}>
                            <label className={Classes.LABEL}>
                              {getString('templatesLibrary.templateSettingsModal.scopeLabel')}
                            </label>
                            <Select
                              value={SCOPE_OPTIONS.find(item => item.value === getScopeFromDTO(formik.values))}
                              items={SCOPE_OPTIONS}
                              onChange={item => onScopeChange(item, formik)}
                            />
                          </Container>
                        )}
                        {intent === Intent.SAVE &&
                          ((!isGitSimplificationEnabled && shouldGetComment) ||
                            (isGitSimplificationEnabled &&
                              formik.values?.storeType === StoreType.INLINE &&
                              shouldGetComment)) && (
                            <FormInput.TextArea
                              name="comment"
                              label={getString('optionalField', {
                                name: getString('common.commentModal.commentLabel')
                              })}
                              textArea={{
                                className: classNames(css.comment, {
                                  [css.gitNameIdDescriptionTags]: isGitSimplificationEnabled
                                })
                              }}
                            />
                          )}
                      </Layout.Vertical>
                    </Container>
                    {isGitSimplificationEnabled && (
                      <>
                        <Divider />
                        <Text font={{ variation: FontVariation.H6 }} className={css.choosePipelineSetupHeader}>
                          {getString('pipeline.createPipeline.choosePipelineSetupHeader')}
                        </Text>
                        <InlineRemoteSelect
                          className={css.inlineRemoteWrapper}
                          selected={defaultTo(formik.values?.storeType, StoreType.INLINE)}
                          onChange={item => {
                            formik.setFieldValue('storeType', item.type)
                            if (item.type === StoreType.REMOTE) {
                              setTimeout(() => {
                                const elem = document.getElementsByClassName(css.gitFormWrapper)[0]
                                elem?.scrollTo(0, elem.scrollHeight)
                              }, 0)
                            }
                          }}
                          getCardDisabledStatus={() => false}
                        />
                        {formik.values?.storeType === StoreType.REMOTE && (
                          <GitSyncForm
                            formikProps={formik}
                            isEdit={isEdit}
                            initialValues={pick(initialValues, 'repo', 'branch', 'filePath', 'connectorRef')}
                            disableFields={pick(
                              props.disabledFields?.reduce((fields: Record<string, boolean>, field: string) => {
                                fields[field] = true
                                return fields
                              }, {}),
                              Fields.ConnectorRef,
                              Fields.RepoName,
                              Fields.Branch,
                              Fields.FilePath
                            )}
                          />
                        )}
                      </>
                    )}
                    {isGitSyncEnabled &&
                      !isGitSimplificationEnabled &&
                      showGitFields &&
                      isEmpty(gitDetails) &&
                      getScopeFromDTO(formik.values) === Scope.PROJECT && (
                        <GitSyncStoreProvider>
                          <GitContextForm formikProps={formik as any} />
                        </GitSyncStoreProvider>
                      )}
                  </Layout.Vertical>
                </Container>
                <Container>
                  <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                    <RbacButton
                      text={getSubmitButtonLabel(formik)}
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      permission={{
                        permission: PermissionIdentifier.EDIT_TEMPLATE,
                        resource: {
                          resourceType: ResourceType.TEMPLATE
                        }
                      }}
                    />
                    <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onClose} />
                  </Layout.Horizontal>
                </Container>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export const TemplateConfigModal = (props: ConfigModalProps): JSX.Element => {
  const { initialValues, ...rest } = props
  const [previewValues, setPreviewValues] = useState<NGTemplateInfoConfigWithGitDetails>({
    ...initialValues,
    repo: rest.gitDetails?.repoIdentifier,
    branch: rest.gitDetails?.branch
  })
  const { isGitSyncEnabled } = useAppStore()

  const content = (
    <Layout.Horizontal>
      <BasicTemplateDetails initialValues={initialValues} setPreviewValues={setPreviewValues} {...rest} />
      <TemplatePreview previewValues={previewValues} />
      <Button
        className={css.closeIcon}
        iconProps={{ size: 24, color: Color.GREY_500 }}
        icon="cross"
        variation={ButtonVariation.ICON}
        onClick={props.onClose}
      />
    </Layout.Horizontal>
  )
  return isGitSyncEnabled ? <GitSyncStoreProvider>{content}</GitSyncStoreProvider> : content
}
