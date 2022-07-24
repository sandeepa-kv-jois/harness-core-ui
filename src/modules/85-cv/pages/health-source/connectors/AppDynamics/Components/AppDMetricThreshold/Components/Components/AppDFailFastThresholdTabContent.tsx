import React, { useContext } from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Container, FormInput, Layout, Text } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'
import { Color } from '@harness/design-system'
import { FieldArray, useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { AppDMetricThresholdContext } from '../../AppDMetricThreshold'
import {
  getActionItems,
  getDefaultMetricTypeValue,
  getGroupDropdownOptions,
  getMetricItems,
  getMetricTypeItems
} from './Components/AppDThresholdSelectUtils'
import ThresholdSelect from './Components/ThresholdSelect'
import ThresholdCriteria from './Components/ThresholdCriteria'
import {
  FailFastActionValues,
  MetricTypesForTransactionTextField,
  MetricTypeValues,
  NewDefaultVauesForFailFastThreshold
} from '../../AppDMetricThresholdConstants'
import css from '../AppDMetricThresholdContent.module.scss'

export default function AppDFailFastThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { metricPacks, groupedCreatedMetrics } = useContext(AppDMetricThresholdContext)

  const handleMetricUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedFailFastThresholds = [...formValues.failFastThresholds]

    const updatedFailFastThresholds = { ...clonedFailFastThresholds[index] }

    updatedFailFastThresholds[FieldName.METRIC_THRESHOLD_METRIC_NAME] = null
    updatedFailFastThresholds[FieldName.METRIC_THRESHOLD_GROUP_NAME] = null
    updatedFailFastThresholds[FieldName.METRIC_THRESHOLD_METRIC_TYPE] = selectedValue

    clonedFailFastThresholds[index] = updatedFailFastThresholds

    replaceFn(updatedFailFastThresholds)
  }

  const handleTransactionUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedFailFastThresholds = [...formValues.failFastThresholds]

    const updatedFailFastThresholds = { ...clonedFailFastThresholds[index] }

    updatedFailFastThresholds[FieldName.METRIC_THRESHOLD_METRIC_NAME] = null
    updatedFailFastThresholds[FieldName.METRIC_THRESHOLD_GROUP_NAME] = selectedValue

    clonedFailFastThresholds[index] = updatedFailFastThresholds

    replaceFn(updatedFailFastThresholds)
  }

  const handleActionUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedFailFastThresholds = [...formValues.failFastThresholds]

    const updatedFailFastThresholds = { ...clonedFailFastThresholds[index] }

    updatedFailFastThresholds.spec.spec[FieldName.METRIC_THRESHOLD_COUNT] = undefined
    updatedFailFastThresholds.spec[FieldName.METRIC_THRESHOLD_ACTION] = selectedValue

    clonedFailFastThresholds[index] = updatedFailFastThresholds

    replaceFn(updatedFailFastThresholds)
  }

  const isGroupTransationTextField = (selectedMetricType: string | null): boolean =>
    MetricTypesForTransactionTextField.some(field => field === selectedMetricType)

  // TODO: Update the type from Swagger
  const handleAddThreshold = (addFn: (newValue: any) => void): void => {
    const clonedDefaultValue = cloneDeep(NewDefaultVauesForFailFastThreshold)
    const defaultValueForMetricType = getDefaultMetricTypeValue(formValues.metricData, metricPacks)
    const newIgnoreThresholdRow = { ...clonedDefaultValue, metricType: defaultValueForMetricType }
    addFn(newIgnoreThresholdRow)
  }

  return (
    <Container margin={{ top: 'large' }}>
      <Text color={Color.BLACK}>{getString('cv.monitoringSources.appD.failFastThresholdHint')}</Text>

      <Container>
        <FieldArray
          name="failFastThresholds"
          render={props => {
            return (
              <Container style={{ minHeight: 300 }}>
                <Container
                  className={cx(
                    css.appDMetricThresholdContentIgnoreTableHeader,
                    css.appDMetricThresholdContentFailFastTableHeader
                  )}
                >
                  <Text>{getString('cv.monitoringSources.appD.metricType')}</Text>
                  <Text>{getString('cv.monitoringSources.appD.groupTransaction')}</Text>
                  <Text>{getString('cv.monitoringSources.metricLabel')}</Text>
                  <Text>{getString('action')}</Text>
                  <Text>{getString('cv.monitoringSources.count')}</Text>
                  <Layout.Horizontal style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text className={css.criteriaHeader}>{getString('cf.segmentDetail.criteria')}</Text>
                    <Button
                      icon="plus"
                      variation={ButtonVariation.LINK}
                      onClick={() => handleAddThreshold(props.unshift)}
                      style={{ justifySelf: 'start' }}
                    >
                      {getString('cv.monitoringSources.appD.addThreshold')}
                    </Button>
                  </Layout.Horizontal>
                </Container>

                {props?.form?.values?.failFastThresholds?.map((data, index: number) => {
                  return (
                    <Container
                      key={index}
                      className={cx(
                        css.appDMetricThresholdContentIgnoreTableRow,
                        css.appDMetricThresholdContentFailFastTableRow
                      )}
                    >
                      {/* ==== ⭐️ Metric Type ==== */}
                      <ThresholdSelect
                        items={getMetricTypeItems(metricPacks, formValues.metricData, groupedCreatedMetrics)}
                        key={`${data?.metricType}`}
                        name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`}
                        onChange={({ value }) => {
                          handleMetricUpdate(index, value as string, props.replace.bind(null, index))
                        }}
                      />

                      {/* ==== ⭐️ Group ==== */}
                      {isGroupTransationTextField(data.metricType) ? (
                        <FormInput.Text
                          placeholder={getString('cv.monitoringSources.appD.groupTransaction')}
                          style={{ marginTop: 'medium' }}
                          name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_GROUP_NAME}`}
                          disabled={!data.metricType}
                        />
                      ) : (
                        <ThresholdSelect
                          items={getGroupDropdownOptions(groupedCreatedMetrics)}
                          name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_GROUP_NAME}`}
                          onChange={({ value }) => {
                            if (data.metricType === MetricTypeValues.Custom) {
                              handleTransactionUpdate(index, value as string, props.replace.bind(null, index))
                            }
                          }}
                          disabled={!data.metricType}
                        />
                      )}

                      {/* ==== ⭐️ Metric ==== */}
                      <ThresholdSelect
                        disabled={!data?.metricType}
                        items={getMetricItems(metricPacks, data.metricType, data.groupName, groupedCreatedMetrics)}
                        key={`${data?.metricType}-${data.groupName}`}
                        name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_NAME}`}
                      />

                      {/* ==== ⭐️ Action ==== */}

                      <ThresholdSelect
                        items={getActionItems(getString)}
                        name={`failFastThresholds.${index}.spec.${FieldName.METRIC_THRESHOLD_ACTION}`}
                        onChange={({ value }) => {
                          if (value === FailFastActionValues.FailImmediately) {
                            handleActionUpdate(index, value as string, props.replace.bind(null, index))
                          }
                        }}
                      />

                      {/* ==== ⭐️ Count ==== */}
                      <FormInput.Text
                        inline
                        disabled={data?.spec?.action === FailFastActionValues.FailImmediately}
                        placeholder={data.spec.action === FailFastActionValues.FailImmediately ? getString('na') : ''}
                        key={data?.spec?.action}
                        className={css.appDMetricThresholdContentInput}
                        inputGroup={{ type: 'number', min: 0 }}
                        name={`failFastThresholds.${index}.spec.spec.${FieldName.METRIC_THRESHOLD_COUNT}`}
                      />

                      {/* ==== ⭐️ Criteria ==== */}
                      <ThresholdCriteria
                        criteriaType={data?.criteria?.type}
                        thresholdTypeName="failFastThresholds"
                        criteriaPercentageType={data?.criteria?.criteriaPercentageType}
                        index={index}
                        replaceFn={props.replace.bind(null, index)}
                      />
                      <Button icon="trash" minimal iconProps={{ size: 14 }} onClick={() => props.remove(index)} />
                    </Container>
                  )
                })}
                <pre>
                  <code>{JSON.stringify(props?.form?.values?.failFastThresholds, null, 4)}</code>
                </pre>
              </Container>
            )
          }}
        />
      </Container>
    </Container>
  )
}
