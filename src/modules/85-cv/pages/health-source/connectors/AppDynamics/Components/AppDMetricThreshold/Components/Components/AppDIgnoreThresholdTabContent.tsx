import React, { useContext } from 'react'
import cx from 'classnames'
import { Container, Text, FormInput, Layout, Button, ButtonVariation } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useFormikContext, FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import { AppDMetricThresholdContext } from '../../AppDMetricThreshold'
import {
  getCriterialItems,
  getGroupDropdownOptions,
  getMetricItems,
  getMetricTypeItems
} from './Components/AppDThresholdSelectUtils'
import {
  CriteriaValues,
  MetricTypesForTransactionTextField,
  MetricTypeValues,
  NewDefaultVauesForIgnoreThreshold
} from '../../AppDMetricThresholdConstants'
import type { AppDynamicsFomikFormInterface } from '../../../../AppDHealthSource.types'
import { AppDynamicsMonitoringSourceFieldNames } from '../../../../AppDHealthSource.constants'
import css from '../AppDMetricThresholdContent.module.scss'

export default function AppDIgnoreThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { metricPacks, groupedCreatedMetrics } = useContext(AppDMetricThresholdContext)

  const handleMetricUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedIgnoreThreshold = [...formValues.ignoreThresholds]

    const updatedIgnoreThreshold = { ...clonedIgnoreThreshold[index] }

    updatedIgnoreThreshold[AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_METRIC_NAME] = null
    updatedIgnoreThreshold[AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_GROUP_NAME] = null
    updatedIgnoreThreshold[AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_METRIC_TYPE] = selectedValue

    clonedIgnoreThreshold[index] = updatedIgnoreThreshold

    replaceFn(updatedIgnoreThreshold)
  }

  const handleTransactionUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedIgnoreThreshold = [...formValues.ignoreThresholds]

    const updatedIgnoreThreshold = { ...clonedIgnoreThreshold[index] }

    updatedIgnoreThreshold[AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_METRIC_NAME] = null
    updatedIgnoreThreshold[AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_GROUP_NAME] = selectedValue

    clonedIgnoreThreshold[index] = updatedIgnoreThreshold

    replaceFn(updatedIgnoreThreshold)
  }

  const isGroupTransationTextField = (index: number) =>
    MetricTypesForTransactionTextField.some(field => field === formValues.ignoreThresholds[index]?.metricType)

  // TODO: Update the type from Swagger
  const handleAddThreshold = (pushFn: (newValue: any) => void) => {
    pushFn(NewDefaultVauesForIgnoreThreshold)
  }

  return (
    <Container margin={{ top: 'large' }}>
      <Text color={Color.BLACK}>{getString('cv.monitoringSources.appD.ignoreThresholdHint')}</Text>
      <Container>
        <FieldArray
          name="ignoreThresholds"
          render={props => {
            return (
              <Container style={{ minHeight: 300 }}>
                <Container className={css.appDMetricThresholdContentIgnoreTableHeader}>
                  <Text>{getString('cv.monitoringSources.appD.metricType')}</Text>
                  <Text>{getString('cv.monitoringSources.appD.groupTransaction')}</Text>
                  <Text>{getString('cv.monitoringSources.metricLabel')}</Text>
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

                {props?.form?.values?.ignoreThresholds?.map((data, index: number) => {
                  return (
                    <Container key={index} className={css.appDMetricThresholdContentIgnoreTableRow}>
                      {/* ==== ⭐️ Metric Type ==== */}
                      <FormInput.Select
                        items={getMetricTypeItems(metricPacks, formValues.metricData, groupedCreatedMetrics)}
                        key={`${data?.metricType}`}
                        name={`ignoreThresholds.${index}.${AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_METRIC_TYPE}`}
                        onChange={({ value }) => {
                          handleMetricUpdate(index, value as string, props.replace.bind(null, index))
                        }}
                      ></FormInput.Select>

                      {/* ==== ⭐️ Group ==== */}
                      {isGroupTransationTextField(index) ? (
                        <FormInput.Text
                          placeholder={getString('cv.monitoringSources.appD.groupTransaction')}
                          style={{ marginTop: 'medium' }}
                          name={`ignoreThresholds.${index}.${AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_GROUP_NAME}`}
                          disabled={!data.metricType}
                        />
                      ) : (
                        <FormInput.Select
                          usePortal
                          items={getGroupDropdownOptions(groupedCreatedMetrics)}
                          name={`ignoreThresholds.${index}.${AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_GROUP_NAME}`}
                          onChange={({ value }) => {
                            if (data.metricType === MetricTypeValues.Custom) {
                              handleTransactionUpdate(index, value as string, props.replace.bind(null, index))
                            }
                          }}
                          disabled={!data.metricType}
                        ></FormInput.Select>
                      )}

                      {/* ==== ⭐️ Metric ==== */}
                      <FormInput.Select
                        usePortal
                        disabled={!data?.metricType}
                        items={getMetricItems(metricPacks, data.metricType, data.groupName, groupedCreatedMetrics)}
                        key={`${data?.metricType}-${data.groupName}`}
                        name={`ignoreThresholds.${index}.${AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_METRIC_NAME}`}
                      ></FormInput.Select>

                      {/* ==== ⭐️ Criteria ==== */}
                      <Layout.Horizontal style={{ alignItems: 'center' }}>
                        <FormInput.Select
                          items={getCriterialItems(getString)}
                          className={cx(css.appDMetricThresholdContentSelect, css.appDMetricThresholdContentCriteria)}
                          key={data?.criteria?.type}
                          name={`ignoreThresholds.${index}.${AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_CRITERIA}.type`}
                          // value={getItembyValue(getCriterialItems(getString), data?.criteria?.type)}
                        ></FormInput.Select>
                        {data?.criteria?.type !== CriteriaValues.Percentage && (
                          <FormInput.Text
                            inline
                            className={css.appDMetricThresholdContentInput}
                            label={getString('cv.monitoringSources.appD.greaterThan')}
                            inputGroup={{ type: 'number' }}
                            name={`ignoreThresholds.${index}.criteria.spec.${AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_GREATER_THAN}`}
                          />
                        )}
                        <FormInput.Text
                          inline
                          className={css.appDMetricThresholdContentInput}
                          label={getString('cv.monitoringSources.appD.lesserThan')}
                          inputGroup={{ type: 'number' }}
                          name={`ignoreThresholds.${index}.criteria.spec.${AppDynamicsMonitoringSourceFieldNames.METRIC_THRESHOLD_LESS_THAN}`}
                        />
                      </Layout.Horizontal>
                      <Button icon="trash" minimal iconProps={{ size: 14 }} onClick={() => props.remove(index)} />
                    </Container>
                  )
                })}
                <pre>
                  <code>{JSON.stringify(props?.form?.values?.ignoreThresholds, null, 4)}</code>
                </pre>
              </Container>
            )
          }}
        />
      </Container>
    </Container>
  )
}
