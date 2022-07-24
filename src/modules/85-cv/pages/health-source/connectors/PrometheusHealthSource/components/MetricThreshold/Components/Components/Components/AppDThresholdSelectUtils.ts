import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import {
  MetricCriteriaValues,
  MetricTypeValues
} from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.constants'
import type { UseStringsReturn } from 'framework/strings'
import type { MetricPackDTO } from 'services/cv'
import type { SelectItem } from '../../../PrometheusMetricThreshold.types'
import {
  CustomMetricDropdownOption,
  DefaultCustomMetricGroupName,
  FailFastActionValues,
  PercentageCriteriaDropdownValues
} from '../../../PrometheusMetricThresholdConstants'

export function getItembyValue(items: SelectItem[], value: string): SelectItem {
  return items?.filter(x => x.value == value)[0]
}

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

function getCustomMetricGroupNames(groupedCreatedMetrics: GroupedCreatedMetrics): string[] {
  const groupsNames = Object.keys(groupedCreatedMetrics)

  const fileteredGroupNames = groupsNames.filter(
    groupName => groupName !== '' && groupName !== DefaultCustomMetricGroupName
  )

  return fileteredGroupNames
}

export function getGroupDropdownOptions(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  const validGroups = getCustomMetricGroupNames(groupedCreatedMetrics)

  return validGroups.map(group => ({
    label: group,
    value: group
  }))
}

export function getMetricTypeItems(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  // Adding Custom metric option only if there are any custom metric is present
  const isCustomMetricPresent = Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length)

  if (isCustomMetricPresent) {
    return [CustomMetricDropdownOption]
  }

  return []
}

export function getTransactionItems(getString: UseStringsReturn['getString']): SelectItem[] {
  return [
    {
      label: getString('cv.monitoringSources.appD.register'),
      value: 'register'
    },
    {
      label: getString('cv.monitoringSources.appD.verificationService'),
      value: 'verificationService'
    }
  ]
}

function getAllMetricsNameOptions(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  const groups = Object.keys(groupedCreatedMetrics)

  if (!groups.length) {
    return []
  }

  const options: SelectItem[] = []

  groups.forEach(group => {
    const groupDetails = groupedCreatedMetrics[group]
    const metricNameOptions = groupDetails.map(groupDetail => {
      return {
        label: groupDetail.metricName as string,
        value: groupDetail.metricName as string
      }
    })

    options.push(...metricNameOptions)
  })

  return options
}

export function getMetricItems(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  return getAllMetricsNameOptions(groupedCreatedMetrics)
}

export function getActionItems(getString: UseStringsReturn['getString']): SelectItem[] {
  return [
    {
      label: getString('cv.monitoringSources.appD.failImmediately'),
      value: FailFastActionValues.FailImmediately
    },
    {
      label: getString('cv.monitoringSources.appD.failAfterMultipleOccurrences'),
      value: FailFastActionValues.FailAfterOccurrences
    },
    {
      label: getString('cv.monitoringSources.appD.failAfterConsecutiveOccurrences'),
      value: FailFastActionValues.FailAfterConsecutiveOccurrences
    }
  ]
}

export function getDefaultMetricTypeValue(
  metricData: Record<string, boolean>,
  metricPacks?: MetricPackDTO[]
): string | null {
  if (!metricData || !metricPacks || !metricPacks.length) {
    return null
  }
  if (metricData[MetricTypeValues.Performance]) {
    return MetricTypeValues.Performance
  } else if (metricData[MetricTypeValues.Errors]) {
    return MetricTypeValues.Errors
  }

  return null
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
