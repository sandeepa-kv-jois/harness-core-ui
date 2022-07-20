/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  SelectOption,
  Text,
  useConfirmationDialog,
  VisualYamlSelectedView as SelectedView
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { isEmpty, isNil } from 'lodash-es'
import { Dialog } from '@blueprintjs/core'
import {
  Fields,
  ModalProps,
  PromiseExtraArgs,
  TemplateConfigModal,
  Intent
} from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { TagsPopover, useToaster } from '@common/components'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type {
  GitQueryParams,
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import routes from '@common/RouteDefinitions'
import { NGTemplateInfoConfig, useUpdateStableTemplate } from 'services/template-ng'
import { useStrings } from 'framework/strings'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import StudioGitPopover from '@pipeline/components/PipelineStudio/StudioGitPopover'
import { VersionsDropDown } from '@templates-library/components/VersionsDropDown/VersionsDropDown'
import css from './TemplateStudioSubHeaderLeftView.module.scss'

export interface TemplateStudioSubHeaderLeftViewProps {
  onGitBranchChange?: (selectedFilter: GitFilterScope) => void
}

export const TemplateStudioSubHeaderLeftView: (props: TemplateStudioSubHeaderLeftViewProps) => JSX.Element = ({
  onGitBranchChange
}) => {
  const { state, updateTemplate, deleteTemplateCache, fetchTemplate, view, isReadonly, setLoading, updateGitDetails } =
    React.useContext(TemplateContext)
  const { template, versions, stableVersion, isUpdated, gitDetails } = state
  const { accountId, projectIdentifier, orgIdentifier, module, templateType, templateIdentifier } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { updateQueryParams } = useUpdateQueryParams<TemplateStudioQueryParams>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const iconColor = templateFactory.getTemplateColor(templateType) || Color.BLACK
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const isYaml = view === SelectedView.YAML
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()

  const { mutate: updateStableTemplate, loading: updateStableTemplateLoading } = useUpdateStableTemplate({
    templateIdentifier: template.identifier,
    versionLabel: template.versionLabel,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch
    },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  const navigateToTemplatesListPage = React.useCallback(() => {
    history.push(routes.toTemplates({ orgIdentifier, projectIdentifier, accountId, module }))
  }, [history, routes.toTemplates, orgIdentifier, projectIdentifier, accountId, module])

  const [showConfigModal, hideConfigModal] = useModalHook(() => {
    const onCloseCreate = () => {
      if (template.identifier === DefaultNewTemplateId) {
        navigateToTemplatesListPage()
      }
      hideConfigModal()
    }

    return (
      <Dialog enforceFocus={false} isOpen={true} className={css.createTemplateDialog}>
        {modalProps && <TemplateConfigModal {...modalProps} onClose={onCloseCreate} />}
      </Dialog>
    )
  }, [template.identifier, navigateToTemplatesListPage, modalProps])

  const onSubmit = React.useCallback(
    async (data: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs): Promise<UseSaveSuccessResponse> => {
      const { updatedGitDetails } = extraInfo
      template.name = data.name
      template.description = data.description
      template.identifier = data.identifier
      template.tags = data.tags ?? {}
      template.versionLabel = data.versionLabel
      template.orgIdentifier = data.orgIdentifier
      template.projectIdentifier = data.projectIdentifier

      try {
        await updateTemplate(template)
        updateGitDetails(isEmpty(updatedGitDetails) ? {} : { ...gitDetails, ...updatedGitDetails }).then(() => {
          updateQueryParams(
            { repoIdentifier: updatedGitDetails?.repoIdentifier, branch: updatedGitDetails?.branch },
            { skipNulls: true }
          )
        })
        return { status: 'SUCCESS' }
      } catch (error) {
        return { status: 'ERROR' }
      }
    },
    [template, gitDetails]
  )

  const goToTemplateVersion = async (versionLabel: string): Promise<void> => {
    if (versionLabel !== DefaultNewVersionLabel && versionLabel !== template.versionLabel) {
      await deleteTemplateCache()
      history.replace(
        routes.toTemplateStudio({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType: template.type,
          templateIdentifier: template.identifier,
          versionLabel: versionLabel,
          repoIdentifier,
          branch
        })
      )
    }
  }

  const { openDialog: openConfirmationDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('templatesLibrary.setAsStableText', { version: template.versionLabel }),
    titleText: getString('templatesLibrary.setAsStableTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        updateStableLabel()
      }
    }
  })

  const updateStableLabel = async () => {
    try {
      await updateStableTemplate()
      showSuccess(getString('common.template.updateTemplate.templateUpdated'))
      await fetchTemplate({ forceFetch: true, forceUpdate: true })
    } catch (error) {
      showError(
        getRBACErrorMessage(error) || getString('common.template.updateTemplate.errorWhileUpdating'),
        undefined,
        'template.save.template.error'
      )
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (updateStableTemplateLoading) {
      setLoading(true)
    }
  }, [updateStableTemplateLoading])

  React.useEffect(() => {
    const newVersionOption: SelectOption[] = versions.map(item => {
      return {
        label: item === stableVersion ? item + ' (Stable)' : item,
        value: item
      }
    })
    newVersionOption.sort((a, b) => a.label.localeCompare(b.label))
    setVersionOptions(newVersionOption)
  }, [versions])

  React.useEffect(() => {
    if (template.identifier === DefaultNewTemplateId && !isEmpty(template.type)) {
      hideConfigModal()
      setModalProps({
        initialValues: template,
        promise: onSubmit,
        title: getString('templatesLibrary.createNewModal.heading', { entity: template.type }),
        intent: Intent.START,
        allowScopeChange: true
      })
      showConfigModal()
    }
  }, [template.identifier, showConfigModal, template.type, onSubmit])

  return (
    <Container className={css.subHeaderLeftView}>
      <Layout.Horizontal spacing={'medium'} padding={{ right: 'medium' }} flex={{ alignItems: 'center' }}>
        <Container>
          <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
            <Icon color={iconColor} name="template-library" size={20} />
            <Text
              className={css.templateName}
              color={Color.GREY_700}
              font={{ weight: 'bold' }}
              tooltip={template?.name}
            >
              {template.name}
            </Text>
            {!isNil(template?.tags) && !isEmpty(template?.tags) && <TagsPopover tags={template.tags} />}
            {isGitSyncEnabled && onGitBranchChange && (
              <StudioGitPopover
                gitDetails={gitDetails}
                identifier={templateIdentifier}
                isReadonly={isReadonly}
                entityData={template}
                onGitBranchChange={onGitBranchChange}
                entityType={getString('common.template.label')}
              />
            )}
            {!isYaml && !isReadonly && (
              <RbacButton
                variation={ButtonVariation.ICON}
                icon="Edit"
                iconProps={{
                  color: Color.GREY_800
                }}
                withoutCurrentColor
                onClick={() => {
                  setModalProps({
                    initialValues: template,
                    promise: onSubmit,
                    ...(templateIdentifier !== DefaultNewTemplateId && { gitDetails }),
                    title: getString('templatesLibrary.createNewModal.editHeading', { entity: template.type }),
                    intent: Intent.EDIT,
                    disabledFields:
                      templateIdentifier === DefaultNewTemplateId ? [] : [Fields.VersionLabel, Fields.Identifier],
                    allowScopeChange: templateIdentifier === DefaultNewTemplateId
                  })
                  showConfigModal()
                }}
                permission={{
                  permission: PermissionIdentifier.EDIT_TEMPLATE,
                  resource: {
                    resourceType: ResourceType.TEMPLATE
                  }
                }}
              />
            )}
          </Layout.Horizontal>
        </Container>
        {templateIdentifier !== DefaultNewTemplateId && (
          <VersionsDropDown
            onChange={item => goToTemplateVersion(item.value.toString())}
            items={versionOptions}
            value={template.versionLabel}
            className={css.versionDropDown}
            stableVersion={stableVersion}
            popoverClassName={css.dropdown}
          />
        )}
        {template.versionLabel !== stableVersion && !isUpdated && !isReadonly && (
          <Button
            onClick={openConfirmationDialog}
            variation={ButtonVariation.LINK}
            size={ButtonSize.SMALL}
            text={getString('common.setAsStable')}
          />
        )}
      </Layout.Horizontal>
    </Container>
  )
}
