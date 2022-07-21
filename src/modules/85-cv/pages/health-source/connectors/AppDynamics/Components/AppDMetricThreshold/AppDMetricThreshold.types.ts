import type { SelectOption, SelectProps } from '@harness/uicore'
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

export type ThresholdSelectProps = {
  name: string
  items: SelectItem[]
  onChange?: (value: SelectOption) => void
  key?: string
  disabled?: boolean
  className?: string
} & SelectProps

export interface ThresholdCriteriaPropsType {
  criteriaType: string | null
  index: number
  thresholdTypeName: string
  // clonedThresholdValue: any[]
  replaceFn: (value: any) => void
  criteriaPercentageType?: string
}

export type AppDMetricThresholdContextType = AppDMetricThresholdPropsType
