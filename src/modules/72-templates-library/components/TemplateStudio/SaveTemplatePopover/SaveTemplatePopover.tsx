import React from 'react'
import { Dialog } from '@blueprintjs/core'
import { Button, ButtonVariation, useModalHook } from '@wings-software/uicore'
import { defaultTo, get, isEmpty, merge, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikErrors } from 'formik'
import { useStrings } from 'framework/strings'
import type { ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateCommentModal } from '@templates-library/components/TemplateStudio/TemplateCommentModal/TemplateCommentModal'
import { Fields, ModalProps, TemplateConfigModal } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import {
  TemplateMenuItem,
  TemplatesActionPopover
} from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { Failure } from 'services/template-ng'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import css from './SaveTemplatePopover.module.scss'
export interface GetErrorResponse extends Omit<Failure, 'errors'> {
  errors?: FormikErrors<unknown>
}
export interface SaveTemplatePopoverProps {
  getErrors?: () => Promise<GetErrorResponse>
}

export function SaveTemplatePopover(props: SaveTemplatePopoverProps): React.ReactElement {
  const {
    state: { template, yamlHandler, gitDetails, isUpdated },
    setLoading,
    fetchTemplate,
    deleteTemplateCache,
    view
  } = React.useContext(TemplateContext)
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const { getString } = useStrings()
  const { getErrors } = props
  const { templateIdentifier } = useParams<TemplateStudioPathProps & ModulePathParams>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [saveOptions, setSaveOptions] = React.useState<TemplateMenuItem[]>([])
  const [disabled, setDisabled] = React.useState<boolean>(false)

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && (
          <TemplateConfigModal
            initialValues={merge(template, {
              repo: defaultTo(gitDetails.repoIdentifier, ''),
              branch: defaultTo(gitDetails.branch, '')
            })}
            onClose={hideConfigModal}
            modalProps={modalProps}
          />
        )}
      </Dialog>
    ),
    [template, modalProps]
  )

  const [showCommentsModal, hideCommentsModal] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen={true} className={css.commentsDialog}>
        <TemplateCommentModal
          title={getString('templatesLibrary.updateTemplateModal.heading', {
            name: template.name,
            version: template.versionLabel
          })}
          onClose={hideCommentsModal}
          onSubmit={comments => {
            hideCommentsModal()
            setLoading(true)
            updateExistingLabel(comments)
          }}
        />
      </Dialog>
    )
  }, [template])

  const { saveAndPublish, updateExistingLabel } = useSaveTemplate(
    {
      template,
      yamlHandler,
      gitDetails,
      setLoading,
      fetchTemplate,
      deleteTemplateCache,
      view
    },
    hideConfigModal,
    hideCommentsModal
  )

  const checkErrors = React.useCallback(
    (callback: () => void) => {
      getErrors?.().then(response => {
        if (response.status === 'SUCCESS' && isEmpty(response.errors)) {
          callback()
        }
      })
    },
    [getErrors]
  )

  const onSave = React.useCallback(() => {
    checkErrors(() => {
      saveAndPublish(template, { isEdit: false })
    })
  }, [checkErrors, saveAndPublish, template])

  const onUpdate = React.useCallback(() => {
    checkErrors(() => {
      if (isGitSyncEnabled) {
        saveAndPublish(template, { isEdit: true })
      } else {
        showCommentsModal()
      }
    })
  }, [checkErrors, template, isGitSyncEnabled, saveAndPublish, showCommentsModal])

  const onSaveAsNewLabel = React.useCallback(() => {
    checkErrors(() => {
      setModalProps({
        title: getString('templatesLibrary.saveAsNewLabelModal.heading'),
        promise: saveAndPublish,
        disabledFields: [],
        emptyFields: [Fields.VersionLabel]
      })
      showConfigModal()
    })
  }, [checkErrors, setModalProps, saveAndPublish])

  const onSaveAsNewTemplate = React.useCallback(() => {
    checkErrors(() => {
      setModalProps({
        title: getString('common.template.saveAsNewTemplateHeading'),
        promise: saveAndPublish,
        emptyFields: [Fields.Name, Fields.Identifier, Fields.VersionLabel]
      })
      showConfigModal()
    })
  }, [checkErrors, setModalProps, saveAndPublish])

  React.useEffect(() => {
    setDisabled(saveOptions.filter(item => !item.disabled).length === 0)
  }, [saveOptions])

  React.useEffect(() => {
    setSaveOptions(
      templateIdentifier === DefaultNewTemplateId
        ? [
            {
              label: getString('save'),
              disabled: isEmpty(get(template.spec, 'type')),
              onClick: onSave
            }
          ]
        : [
            {
              label: getString('save'),
              disabled: !isUpdated,
              onClick: onUpdate
            },
            {
              label: getString('templatesLibrary.saveAsNewLabelModal.heading'),
              onClick: onSaveAsNewLabel
            },
            {
              label: getString('common.template.saveAsNewTemplateHeading'),
              onClick: onSaveAsNewTemplate
            }
          ]
    )
  }, [templateIdentifier, template.spec, onSave, onUpdate, onSaveAsNewLabel, onSaveAsNewTemplate])

  React.useEffect(() => {
    setMenuOpen(false)
  }, [isUpdated])

  return (
    <TemplatesActionPopover
      open={menuOpen && saveOptions.length > 1}
      disabled={disabled}
      items={saveOptions}
      setMenuOpen={setMenuOpen}
      minimal={true}
    >
      <Button
        disabled={disabled}
        variation={ButtonVariation.PRIMARY}
        rightIcon={saveOptions.length > 1 ? 'chevron-down' : undefined}
        text={getString('save')}
        onClick={saveOptions.length === 1 ? () => saveOptions[0].onClick() : noop}
        icon="send-data"
      />
    </TemplatesActionPopover>
  )
}
