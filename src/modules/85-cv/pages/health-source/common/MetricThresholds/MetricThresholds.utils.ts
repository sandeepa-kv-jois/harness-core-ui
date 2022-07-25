import type { UseStringsReturn } from 'framework/strings'
import { MetricCriteriaValues, PercentageCriteriaDropdownValues } from './MetricThresholds.constants'
import type { SelectItem } from './MetricThresholds.types'

export const getCriterialItems = (getString: UseStringsReturn['getString']): SelectItem[] => {
  return [
    {
      label: getString('cv.monitoringSources.appD.absoluteValue'),
      value: MetricCriteriaValues.Absolute
    },
    {
      label: getString('cv.monitoringSources.appD.percentageDeviation'),
      value: MetricCriteriaValues.Percentage
    }
  ]
}

export const getCriteriaPercentageDropdownOptions = (getString: UseStringsReturn['getString']): SelectItem[] => [
  {
    label: getString('cv.monitoringSources.appD.greaterThan'),
    value: PercentageCriteriaDropdownValues.GreaterThan
  },
  {
    label: getString('cv.monitoringSources.appD.lesserThan'),
    value: PercentageCriteriaDropdownValues.LessThan
  }
]
