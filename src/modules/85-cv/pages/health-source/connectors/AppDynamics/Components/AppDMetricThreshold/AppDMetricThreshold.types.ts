import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { MetricPackDTO } from 'services/cv'
import type { AppDynamicsFomikFormInterface } from '../../AppDHealthSource.types'

export interface SelectItem {
  label: string
  value: string
}

export interface AppDMetricThresholdPropsType {
  formikValues: AppDynamicsFomikFormInterface
  metricPacks: MetricPackDTO[]
  groupedCreatedMetrics: GroupedCreatedMetrics
}

export type AppDMetricThresholdContextType = AppDMetricThresholdPropsType
