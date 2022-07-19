/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep, defaultTo, isEmpty, omit } from 'lodash-es'
import { parse } from 'yaml'
import { useHistory, useParams } from 'react-router-dom'
import { VisualYamlSelectedView as SelectedView } from '@wings-software/uicore'
import {
  createTemplatePromise,
  EntityGitDetails,
  NGTemplateInfoConfig,
  TemplateSummaryResponse,
  updateExistingTemplateLabelPromise
} from 'services/template-ng'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useToaster } from '@common/exports'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import routes from '@common/RouteDefinitions'
import type { GitQueryParams, ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { PromiseExtraArgs } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'

export interface FetchTemplateUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  signal?: AbortSignal
  repoIdentifier?: string
  branch?: string
}

declare global {
  interface WindowEventMap {
    TEMPLATE_SAVED: CustomEvent<TemplateSummaryResponse>
  }
}

interface SaveTemplateObj {
  template: NGTemplateInfoConfig
}

interface UseSaveTemplateReturnType {
  saveAndPublish: (
    updatedTemplate: NGTemplateInfoConfig,
    extraInfo: PromiseExtraArgs
  ) => Promise<UseSaveSuccessResponse>
}

export interface TemplateContextMetadata {
  yamlHandler?: YamlBuilderHandlerBinding
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
  setLoading?: (loading: boolean) => void
  fetchTemplate?: (args: FetchTemplateUnboundProps) => Promise<void>
  deleteTemplateCache?: (gitDetails?: EntityGitDetails) => Promise<void>
  view?: string
  isPipelineStudio?: boolean
  stableVersion?: string
  fireSuccessEvent?: boolean
}

export function useSaveTemplate(TemplateContextMetadata: TemplateContextMetadata): UseSaveTemplateReturnType {
  const {
    yamlHandler,
    gitDetails,
    storeMetadata,
    setLoading,
    fetchTemplate,
    deleteTemplateCache,
    view,
    isPipelineStudio,
    stableVersion,
    fireSuccessEvent
  } = TemplateContextMetadata
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const { templateIdentifier, templateType, projectIdentifier, orgIdentifier, accountId, module } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const history = useHistory()
  const isYaml = view === SelectedView.YAML

  const navigateToLocation = (newTemplate: NGTemplateInfoConfig, updatedGitDetails?: SaveToGitFormInterface): void => {
    history.replace(
      routes.toTemplateStudio({
        projectIdentifier: newTemplate.projectIdentifier,
        orgIdentifier: newTemplate.orgIdentifier,
        accountId,
        ...(!isEmpty(newTemplate.projectIdentifier) && { module }),
        templateType: templateType,
        templateIdentifier: newTemplate.identifier,
        versionLabel: newTemplate.versionLabel,
        repoIdentifier: updatedGitDetails?.repoIdentifier,
        branch: updatedGitDetails?.branch
      })
    )
  }

  const stringifyTemplate = React.useCallback(
    // Important to sanitize the final template to avoid sending null values as it fails schema validation
    (temp: NGTemplateInfoConfig) =>
      yamlStringify(
        JSON.parse(
          JSON.stringify({
            template: sanitize(temp, {
              removeEmptyString: false,
              removeEmptyObject: false,
              removeEmptyArray: false
            })
          })
        ),
        {
          version: '1.1'
        }
      ),
    []
  )

  const updateExistingLabel = async (
    latestTemplate: NGTemplateInfoConfig,
    comments?: string,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: { lastObjectId?: string },
    currStoreMetadata?: StoreMetadata
  ): Promise<UseSaveSuccessResponse> => {
    if (storeMetadata) {
      currStoreMetadata = storeMetadata
    }

    try {
      const response = await updateExistingTemplateLabelPromise({
        templateIdentifier: latestTemplate.identifier,
        versionLabel: latestTemplate.versionLabel,
        body: stringifyTemplate(latestTemplate),
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          comments,
          ...(updatedGitDetails ?? {}),
          ...(lastObject?.lastObjectId ? lastObject : {}),
          ...(updatedGitDetails && updatedGitDetails.isNewBranch ? { baseBranch: branch } : {}),
          ...(currStoreMetadata?.storeType === StoreType.REMOTE ? currStoreMetadata : {})
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
      setLoading?.(false)
      if (response && response.status === 'SUCCESS') {
        if (!isGitSyncEnabled && currStoreMetadata?.storeType !== StoreType.REMOTE) {
          clear()
          showSuccess(getString('common.template.updateTemplate.templateUpdated'))
        }
        await fetchTemplate?.({ forceFetch: true, forceUpdate: true })
        if (updatedGitDetails?.isNewBranch) {
          navigateToLocation(latestTemplate, updatedGitDetails)
        }
        return { status: response.status }
      } else {
        throw response
      }
    } catch (error) {
      clear()
      if (!isGitSyncEnabled && currStoreMetadata?.storeType !== StoreType.REMOTE) {
        showError(getRBACErrorMessage(error as RBACError), undefined, 'template.update.template.error')
        return { status: 'FAILURE' }
      } else {
        throw error
      }
    }
  }

  const saveAndPublishTemplate = async (
    latestTemplate: NGTemplateInfoConfig,
    comments?: string,
    isEdit = false,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: { lastObjectId?: string },
    currStoreMetadata?: StoreMetadata
  ): Promise<UseSaveSuccessResponse> => {
    const isGitExperienceEnabled = isGitSyncEnabled && getScopeFromDTO(latestTemplate) === Scope.PROJECT
    if (storeMetadata) {
      currStoreMetadata = storeMetadata
    }

    if (!isGitExperienceEnabled && currStoreMetadata?.storeType !== StoreType.REMOTE) {
      setLoading?.(true)
    }

    if (isEdit) {
      return updateExistingLabel(latestTemplate, comments, updatedGitDetails, lastObject, currStoreMetadata)
    } else {
      try {
        const response = await createTemplatePromise({
          body: stringifyTemplate(omit(cloneDeep(latestTemplate), 'repo', 'branch')),
          queryParams: {
            accountIdentifier: accountId,
            projectIdentifier: latestTemplate.projectIdentifier,
            orgIdentifier: latestTemplate.orgIdentifier,
            comments,
            ...(updatedGitDetails ?? {}),
            ...(updatedGitDetails && updatedGitDetails.isNewBranch ? { baseBranch: branch } : {}),
            ...(currStoreMetadata?.storeType === StoreType.REMOTE ? currStoreMetadata : {})
          },
          requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
        })
        if (!isGitExperienceEnabled && currStoreMetadata?.storeType !== StoreType.REMOTE) {
          setLoading?.(false)
        }
        if (response && response.status === 'SUCCESS') {
          if (fireSuccessEvent && response.data?.templateResponseDTO) {
            window.dispatchEvent(new CustomEvent('TEMPLATE_SAVED', { detail: response.data.templateResponseDTO }))
          }
          if (!isGitExperienceEnabled && currStoreMetadata?.storeType !== StoreType.REMOTE) {
            clear()
            showSuccess(getString('common.template.saveTemplate.publishTemplate'))
          }
          await deleteTemplateCache?.()
          if (!isPipelineStudio) {
            navigateToLocation(latestTemplate, updatedGitDetails)
          }
          return { status: response.status }
        } else {
          throw response
        }
      } catch (error) {
        clear()
        if (!isGitExperienceEnabled && currStoreMetadata?.storeType !== StoreType.REMOTE) {
          showError(getRBACErrorMessage(error as RBACError), undefined, 'template.save.template.error')
          return { status: 'FAILURE' }
        } else {
          throw error
        }
      }
    }
  }

  const saveAndPublishWithGitInfo = async (
    updatedGitDetails: SaveToGitFormInterface,
    payload?: SaveTemplateObj,
    objectId?: string,
    isEdit = false,
    currStoreMetadata?: StoreMetadata
  ): Promise<UseSaveSuccessResponse> => {
    let latestTemplate = payload?.template as NGTemplateInfoConfig

    if (isYaml && yamlHandler) {
      try {
        latestTemplate = payload?.template || (parse(yamlHandler.getLatestYaml()).pipeline as NGTemplateInfoConfig)
      } /* istanbul ignore next */ catch (err) {
        showError(getRBACErrorMessage(err as RBACError), undefined, 'template.save.gitinfo.error')
      }
    }

    const response = await saveAndPublishTemplate(
      latestTemplate,
      '',
      isEdit,
      omit(updatedGitDetails, 'name', 'identifier'),
      templateIdentifier !== DefaultNewTemplateId ? { lastObjectId: objectId } : {},
      currStoreMetadata
    )
    return {
      status: response?.status
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveTemplateObj>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SaveTemplateObj,
      objectId?: string,
      isEdit = false,
      currStoreMetadata?: StoreMetadata
    ): Promise<UseSaveSuccessResponse> =>
      saveAndPublishWithGitInfo(gitData, payload, defaultTo(objectId, ''), isEdit, currStoreMetadata)
  })

  const getUpdatedGitDetails = (
    currGitDetails: EntityGitDetails,
    latestTemplate: NGTemplateInfoConfig,
    isEdit: boolean | undefined = false
  ): EntityGitDetails => ({
    ...currGitDetails,
    ...(!isEdit && {
      filePath: `${defaultTo(latestTemplate.identifier, '')}_${defaultTo(latestTemplate.versionLabel, '').replace(
        /[^a-zA-Z0-9-_]/g,
        ''
      )}.yaml`
    })
  })

  const saveAndPublish = React.useCallback(
    async (updatedTemplate: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs): Promise<UseSaveSuccessResponse> => {
      let currStoreMetadata = storeMetadata
      if (!currStoreMetadata) {
        currStoreMetadata = extraInfo?.storeMetadata
      }

      const { isEdit, comment, updatedGitDetails } = extraInfo

      // if Git sync enabled then display modal
      if (isGitSyncEnabled || currStoreMetadata?.storeType === StoreType.REMOTE) {
        if (
          (currStoreMetadata?.storeType !== StoreType.REMOTE && isEmpty(gitDetails?.repoIdentifier)) ||
          isEmpty(gitDetails?.branch)
        ) {
          clear()
          showError(getString('pipeline.gitExperience.selectRepoBranch'))
          return Promise.reject(getString('pipeline.gitExperience.selectRepoBranch'))
        } else if (updatedGitDetails) {
          openSaveToGitDialog({
            isEditing: defaultTo(isEdit, false),
            resource: {
              type: 'Template',
              name: updatedTemplate.name,
              identifier: updatedTemplate.identifier,
              gitDetails: getUpdatedGitDetails(updatedGitDetails, updatedTemplate, isEdit),
              storeMetadata: currStoreMetadata
            },
            payload: { template: omit(updatedTemplate, 'repo', 'branch') }
          })
          return Promise.resolve({ status: 'SUCCESS' })
        }
      } else {
        return saveAndPublishTemplate(updatedTemplate, comment, isEdit)
      }
    },
    [
      storeMetadata,
      isGitSyncEnabled,
      gitDetails?.repoIdentifier,
      gitDetails?.branch,
      clear,
      showError,
      getString,
      openSaveToGitDialog,
      saveAndPublishTemplate
    ]
  )

  return {
    saveAndPublish
  }
}
