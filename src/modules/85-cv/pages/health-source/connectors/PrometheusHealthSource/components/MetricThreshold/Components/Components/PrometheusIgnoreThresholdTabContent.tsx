import React, { useContext, useEffect } from 'react'
import { Container, Text, Layout, Button, ButtonVariation } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { cloneDeep } from 'lodash-es'
import { useFormikContext, FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import ThresholdSelect from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdSelect'
import ThresholdCriteria from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdCriteria'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { PrometheusMetricThresholdContext } from '../../PrometheusMetricThreshold'
import { getMetricItems, getMetricTypeItems } from './Components/AppDThresholdSelectUtils'
import { NewDefaultVauesForIgnoreThreshold } from '../../PrometheusMetricThresholdConstants'

import css from '../PrometheusMetricThresholdContent.module.scss'

export default function PrometheusDIgnoreThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { groupedCreatedMetrics, setMetricThresholds } = useContext(PrometheusMetricThresholdContext)

  const handleMetricUpdate = (index: number, selectedValue: string, replaceFn: (value: any) => void): void => {
    const clonedIgnoreThreshold = [...formValues.ignoreThresholds]

    const updatedIgnoreThreshold = { ...clonedIgnoreThreshold[index] }

    updatedIgnoreThreshold[FieldName.METRIC_THRESHOLD_METRIC_NAME] = null
    updatedIgnoreThreshold[FieldName.METRIC_THRESHOLD_GROUP_NAME] = null
    updatedIgnoreThreshold[FieldName.METRIC_THRESHOLD_METRIC_TYPE] = selectedValue

    clonedIgnoreThreshold[index] = updatedIgnoreThreshold

    replaceFn(updatedIgnoreThreshold)
  }

  useEffect(() => {
    setMetricThresholds((previousValues: any) => ({
      ...previousValues,
      ignoreThresholds: formValues.ignoreThresholds
    }))
  }, [formValues.ignoreThresholds, setMetricThresholds])

  // TODO: Update the type from Swagger
  const handleAddThreshold = (addFn: (newValue: any) => void): void => {
    addFn(cloneDeep(NewDefaultVauesForIgnoreThreshold))
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
                        items={getMetricTypeItems(groupedCreatedMetrics)}
                        disabled
                        key={`${data?.metricType}`}
                        name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`}
                        onChange={({ value }) => {
                          handleMetricUpdate(index, value as string, props.replace.bind(null, index))
                        }}
                      />

                      {/* ==== ⭐️ Metric ==== */}
                      <ThresholdSelect
                        disabled={!data?.metricType}
                        items={getMetricItems(groupedCreatedMetrics)}
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
