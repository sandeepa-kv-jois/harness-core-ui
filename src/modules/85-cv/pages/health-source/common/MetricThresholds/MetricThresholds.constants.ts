interface SelectItem {
  label: string
  value: string
}

export const IgnoreThresholdType = 'Ignore'

export const MetricCriteriaValues = {
  Absolute: 'Absolute',
  Percentage: 'Percentage'
}

export const MetricTypeValues = {
  Performance: 'Performance',
  Custom: 'Custom',
  Errors: 'Errors'
}

export const CustomMetricDropdownOption: SelectItem = {
  label: MetricTypeValues.Custom,
  value: MetricTypeValues.Custom
}

export const MetricThresholdTypes = {
  IgnoreThreshold: 'IgnoreThreshold',
  FailImmediately: 'FailImmediately'
}
