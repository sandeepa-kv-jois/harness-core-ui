import React, { useContext } from 'react'
import { Container, Text, FormInput, Layout, Button, ButtonVariation } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useFormikContext, FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { AppDMetricThresholdContext } from '../../AppDMetricThreshold'
import {
  getDefaultMetricTypeValue,
  getGroupDropdownOptions,
  getMetricItems,
  getMetricTypeItems
} from './Components/AppDThresholdSelectUtils'
import {
  MetricTypesForTransactionTextField,
  MetricTypeValues,
  NewDefaultVauesForIgnoreThreshold
} from '../../AppDMetricThresholdConstants'
import ThresholdSelect from './Components/ThresholdSelect'
import ThresholdCriteria from './Components/ThresholdCriteria'
import css from '../AppDMetricThresholdContent.module.scss'

export default function AppDIgnoreThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { metricPacks, groupedCreatedMetrics } = useContext(AppDMetricThresholdContext)

  const handleMetricUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedIgnoreThreshold = [...formValues.ignoreThresholds]

    const updatedIgnoreThreshold = { ...clonedIgnoreThreshold[index] }

    updatedIgnoreThreshold[FieldName.METRIC_THRESHOLD_METRIC_NAME] = null
    updatedIgnoreThreshold[FieldName.METRIC_THRESHOLD_GROUP_NAME] = null
    updatedIgnoreThreshold[FieldName.METRIC_THRESHOLD_METRIC_TYPE] = selectedValue

    clonedIgnoreThreshold[index] = updatedIgnoreThreshold

    replaceFn(updatedIgnoreThreshold)
  }

  const handleTransactionUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedIgnoreThreshold = [...formValues.ignoreThresholds]

    const updatedIgnoreThreshold = { ...clonedIgnoreThreshold[index] }

    updatedIgnoreThreshold[FieldName.METRIC_THRESHOLD_METRIC_NAME] = null
    updatedIgnoreThreshold[FieldName.METRIC_THRESHOLD_GROUP_NAME] = selectedValue

    clonedIgnoreThreshold[index] = updatedIgnoreThreshold

    replaceFn(updatedIgnoreThreshold)
  }

  const isGroupTransationTextField = (selectedMetricType: string | null): boolean =>
    MetricTypesForTransactionTextField.some(field => field === selectedMetricType)

  // TODO: Update the type from Swagger
  const handleAddThreshold = (addFn: (newValue: any) => void): void => {
    const defaultValueForMetricType = getDefaultMetricTypeValue(formValues.metricData, metricPacks)
    const newIgnoreThresholdRow = { ...NewDefaultVauesForIgnoreThreshold, metricType: defaultValueForMetricType }
    addFn(newIgnoreThresholdRow)
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
                      <ThresholdSelect
                        items={getMetricTypeItems(metricPacks, formValues.metricData, groupedCreatedMetrics)}
                        key={`${data?.metricType}`}
                        name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`}
                        onChange={({ value }) => {
                          handleMetricUpdate(index, value as string, props.replace.bind(null, index))
                        }}
                      />

                      {/* ==== ⭐️ Group ==== */}
                      {isGroupTransationTextField(data.metricType) ? (
                        <FormInput.Text
                          placeholder={getString('cv.monitoringSources.appD.groupTransaction')}
                          style={{ marginTop: 'medium' }}
                          name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_GROUP_NAME}`}
                          disabled={!data.metricType}
                        />
                      ) : (
                        <ThresholdSelect
                          items={getGroupDropdownOptions(groupedCreatedMetrics)}
                          name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_GROUP_NAME}`}
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
                        name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_NAME}`}
                      />

                      {/* ==== ⭐️ Criteria ==== */}
                      <ThresholdCriteria
                        index={index}
                        criteriaType={data?.criteria?.type}
                        thresholdTypeName="ignoreThresholds"
                        criteriaPercentageType={data?.criteria?.criteriaPercentageType}
                        replaceFn={props.replace.bind(null, index)}
                      />
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
