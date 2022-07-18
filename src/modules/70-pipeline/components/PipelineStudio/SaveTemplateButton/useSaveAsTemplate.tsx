/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import produce from 'immer'
import { defaultTo, merge, omit } from 'lodash-es'
import { Dialog } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import classNames from 'classnames'
import { DefaultTemplate } from 'framework/Templates/templates'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import { Fields, ModalProps, TemplateConfigModal } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { ProjectPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { JsonNode } from 'services/cd-ng'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import type { SaveTemplateButtonProps } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { useStrings } from 'framework/strings'
import { StoreType } from '@common/constants/GitSyncTypes'
import css from './SaveAsTemplate.module.scss'

interface TemplateActionsReturnType {
  save: () => void
}

interface SaveAsTemplateProps extends Omit<SaveTemplateButtonProps, 'buttonProps'> {
  fireSuccessEvent?: boolean
}

export function useSaveAsTemplate({
  data,
  type,
  fireSuccessEvent = false
}: SaveAsTemplateProps): TemplateActionsReturnType {
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { connectorRef, repoName, repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [template, setTemplate] = React.useState<NGTemplateInfoConfig>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const { isGitSyncEnabled, isGitSimplificationEnabled } = React.useContext(AppStoreContext)

  const { getString } = useStrings()
  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        className={classNames(css.configDialog, {
          [css.gitConfigDialog]: isGitSimplificationEnabled
        })}
      >
        {modalProps && template && (
          <TemplateConfigModal
            initialValues={merge(template, {
              repo: defaultTo(repoIdentifier, ''),
              branch: defaultTo(branch, ''),
              ...(isGitSimplificationEnabled
                ? {
                    connectorRef: defaultTo(connectorRef, ''),
                    repo: defaultTo(repoName, ''),
                    branch: defaultTo(branch, ''),
                    storeType: StoreType.INLINE
                  }
                : {})
            })}
            onClose={hideConfigModal}
            modalProps={modalProps}
          />
        )}
      </Dialog>
    ),
    [template, modalProps, repoIdentifier, branch]
  )
  const { saveAndPublish } = useSaveTemplate({
    template: template as NGTemplateInfoConfig,
    gitDetails: { repoIdentifier, branch },
    isPipelineStudio: true,
    fireSuccessEvent
  })

  const onSaveAsTemplate = async () => {
    try {
      const finalData = typeof data === 'function' ? await data() : data
      setTemplate(
        produce(DefaultTemplate, draft => {
          draft.projectIdentifier = projectIdentifier
          draft.orgIdentifier = orgIdentifier
          draft.type = type
          draft.spec = omit(
            finalData,
            'name',
            'identifier',
            'description',
            'tags',
            'orgIdentifier',
            'projectIdentifier'
          ) as JsonNode
        })
      )
      setModalProps({
        title: getString('common.template.saveAsNewTemplateHeading'),
        promise: saveAndPublish,
        shouldGetComment: !isGitSyncEnabled,
        disabledFields: [Fields.ConnectorRef, Fields.RepoName, Fields.Branch]
      })
      showConfigModal()
    } catch (_error) {
      //Do not do anything as there are error in the form
    }
  }

  return { save: onSaveAsTemplate }
}
