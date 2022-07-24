import { ThresholdTypes } from '../../AppDHealthSource.constants'
import type { SelectItem } from './AppDMetricThreshold.types'

export const MetricTypeValues = {
  Performance: 'Performance',
  Custom: 'Custom',
  Errors: 'Errors'
}

export const CriteriaValues = {
  Absolute: 'Absolute',
  Percentage: 'Percentage'
}

export const FailFastActionValues = {
  FailImmediately: 'FailImmediately',
  FailAfterOccurrences: 'FailAfterOccurrences',
  FailAfterConsecutiveOccurrences: 'FailAfterConsecutiveOccurrences'
}

export const PercentageCriteriaDropdownValues = {
  GreaterThan: 'greaterThan',
  LessThan: 'lessThan'
}

const IgnoreThresholdType = 'Ignore'

export const CustomMetricDropdownOption: SelectItem = {
  label: MetricTypeValues.Custom,
  value: MetricTypeValues.Custom
}

export const NewDefaultVauesForIgnoreThreshold = {
  metricType: null,
  groupName: null,
  metricName: null,
  type: ThresholdTypes.IgnoreThreshold,
  spec: {
    action: IgnoreThresholdType
  },
  criteria: {
    type: CriteriaValues.Absolute,
    spec: {}
  }
}

export const NewDefaultVauesForFailFastThreshold = {
  metricType: null,
  groupName: null,
  metricName: null,
  type: ThresholdTypes.FailImmediately,
  spec: {
    action: FailFastActionValues.FailImmediately,
    spec: {}
  },
  criteria: {
    type: CriteriaValues.Absolute,
    spec: {}
  }
}

export const DefaultCustomMetricGroupName = 'Please Select Group Name'

export const MetricTypesForTransactionTextField = [MetricTypeValues.Performance, MetricTypeValues.Errors]
