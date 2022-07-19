import type { MetricPackDTO } from 'services/cv'
import type { AppDynamicsFomikFormInterface } from '../../AppDHealthSource.types'

export interface SelectItem {
  label: string
  value: string
}

export interface AppDMetricThresholdPropsType {
  formikValues: AppDynamicsFomikFormInterface
  metricPacks: MetricPackDTO[]
}

export type AppDMetricThresholdContextType = AppDMetricThresholdPropsType
