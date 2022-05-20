/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { noop, omit } from 'lodash-es'
import produce from 'immer'
import * as Yup from 'yup'
import {
  Container,
  Formik,
  FormikForm,
  Button,
  ButtonVariation,
  Text,
  IconName,
  CardSelect,
  Layout,
  Icon
} from '@wings-software/uicore'
import { Color, FontVariation } from '@wings-software/design-system'
import { Divider } from '@blueprintjs/core'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'

import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm, { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { EntityGitDetails, StoreType } from 'services/pipeline-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PipelineActions } from '@common/constants/TrackingConstants'
import { GitSyncForm } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { StoreMetaData } from '@common/constants/GitSyncTypes'
import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'
import css from './PipelineCreate.module.scss'

const logger = loggerFor(ModuleName.CD)

interface CardInterface {
  type: string
  title: string
  info: string
  icon: IconName
  disabled?: boolean
}
interface UseTemplate {
  useTemplate?: boolean
}

interface PipelineInfoConfigWithGitDetails extends PipelineInfoConfig {
  repo: string
  branch: string
  connectorRef?: any
  storeType?: string
  importYaml?: string
  repoName?: string
  filePath?: string
}

type CretePipelinesValue = PipelineInfoConfigWithGitDetails & UseTemplate

export interface PipelineCreateProps {
  afterSave?: (
    values: PipelineInfoConfig,
    storeMetadata: StoreMetaData,
    gitDetails?: EntityGitDetails,
    useTemplate?: boolean
  ) => void
  initialValues?: CretePipelinesValue
  closeModal?: () => void
  gitDetails?: IGitContextFormProps
}

export default function CreatePipelines({
  afterSave,
  initialValues = {
    identifier: DefaultNewPipelineId,
    name: '',
    description: '',
    tags: {},
    repo: '',
    branch: '',
    storeType: 'inline',
    stages: []
  },
  closeModal,
  gitDetails
}: PipelineCreateProps): JSX.Element {
  const { getString } = useStrings()
  const { pipelineIdentifier } = useParams<{ pipelineIdentifier: string }>()
  const { storeType: storeTypeParam } = useQueryParams<GitQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams()
  const { isGitSyncEnabled } = useAppStore()
  const gitSimplification: boolean = useFeatureFlag(FeatureFlag.GIT_SIMPLIFICATION)
  const { trackEvent } = useTelemetry()
  const templatesFeatureFlagEnabled = useFeatureFlag(FeatureFlag.NG_TEMPLATES)
  const pipelineTemplatesFeatureFlagEnabled = useFeatureFlag(FeatureFlag.NG_PIPELINE_TEMPLATE)
  const isPipelineTemplateEnabled = templatesFeatureFlagEnabled && pipelineTemplatesFeatureFlagEnabled

  const newInitialValues = React.useMemo(() => {
    return produce(initialValues, draft => {
      if (draft.identifier === DefaultNewPipelineId) {
        draft.identifier = ''
      }
    })
  }, [initialValues])

  const PipelineModeCards: CardInterface[] = [
    {
      type: 'INLINE',
      title: 'Inline',
      info: 'Pipeline content is stored in Harness',
      icon: 'repository',
      disabled: pipelineIdentifier !== DefaultNewPipelineId && storeTypeParam === 'REMOTE'
    },
    {
      type: 'REMOTE',
      title: 'Remote',
      info: 'Pipeline content is stored in a Git repository',
      icon: 'remote-setup',
      disabled: pipelineIdentifier !== DefaultNewPipelineId && !storeTypeParam
    }
  ]

  const [storeType, setStoreType] = useState<CardInterface | undefined>(() =>
    PipelineModeCards.find(card => card.type === storeTypeParam)
  )

  const isEdit = React.useMemo(() => initialValues?.identifier !== DefaultNewPipelineId, [initialValues])

  useEffect(() => {
    !isEdit &&
      trackEvent(PipelineActions.LoadCreateNewPipeline, {
        category: Category.PIPELINE
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  useEffect(() => {
    !!storeType?.type && updateQueryParams({ storeType: storeType?.type })
  }, [storeType])

  return (
    <Container className={css.pipelineCreateForm}>
      <Formik<CretePipelinesValue>
        initialValues={newInitialValues}
        formName="pipelineCreate"
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('createPipeline.pipelineNameRequired') }),
          identifier: IdentifierSchema(),
          ...(isGitSyncEnabled
            ? {
                repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
                branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
              }
            : {})
        })}
        onSubmit={values => {
          logger.info(JSON.stringify(values))
          const formGitDetails =
            gitSimplification && values.storeType === 'REMOTE'
              ? { repoName: values.repoName, branch: values.branch, filePath: values.filePath }
              : values.repo && values.repo.trim().length > 0
              ? { repoIdentifier: values.repo, branch: values.branch }
              : undefined
          afterSave &&
            afterSave(
              omit(values, 'repo', 'branch', 'storeType', 'connectorRef', 'useTemplate'),
              { storeType: values.storeType as StoreMetaData['storeType'], connectorRef: values.connectorRef?.value },
              formGitDetails,
              values.useTemplate
            )
        }}
      >
        {formikProps => (
          <FormikForm>
            <NameIdDescriptionTags
              formikProps={formikProps}
              identifierProps={{
                isIdentifierEditable: pipelineIdentifier === DefaultNewPipelineId
              }}
              tooltipProps={{ dataTooltipId: 'pipelineCreate' }}
            />
            {isGitSyncEnabled && (
              <GitSyncStoreProvider>
                <GitContextForm formikProps={formikProps as any} gitDetails={gitDetails} />
              </GitSyncStoreProvider>
            )}
            {!isEdit && isPipelineTemplateEnabled && (
              <Container padding={{ top: 'xlarge' }}>
                <Button
                  text={'Start with Template'}
                  icon={'template-library'}
                  iconProps={{
                    size: 12
                  }}
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => {
                    formikProps.setFieldValue('useTemplate', true)
                    window.requestAnimationFrame(() => {
                      formikProps.submitForm()
                    })
                  }}
                />
              </Container>
            )}

            {gitSimplification && !isGitSyncEnabled ? (
              <>
                <Divider />
                <Text font={{ variation: FontVariation.H6 }} className={css.choosePipelineSetupHeader}>
                  {getString('pipeline.createPipeline.choosePipelineSetupHeader')}
                </Text>
                <CardSelect
                  data={PipelineModeCards}
                  cornerSelected
                  cardClassName={css.pipelineModeCard}
                  renderItem={(item: CardInterface) => (
                    <Layout.Horizontal flex spacing={'small'}>
                      <Icon
                        size={16}
                        name={item.icon}
                        color={storeType?.type === item.type ? Color.PRIMARY_7 : Color.GREY_600}
                      />
                      <Container>
                        <Text
                          font={{ variation: FontVariation.FORM_TITLE }}
                          color={storeType?.type === item.type ? Color.PRIMARY_7 : Color.GREY_800}
                        >
                          {item.title}
                        </Text>
                        <Text>{item.info}</Text>
                      </Container>
                    </Layout.Horizontal>
                  )}
                  selected={storeType}
                  onChange={(item: CardInterface) => {
                    if (pipelineIdentifier === DefaultNewPipelineId) {
                      formikProps?.setFieldValue('storeType', item.type)
                      formikProps?.setFieldValue('remoteType', item.type === StoreType.REMOTE ? 'create' : '')
                      setStoreType(item)
                    }
                  }}
                />
              </>
            ) : null}
            {storeType?.type === 'REMOTE' ? (
              <GitSyncForm
                formikProps={formikProps as any}
                handleSubmit={noop}
                isEdit={isEdit && pipelineIdentifier !== DefaultNewPipelineId}
              ></GitSyncForm>
            ) : null}

            <Container padding={{ top: 'xlarge' }}>
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={isEdit ? getString('save') : getString('start')}
              />
              &nbsp; &nbsp;
              <Button
                variation={ButtonVariation.TERTIARY}
                text={getString('cancel')}
                onClick={() => {
                  trackEvent(PipelineActions.CancelCreateNewPipeline, {
                    category: Category.PIPELINE
                  })
                  closeModal?.()
                }}
              />
            </Container>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}
