import React from 'react'
import {
  IconName,
  Formik,
  Layout,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  MultiSelectOption
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { get, has, isEmpty } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'

import type { CountInstanceSelection, K8sScaleStepInfo, StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { FormInstanceDropdown, FormMultiTypeCheckboxField } from '@common/components'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import { getInstanceDropdownSchema } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface K8sScaleData extends StepElementConfig {
  spec: Omit<K8sScaleStepInfo, 'skipSteadyStateCheck'> & { skipSteadyStateCheck: boolean }
  identifier: string
}
export interface PercentageInstanceSelectionK8 {
  percentage: string | boolean | SelectOption | MultiSelectOption[] | undefined
}

export interface K8sScaleVariableStepProps {
  initialValues: K8sScaleData
  stageIdentifier: string
  onUpdate?(data: K8sScaleData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sScaleData
}

interface K8sScaleProps {
  initialValues: K8sScaleData
  onUpdate?: (data: K8sScaleData) => void
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: K8sScaleData
  readonly?: boolean
  path?: string
}

function K8ScaleDeployWidget(props: K8sScaleProps, formikRef: StepFormikFowardRef<K8sScaleData>): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, readonly } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<K8sScaleData>
        onSubmit={(values: K8sScaleData) => {
          onUpdate?.(values)
        }}
        formName="k8Scale"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            instanceSelection: getInstanceDropdownSchema({ required: true })
          }),
          identifier: IdentifierSchema()
        })}
      >
        {(formik: FormikProps<K8sScaleData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{ disabled: readonly }}
                  />
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInstanceDropdown
                    name={'spec.instanceSelection'}
                    label={getString('pipelineSteps.instanceLabel')}
                    readonly={readonly}
                    expressions={expressions}
                  />
                  {(getMultiTypeFromValue(
                    (values?.spec?.instanceSelection?.spec as CountInstanceSelection | undefined)?.count as any
                  ) === MultiTypeInputType.RUNTIME ||
                    getMultiTypeFromValue(
                      (values?.spec?.instanceSelection?.spec as PercentageInstanceSelectionK8 | undefined)?.percentage
                    ) === MultiTypeInputType.RUNTIME) && (
                    <ConfigureOptions
                      value={
                        ((values?.spec?.instanceSelection?.spec as CountInstanceSelection | undefined)
                          ?.count as string) ||
                        ((values?.spec?.instanceSelection?.spec as PercentageInstanceSelectionK8 | undefined)
                          ?.percentage as string)
                      }
                      type="String"
                      variableName={getString('instanceFieldOptions.instances')}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('instances', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
                </div>

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('pipelineSteps.workload')}
                    name={'spec.workload'}
                    isOptional={true}
                    disabled={readonly}
                    multiTextInputProps={{ expressions, disabled: readonly }}
                  />
                  {getMultiTypeFromValue(values.spec.workload) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.spec.workload as string}
                      type="String"
                      variableName={getString('pipelineSteps.workload')}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('spec.workload', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
                </div>

                <div className={cx(stepCss.formGroup, stepCss.sm)}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    className={stepCss.duration}
                    multiTypeDurationProps={{ expressions, enableConfigureOptions: false, disabled: readonly }}
                  />
                  {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={values.timeout as string}
                      type="String"
                      variableName="step.timeout"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        setFieldValue('timeout', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormMultiTypeCheckboxField
                    name="spec.skipSteadyStateCheck"
                    label={getString('pipelineSteps.skipSteadyStateCheck')}
                    multiTypeTextbox={{ expressions, disabled: readonly }}
                    disabled={readonly}
                  />
                </div>
              </Layout.Vertical>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8ScaleInputStep: React.FC<K8sScaleProps> = ({ template, readonly, path }) => {
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(template?.spec?.workload) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name="spec.workload"
            label={getString('pipelineSteps.workload')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
          />
        </div>
      ) : null}
      {(getMultiTypeFromValue(
        (template?.spec?.instanceSelection?.spec as CountInstanceSelection | undefined)?.count as any
      ) === MultiTypeInputType.RUNTIME ||
        getMultiTypeFromValue(
          (template?.spec?.instanceSelection?.spec as PercentageInstanceSelectionK8 | undefined)?.percentage
        ) === MultiTypeInputType.RUNTIME) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInstanceDropdown
            label={getString('pipelineSteps.instanceLabel')}
            name={`${prefix}spec.instanceSelection`}
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            disabledType
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.skipSteadyStateCheck) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${prefix}spec.skipSteadyStateCheck`}
          className={stepCss.checkbox}
          label={getString('pipelineSteps.skipSteadyStateCheck')}
          disabled={readonly}
        />
      )}
    </>
  )
}

const K8sScaleVariableStep: React.FC<K8sScaleVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const K8ScaleDeployWidgetWithRef = React.forwardRef(K8ScaleDeployWidget)
export class K8sScaleStep extends PipelineStep<K8sScaleData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<K8sScaleData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep, readonly } =
      props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8ScaleInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          readonly={inputSetData?.readonly}
          path={inputSetData?.path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sScaleVariableStep
          {...(customStepProps as K8sScaleVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <K8ScaleDeployWidgetWithRef
        initialValues={initialValues}
        isNewStep={isNewStep}
        onUpdate={values => onUpdate?.(this.processFormData(values))}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  protected type = StepType.K8sScale
  protected stepName = 'K8s Scale'

  protected stepIcon: IconName = 'swap-vertical'
  protected isHarnessSpecific = true

  processFormData(values: K8sScaleData): K8sScaleData {
    if (
      get(values, 'spec.instanceSelection.type') === InstanceTypes.Instances &&
      has(values, 'spec.instanceSelection.spec.percentage')
    ) {
      delete values.spec.instanceSelection.spec.percentage
    }

    if (
      get(values, 'spec.instanceSelection.type') === InstanceTypes.Percentage &&
      has(values, 'spec.instanceSelection.spec.count')
    ) {
      delete values.spec.instanceSelection.spec.count
    }

    return values
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8sScaleData>): FormikErrors<K8sScaleData> {
    const isRequired = viewType === StepViewType.DeploymentForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    if (
      getMultiTypeFromValue(
        (template?.spec?.instanceSelection?.spec as CountInstanceSelection | undefined)?.count as any
      ) === MultiTypeInputType.RUNTIME ||
      getMultiTypeFromValue(
        (template?.spec?.instanceSelection?.spec as PercentageInstanceSelectionK8 | undefined)?.percentage
      ) === MultiTypeInputType.RUNTIME
    ) {
      const instanceSelection = Yup.object().shape({
        instanceSelection: getInstanceDropdownSchema({
          required: isRequired,
          requiredErrorMessage: getString?.('fieldRequired', { field: 'Instance' })
        })
      })

      try {
        instanceSelection.validateSync(data.spec)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors.spec, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
  protected defaultValues: K8sScaleData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.K8sScale,
    spec: {
      workload: '',
      skipSteadyStateCheck: false,
      instanceSelection: { type: InstanceTypes.Instances, spec: { count: 1 } as any }
    }
  }
}
