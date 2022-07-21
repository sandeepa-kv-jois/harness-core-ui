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

const IgnoreThresholdType = 'Ignore'

export const CustomMetricDropdownOption: SelectItem = {
  label: MetricTypeValues.Custom,
  value: MetricTypeValues.Custom
}

export const NewDefaultVauesForIgnoreThreshold = {
  metricType: null,
  groupName: null,
  metricName: null,
  spec: {
    action: IgnoreThresholdType
  },
  criteria: {
    type: '',
    spec: {
      greaterThan: 0,
      lessThan: 0
    }
  }
}

export const DefaultCustomMetricGroupName = 'Please Select Group Name'

export const MetricTypesForTransactionTextField = [MetricTypeValues.Performance, MetricTypeValues.Errors]
