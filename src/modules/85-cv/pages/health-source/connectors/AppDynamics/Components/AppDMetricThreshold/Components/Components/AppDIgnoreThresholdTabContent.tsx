import React, { useContext } from 'react'
import { Container, Text, FieldArray, FormInput } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { AppDMetricThresholdContext } from '../../AppDMetricThreshold'
import appDThresholdSelect from './Components/appDThresholdSelect'
import appDIgnoreThresholdCriteria from './Components/appDIgnoreThresholdCriteria'
import {
  getDefaultMetricTypeValue,
  getMetricItems,
  getMetricTypeItems,
  getTransactionItems
} from './Components/AppDThresholdSelectUtils'
import { MetricTypesForTransactionTextField } from '../../AppDMetricThresholdConstants'
import type { AppDynamicsFomikFormInterface } from '../../../../AppDHealthSource.types'

export default function AppDIgnoreThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues, setFieldValue } = useFormikContext<AppDynamicsFomikFormInterface>()

  console.log('formValues', formValues)

  const { metricPacks, formik } = useContext(AppDMetricThresholdContext)

  const handleMetricUpdate = (index: number): void => {
    const clonedIgnoreThreshold = [...formValues.ignoreThresholds]

    const updatedIgnoreThreshold = { ...clonedIgnoreThreshold[index] }

    updatedIgnoreThreshold.metric = null

    clonedIgnoreThreshold[index] = updatedIgnoreThreshold

    formik.setFieldValue('sli', false)
  }

  return (
    <Container margin={{ top: 'large' }}>
      <Text color={Color.BLACK}>{getString('cv.monitoringSources.appD.ignoreThresholdHint')}</Text>

      <Container>
        <FieldArray
          label=""
          name="ignoreThresholds"
          addLabel="Add Threshold"
          labelProps={{ style: { textTransform: 'uppercase' } }}
          fields={[
            {
              name: 'metricType',
              label: <Text>{getString('cv.monitoringSources.appD.metricType')}</Text>,
              defaultValue: getDefaultMetricTypeValue(formValues.metricData, metricPacks),
              renderer: (value: string, rowIndex: number, onChange: (value: any) => void, error: string) => {
                return appDThresholdSelect(
                  'metricType',
                  getMetricTypeItems(metricPacks),
                  value,
                  rowIndex,
                  updatedValue => {
                    handleMetricUpdate(rowIndex)
                    onChange(updatedValue)
                  },
                  error
                )
              }
            },
            {
              name: 'transaction',
              label: <Text>{getString('cv.monitoringSources.appD.groupTransaction')}</Text>,
              // defaultValue: 'test1',
              renderer: (value: string, rowIndex: number, onChange: (value: any) => void, error: string) => {
                if (
                  MetricTypesForTransactionTextField.some(
                    field => field === formValues.ignoreThresholds[rowIndex]?.metricType
                  )
                ) {
                  return (
                    <FormInput.Text
                      placeholder={getString('cv.monitoringSources.appD.groupTransaction')}
                      style={{ marginTop: 'medium' }}
                      name={`ignoreThresholds.${rowIndex}.transaction`}
                    />
                  )
                }

                return appDThresholdSelect(
                  'transaction',
                  getTransactionItems(getString),
                  value,
                  rowIndex,
                  onChange,
                  error
                )
              }
            },
            {
              name: 'metric',
              label: <Text>{getString('cv.monitoringSources.metricLabel')}</Text>,
              // defaultValue: 'test1',
              renderer: (value: string, rowIndex: number, onChange: (value: any) => void, error: string) =>
                appDThresholdSelect(
                  'metric',
                  getMetricItems(metricPacks, formValues.ignoreThresholds[rowIndex]?.metricType),
                  value,
                  rowIndex,
                  onChange,
                  error
                )
            },
            {
              name: 'criteria',
              label: <Text>{getString('cf.segmentDetail.criteria')}</Text>,
              renderer: (value: string, rowIndex: number, onChange: (value: any) => void, error: string) => {
                const rowData = formValues.ignoreThresholds[rowIndex]
                return appDIgnoreThresholdCriteria(rowData, rowIndex, getString, error)
              }
            }
          ]}
        />
      </Container>
    </Container>
  )
}
