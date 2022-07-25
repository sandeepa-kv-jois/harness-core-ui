import React, { useContext, useEffect } from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Container, FormInput, Layout, Text } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'
import { Color } from '@harness/design-system'
import { FieldArray, useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import ThresholdSelect from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdSelect'
import ThresholdCriteria from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdCriteria'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { PrometheusMetricThresholdContext } from '../../PrometheusMetricThreshold'
import { getActionItems, getMetricItems, getMetricTypeItems } from './Components/AppDThresholdSelectUtils'
import { FailFastActionValues, NewDefaultVauesForFailFastThreshold } from '../../PrometheusMetricThresholdConstants'
import css from '../PrometheusMetricThresholdContent.module.scss'

export default function PrometheusFailFastThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { groupedCreatedMetrics, setMetricThresholds } = useContext(PrometheusMetricThresholdContext)

  useEffect(() => {
    setMetricThresholds((previousValues: any) => ({
      ...previousValues,
      failFastThresholds: formValues.failFastThresholds
    }))
  }, [formValues.failFastThresholds, setMetricThresholds])

  const handleMetricUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedFailFastThresholds = [...formValues.failFastThresholds]

    const updatedFailFastThresholds = { ...clonedFailFastThresholds[index] }

    updatedFailFastThresholds[FieldName.METRIC_THRESHOLD_METRIC_NAME] = null
    updatedFailFastThresholds[FieldName.METRIC_THRESHOLD_GROUP_NAME] = null
    updatedFailFastThresholds[FieldName.METRIC_THRESHOLD_METRIC_TYPE] = selectedValue

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

  // TODO: Update the type from Swagger
  const handleAddThreshold = (addFn: (newValue: any) => void): void => {
    addFn(cloneDeep(NewDefaultVauesForFailFastThreshold))
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
                        disabled
                        items={getMetricTypeItems(groupedCreatedMetrics)}
                        key={`${data?.metricType}`}
                        name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`}
                        onChange={({ value }) => {
                          handleMetricUpdate(index, value as string, props.replace.bind(null, index))
                        }}
                      />

                      {/* ==== ⭐️ Metric ==== */}
                      <ThresholdSelect
                        disabled={!data?.metricType}
                        items={getMetricItems(groupedCreatedMetrics)}
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
