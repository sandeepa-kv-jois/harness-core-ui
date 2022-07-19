/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as yup from 'yup'
import {
  Button,
  ButtonVariation,
  Container,
  FlexExpander,
  FormikForm,
  FormInput,
  Layout,
  SimpleTagInput,
  Text
} from '@harness/uicore'
import { Formik, FieldArray, FormikProps } from 'formik'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { Dialog, Radio, RadioGroup, Spinner } from '@blueprintjs/core'
import type { StringKeys } from 'framework/strings'
import { String, useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { Target } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import uploadImageUrl from './upload.svg'
import css from './TargetsPage.module.scss'

export type TargetData = Pick<Target, 'name' | 'identifier'>

const emptyTarget = (): TargetData => ({ name: '', identifier: '' })

interface TargetListProps {
  formikProps: FormikProps<any>
  onChange: (idx: number, newData: TargetData) => void
  targets: TargetData[]
}

const TargetList: React.FC<TargetListProps> = ({ onChange, formikProps }) => {
  const {
    values: { targets }
  } = formikProps || {}
  const { getString } = useStrings()
  const handleChange = (idx: number, attr: keyof TargetData) => (e: any) => {
    onChange(idx, { ...targets[idx], [attr]: e.target.value })
  }
  const fieldWidth = 285
  return (
    <Layout.Vertical spacing="xsmall" margin={{ top: 'small', bottom: 'medium' }} style={{ paddingLeft: '28px' }}>
      <Layout.Horizontal spacing="small">
        <Text style={{ color: '#22222A', fontWeight: 500 }} width={fieldWidth}>
          {getString('name')}
        </Text>
        <Text style={{ color: '#22222A', fontWeight: 500 }} width={fieldWidth}>
          {getString('identifier')}
        </Text>
        <FlexExpander />
      </Layout.Horizontal>
      <FieldArray
        name="targets"
        render={arrayHelpers => (
          <>
            {targets.map((_: TargetData, idx: number) => {
              const lastItem = idx === targets.length - 1
              return (
                <Layout.Horizontal key={idx + '-target-row'} spacing="small">
                  <FormInput.Text
                    placeholder={getString('cf.targets.enterName')}
                    onChange={handleChange(idx, 'name')}
                    style={{ width: `${fieldWidth}px` }}
                    name={`targets.${idx}.name`}
                  />
                  <FormInput.Text
                    placeholder={getString('cf.targets.enterValue')}
                    onChange={handleChange(idx, 'identifier')}
                    style={{ width: `${fieldWidth}px` }}
                    name={`targets.${idx}.identifier`}
                  />

                  {lastItem && idx !== 0 && (
                    <Button
                      minimal
                      intent="primary"
                      icon={'minus'}
                      iconProps={{
                        size: 16,
                        style: { alignSelf: 'center' }
                      }}
                      onClick={() => {
                        arrayHelpers.remove(idx)
                      }}
                    />
                  )}
                  <Button
                    minimal
                    intent="primary"
                    icon={lastItem ? 'plus' : 'minus'}
                    iconProps={{
                      size: 16,
                      style: { alignSelf: 'center' }
                    }}
                    onClick={lastItem ? () => arrayHelpers.push(emptyTarget()) : () => arrayHelpers.remove(idx)}
                    style={{ transform: `translateX(${lastItem && idx ? -10 : 0}px)` }}
                  />
                </Layout.Horizontal>
              )
            })}
          </>
        )}
      />
    </Layout.Vertical>
  )
}

const FileUpload: React.FC<{
  onChange: (file?: File) => void
}> = ({ onChange }) => {
  const { getString } = useStrings()
  const uploadContainerHeight = 260
  const [targets, setTargets] = useState<TargetData[]>([])
  const [tagItems, setTagItems] = useState<{ label: string; value: string }[]>([])
  const handleRemove = (): void => {
    setTargets([])
    onChange(undefined)
    setTagItems([])
  }
  const handleUpload = (file: File): void => {
    file
      .text()
      .then((str: string) => {
        return str
          .split(/\r?\n/)
          .filter(value => !!value?.length)
          .map(row => row.split(',').map(x => x.trim()))
          .map(([name, identifier]) => ({ name, identifier } as TargetData))
      })
      .then((targetData: TargetData[]) => {
        return filterTargets(targetData)
      })
      .then((targetData: TargetData[]) => {
        setTagItems(
          targetData.map(
            ({ name, identifier }) => ({ label: identifier, value: name } as { label: string; value: string })
          )
        )
        setTargets(targetData)
        onChange(file)
      })
  }
  const handleChange = (e: any) => {
    handleUpload(e.target.files[0])
  }

  return (
    <>
      {!targets?.length ? (
        <>
          <label htmlFor="bulk" className={css.upload}>
            <Layout.Vertical
              flex={{ align: 'center-center' }}
              height={uploadContainerHeight}
              style={{ border: '1px solid #D9DAE6', borderRadius: '4px', background: '#FAFBFC', margin: '0 28px' }}
            >
              <img src={uploadImageUrl} width={100} height={100} alt="upload" />
              <Text padding={{ top: 'large' }} color={Color.BLUE_500} style={{ fontSize: '14px' }}>
                {getString('cf.targets.uploadYourFile')}
              </Text>
            </Layout.Vertical>
          </label>
          <input type="file" id="bulk" name="bulk-upload" style={{ display: 'none' }} onChange={handleChange} />
        </>
      ) : (
        <Container>
          <Layout.Horizontal
            margin={{ right: 'xxlarge', bottom: 'small', left: 'xlarge' }}
            style={{ alignItems: 'center' }}
          >
            <Text>
              <String useRichText stringID="cf.targets.uploadStats" vars={{ count: targets.length }} />
            </Text>
            <FlexExpander />
            <Button intent="primary" text={getString('filters.clearAll')} onClick={handleRemove} minimal />
          </Layout.Horizontal>
          <Container
            style={{
              border: '1px solid #D9DAE6',
              borderRadius: '4px',
              margin: '0 28px',
              overflow: 'auto'
            }}
            height={220}
            padding="xsmall"
            className={css.uploadTargetContainer}
          >
            <SimpleTagInput readonly noInputBorder selectedItems={tagItems} items={tagItems} />
          </Container>
        </Container>
      )}
    </>
  )
}

const filterTargets = (targets: TargetData[]): TargetData[] =>
  targets.filter(t => t.name?.length && t.identifier?.length)

export interface CreateTargetModalProps {
  existingTargets?: Target[]
  loading: boolean
  onSubmitTargets: (targets: TargetData[], hideModal: () => void) => void
  onSubmitTargetFile: (file: File, hideModal: () => void) => void
}

const CreateTargetModal: React.FC<CreateTargetModalProps> = ({
  loading,
  onSubmitTargets,
  onSubmitTargetFile,
  existingTargets
}) => {
  const LIST = 'list'
  const UPLOAD = 'upload'
  const [isList, setIsList] = useState(true)
  const [targets, setTargets] = useState<TargetData[]>([emptyTarget()])
  const [targetFile, setTargetFile] = useState<File>()
  const addDisabled = filterTargets(targets).length === 0 && !targetFile
  const { getString } = useStrings()
  const getPageString = (key: string): string =>
    getString(`cf.targets.${key}` as StringKeys /* TODO: fix this by using a map */)
  const { activeEnvironment } = useActiveEnvironment()

  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  const handleChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setIsList((e.target as HTMLInputElement).value === LIST)
    setTargets([emptyTarget()])
    setTargetFile(undefined)
  }

  const handleTargetChange = (idx: number, newData: TargetData): void => {
    targets[idx] = newData
    setTargets([...targets])
  }

  const handleSubmit = (): void => {
    if (!isList && targetFile) {
      // submit target csv
      onSubmitTargetFile(targetFile, () => {
        hideModal()
        setTargetFile(undefined)
      })
    } else {
      // submit manually typed targets
      const filteredTargets = filterTargets(targets)
      if (filteredTargets.length) {
        onSubmitTargets(filteredTargets, () => {
          hideModal()
          setTargets([emptyTarget()])
          setTargetFile(undefined)
        })
      }
    }
  }

  const handleCancel = (): void => {
    setIsList(true)
    setTargets([emptyTarget()])
    setTargetFile(undefined)
    hideModal()
  }

  const initialValues = { targets: [{ name: '', identifier: '' }] }

  const duplicateIdCheck = (identifier: string): boolean => {
    if (existingTargets?.length && existingTargets?.some(target => target.identifier === identifier)) {
      return false
    }
    return true
  }

  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen
        enforceFocus={false}
        onClose={hideModal}
        title={getString('cf.targets.addTargetsLabel')}
        className={css.modal}
      >
        <Formik
          initialValues={initialValues}
          formName="addTargetDialog"
          validationSchema={yup.object().shape({
            targets: yup.array().of(
              yup.object().shape({
                name: yup.string().trim().required(getString('cf.targets.nameRequired')),
                identifier: yup
                  .string()
                  .trim()
                  .required(getString('cf.targets.idRequired'))
                  .test('Unique', getString('cf.targets.duplicateId'), identifier => {
                    return duplicateIdCheck(identifier)
                  })
              })
            )
          })}
          onSubmit={handleSubmit}
          onReset={handleCancel}
        >
          {formikProps => (
            <FormikForm data-testid="create-target-form">
              <Layout.Vertical padding="medium" height={450}>
                <Container style={{ flexGrow: 1, overflow: 'auto' }} padding={{ top: 'small' }}>
                  <RadioGroup name="modalVariant" selectedValue={isList ? LIST : UPLOAD} onChange={handleChange}>
                    <Radio name="modalVariant" label={getPageString('list')} value={LIST} />
                    {isList && <TargetList formikProps={formikProps} targets={targets} onChange={handleTargetChange} />}

                    <Radio name="modalVariant" label={getPageString('upload')} value={UPLOAD} />
                    {!isList && (
                      <Layout.Vertical spacing="small">
                        <Text
                          style={{
                            padding: 'var(--spacing-xsmall) var(--spacing-xsmall) var(--spacing-xsmall) 27px'
                          }}
                        >
                          <String useRichText stringID="cf.targets.uploadHeadline" />
                          <Text
                            rightIcon="question"
                            inline
                            tooltip={getString('cf.targets.uploadHelp')}
                            style={{ transform: 'translateY(2px)', cursor: 'pointer' }}
                          />
                        </Text>
                        <FileUpload onChange={file => setTargetFile(file)} />
                      </Layout.Vertical>
                    )}
                  </RadioGroup>
                </Container>
                <Layout.Horizontal height={34} spacing="small">
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    disabled={addDisabled || loading}
                    text={getString('add')}
                    intent="primary"
                    type="submit"
                  />
                  <Button
                    variation={ButtonVariation.TERTIARY}
                    disabled={loading}
                    text={getString('cancel')}
                    minimal
                    type="reset"
                  />
                  {loading && <Spinner size={16} />}
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          )}
        </Formik>
      </Dialog>
    )
  }, [isList, targets, loading, addDisabled])

  return (
    <RbacButton
      icon="plus"
      intent="primary"
      variation={ButtonVariation.PRIMARY}
      text={getString('cf.targets.create')}
      onClick={openModal}
      permission={{
        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
        permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
      }}
      {...planEnforcementProps}
    />
  )
}

export default CreateTargetModal
