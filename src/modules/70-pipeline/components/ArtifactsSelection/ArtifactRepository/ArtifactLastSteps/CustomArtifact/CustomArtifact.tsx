/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import { FieldArray, Form, FormikProps } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { cloneDeep, merge, set } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type {
  ArtifactType,
  ImagePathProps,
  CustomArtifactSource,
  ImagePathTypes,
  variableInterface
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getCustomArtifactFormData } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import SideCarArtifactIdentifier from '../SideCarArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const shellScriptType: SelectOption[] = [
  { label: 'Bash', value: 'Bash' },
  { label: 'PowerShell', value: 'PowerShell' }
]

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

function FormContent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  isReadonly = false,
  formik
}: any): React.ReactElement {
  const { getString } = useStrings()
  const scriptType: ScriptType = formik.values?.spec?.shell || 'Bash'
  return (
    <Form>
      <div className={css.connectorForm}>
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.customArtifactContainer}>
          <FormInput.Select
            name="spec.scripts.fetchAllArtifacts.spec.shell"
            label={getString('scriptType')}
            items={shellScriptType}
            disabled
          />
        </div>
        <div className={css.customArtifactContainer}>
          <FormMultiTypeDurationField
            name="spec.scripts.fetchAllArtifacts.spec.source.spec.timeout"
            label={getString('pipelineSteps.timeoutLabel')}
            disabled={isReadonly}
            multiTypeDurationProps={{
              expressions,
              enableConfigureOptions: false,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.scripts?.fetchAllArtifacts?.spec?.source?.timeout) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values?.spec?.scripts?.fetchAllArtifacts?.spec?.source?.timeout || ''}
              type="String"
              variableName="timeout"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.scripts.fetchAllArtifacts.spec.source.timeout', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={cx(stepCss.formGroup)}>
          <MultiTypeFieldSelector
            name="spec.scripts.fetchAllArtifacts.spec.source.spec.script"
            label={getString('script')}
            defaultValueToReset=""
            disabled={isReadonly}
            allowedTypes={allowableTypes}
            disableTypeSelection={isReadonly}
            skipRenderValueInExpressionLabel
            expressionRender={() => {
              return (
                <ShellScriptMonacoField
                  name="spec.scripts.fetchAllArtifacts.spec.source.spec.script"
                  scriptType={scriptType}
                  disabled={isReadonly}
                  expressions={expressions}
                />
              )
            }}
          >
            <ShellScriptMonacoField
              name="spec.scripts.fetchAllArtifacts.spec.source.spec.script"
              scriptType={scriptType}
              disabled={isReadonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
          {getMultiTypeFromValue(formik.values?.spec?.scripts?.fetchAllArtifacts?.spec?.source?.spec?.script) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik?.values?.spec.source?.spec?.script as string}
              type="String"
              variableName="spec.scripts.fetchAllArtifacts.spec.source.spec.script"
              // className={css.minConfigBtn}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.scripts.fetchAllArtifacts.spec.source.spec.script', value)}
              isReadonly
            />
          )}
        </div>

        <div className={css.customArtifactContainer}>
          <FormInput.MultiTextInput
            name="spec.scripts.fetchAllArtifacts.artifactsArrayPath"
            label={getString('pipeline.artifactsSelection.artifactsArrayPath')}
            placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.scripts?.fetchAllArtifacts?.artifactsArrayPath) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values?.spec?.scripts?.fetchAllArtifacts?.artifactsArrayPath || ''}
              type="String"
              variableName="artifactsArrayPath"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.scripts.fetchAllArtifacts.artifactsArrayPath', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>

        <div className={css.customArtifactContainer}>
          <FormInput.MultiTextInput
            name="spec.scripts.fetchAllArtifacts.versionPath"
            label={getString('pipeline.artifactsSelection.versionPath')}
            placeholder={getString('pipeline.artifactsSelection.versionPathPlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.scripts?.fetchAllArtifacts?.versionPath) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values?.spec?.scripts?.fetchAllArtifacts?.versionPath || ''}
              type="String"
              variableName="versionPath"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.scripts.fetchAllArtifacts.versionPath', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>

        <div className={css.customArtifactContainer}>
          <FormInput.MultiTextInput
            label={getString('version')}
            name="spec.version"
            placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />

          {getMultiTypeFromValue(formik.values.spec.version) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                style={{ alignSelf: 'center' }}
                value={formik.values?.spec?.version as string}
                type={getString('string')}
                variableName="version"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('spec.version', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      </div>
      <Layout.Horizontal spacing="medium">
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
          icon="chevron-left"
          onClick={() => previousStep?.(prevStepData)}
        />
        <Button variation={ButtonVariation.PRIMARY} type="submit" text={getString('next')} rightIcon="chevron-right" />
      </Layout.Horizontal>
    </Form>
  )
}

export function CustomArtifact(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<ImagePathTypes>
): React.ReactElement {
  const { context, initialValues, artifactIdentifiers, selectedArtifact, nextStep } = props
  const { getString } = useStrings()
  const schemaObject = {
    spec: Yup.object().shape({
      version: Yup.string().trim().required(getString('validation.nexusVersion'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })
  const getInitialValues = (): CustomArtifactSource => {
    return getCustomArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      context === ModalViewFor.SIDECAR
    ) as CustomArtifactSource
  }
  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={context === ModalViewFor.SIDECAR ? sidecarSchema : primarySchema}
        onSubmit={formData => {
          nextStep?.({ ...formData })
        }}
      >
        {formik => <FormContent {...props} formik={formik} />}
      </Formik>
    </Layout.Vertical>
  )
}

export function CustomArtifactOptionalConfiguration(
  props: StepProps<CustomArtifactSource> & ImagePathProps<ImagePathTypes>
): React.ReactElement {
  const { context, handleSubmit, prevStepData, initialValues, selectedArtifact } = props

  const { getString } = useStrings()

  const submitFormData = (formData: CustomArtifactSource): void => {
    const artifactObj: CustomArtifactSource = cloneDeep(prevStepData) || {}
    set(artifactObj, 'spec.input', formData?.spec?.inputs)
    set(
      artifactObj,
      'spec.scripts.fetchAllArtifacts.attributes',
      formData?.spec?.scripts?.fetchAllArtifacts?.attributes
    )
    if (context === ModalViewFor.SIDECAR) {
      merge(artifactObj, { identifier: formData?.identifier })
    }
    handleSubmit(artifactObj)
  }

  const getInitialValues = (): CustomArtifactSource => {
    return getCustomArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      context === ModalViewFor.SIDECAR
    ) as CustomArtifactSource
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.optionalConfiguration')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="optionalConfiguration"
        onSubmit={formData => {
          submitFormData?.({ ...formData })
        }}
      >
        {formik => <OptionalConfigurationFormContent {...props} formik={formik} />}
      </Formik>
    </Layout.Vertical>
  )
}

function OptionalConfigurationFormContent(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<ImagePathTypes> & { formik: FormikProps<CustomArtifactSource> }
): React.ReactElement {
  const { formik, allowableTypes, isReadonly, expressions, previousStep, prevStepData } = props

  const { getString } = useStrings()

  return (
    <Form>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.inputs"
          label={getString('pipeline.scriptInputVariables')}
          isOptional
          allowedTypes={allowableTypes}
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[]}
          disableTypeSelection={true}
        >
          <FieldArray
            name="spec.inputs"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.variables}>
                    <span className={css.label}>Name</span>
                    <span className={css.label}>Type</span>
                    <span className={css.label}>Value</span>
                  </div>
                  {formik.values?.spec?.inputs?.map(({ id }: variableInterface, i: number) => {
                    return (
                      <div className={css.variables} key={id}>
                        <FormInput.Text
                          name={`spec.inputs.[${i}].name`}
                          placeholder={getString('name')}
                          disabled={isReadonly}
                        />
                        <FormInput.Select
                          items={scriptInputType}
                          name={`spec.inputs.[${i}].type`}
                          placeholder={getString('typeLabel')}
                          disabled={isReadonly}
                        />
                        <FormInput.MultiTextInput
                          name={`spec.inputs.[${i}].value`}
                          placeholder={getString('valueLabel')}
                          multiTextInputProps={{
                            allowableTypes,
                            expressions,
                            disabled: isReadonly
                          }}
                          label=""
                          disabled={isReadonly}
                        />
                        <Button
                          variation={ButtonVariation.ICON}
                          icon="main-trash"
                          data-testid={`remove-environmentVar-${i}`}
                          onClick={() => remove(i)}
                          disabled={isReadonly}
                        />
                      </div>
                    )
                  })}
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-environmentVar"
                    disabled={isReadonly}
                    onClick={() => push({ name: '', type: 'String', value: '' })}
                    // className={css.addButton}
                  >
                    {getString('addInputVar')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </div>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.scripts.fetchAllArtifacts.attributes"
          label={getString('common.additionalAttributes')}
          isOptional
          allowedTypes={allowableTypes}
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[]}
          disableTypeSelection={true}
        >
          <FieldArray
            name="spec.scripts.fetchAllArtifacts.attributes"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.variables}>
                    <span className={css.label}>Name</span>
                    <span className={css.label}>Type</span>
                    <span className={css.label}>Value</span>
                  </div>
                  {formik.values?.spec?.scripts?.fetchAllArtifacts?.attributes?.map(
                    ({ id }: variableInterface, i: number) => {
                      return (
                        <div className={css.variables} key={id}>
                          <FormInput.Text
                            name={`spec.scripts.fetchAllArtifacts.attributes.[${i}].name`}
                            placeholder={getString('name')}
                            disabled={isReadonly}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`spec.scripts.fetchAllArtifacts.attributes.[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={isReadonly}
                          />
                          <FormInput.MultiTextInput
                            name={`spec.scripts.fetchAllArtifacts.attributes.[${i}].value`}
                            placeholder={getString('valueLabel')}
                            multiTextInputProps={{
                              allowableTypes,
                              expressions,
                              disabled: isReadonly
                            }}
                            label=""
                            disabled={isReadonly}
                          />
                          <Button
                            variation={ButtonVariation.ICON}
                            icon="main-trash"
                            data-testid={`remove-environmentVar-${i}`}
                            onClick={() => remove(i)}
                            disabled={isReadonly}
                          />
                        </div>
                      )
                    }
                  )}
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-environmentVar"
                    disabled={isReadonly}
                    onClick={() => push({ name: '', type: 'String', value: '' })}
                    // className={css.addButton}
                  >
                    {getString('common.addAttribute')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </div>
      <Layout.Horizontal spacing="medium">
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
          icon="chevron-left"
          onClick={() => previousStep?.(prevStepData)}
        />
        <Button
          variation={ButtonVariation.PRIMARY}
          type="submit"
          text={getString('submit')}
          rightIcon="chevron-right"
        />
      </Layout.Horizontal>
    </Form>
  )
}
