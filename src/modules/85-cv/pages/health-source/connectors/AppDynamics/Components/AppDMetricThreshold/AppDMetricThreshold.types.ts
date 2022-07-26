import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { TimeSeriesMetricPackDTO } from 'services/cv'
import type {
  AppDynamicsFomikFormInterface,
  MetricThresholdType,
  NonCustomFeildsInterface
} from '../../AppDHealthSource.types'

export interface SelectItem {
  label: string
  value: string
}

export interface AppDMetricThresholdPropsType {
  formikValues: AppDynamicsFomikFormInterface
  metricPacks: TimeSeriesMetricPackDTO[]
  groupedCreatedMetrics: GroupedCreatedMetrics
  setNonCustomFeilds: React.Dispatch<React.SetStateAction<NonCustomFeildsInterface>>
}

export interface ThresholdCriteriaPropsType {
  criteriaType: string | null
  index: number
  thresholdTypeName: string
  replaceFn: (value: MetricThresholdType) => void
  criteriaPercentageType?: string
}

export type AppDMetricThresholdContextType = AppDMetricThresholdPropsType
