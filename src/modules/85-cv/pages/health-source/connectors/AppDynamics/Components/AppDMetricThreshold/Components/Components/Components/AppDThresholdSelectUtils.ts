import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { UseStringsReturn } from 'framework/strings'
import type { MetricPackDTO } from 'services/cv'
import type { SelectItem } from '../../../AppDMetricThreshold.types'
import {
  CriteriaValues,
  CustomMetricDropdownOption,
  DefaultCustomMetricGroupName,
  FailFastActionValues,
  MetricTypeValues
} from '../../../AppDMetricThresholdConstants'

export function getItembyValue(items: SelectItem[], value: string): SelectItem {
  return items?.filter(x => x.value == value)[0]
}

export const getCriterialItems = (getString: UseStringsReturn['getString']): SelectItem[] => {
  return [
    {
      label: getString('cv.monitoringSources.appD.absoluteValue'),
      value: CriteriaValues.Absolute
    },
    {
      label: getString('cv.monitoringSources.appD.percentageDeviation'),
      value: CriteriaValues.Percentage
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

export function getMetricTypeItems(
  metricPacks: MetricPackDTO[],
  metricData: Record<string, boolean>,
  groupedCreatedMetrics: GroupedCreatedMetrics
): SelectItem[] {
  if (!metricPacks || !metricPacks.length) return []

  const options: SelectItem[] = []

  metricPacks.forEach(metricPack => {
    // Adding only the Metric type options which are checked in metric packs
    if (metricData[metricPack.identifier as string]) {
      options.push({
        label: metricPack.identifier as string,
        value: metricPack.identifier as string
      })
    }
  })

  // Adding Custom metric option only if there are any custom metric is present
  const isCustomMetricPresent = Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length)

  if (isCustomMetricPresent) {
    options.push(CustomMetricDropdownOption)
  }

  return options
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

function getMetricsNameOptionsFromGroupName(
  selectedGroup: string,
  groupedCreatedMetrics: GroupedCreatedMetrics
): SelectItem[] {
  const selectedGroupDetails = groupedCreatedMetrics[selectedGroup]

  if (!selectedGroupDetails) {
    return []
  }

  return selectedGroupDetails.map(selectedGroupDetail => {
    return {
      label: selectedGroupDetail.metricName as string,
      value: selectedGroupDetail.metricName as string
    }
  })
}

export function getMetricItems(
  metricPacks: MetricPackDTO[],
  selectedMetricType: string,
  selectedGroup: string,
  groupedCreatedMetrics: GroupedCreatedMetrics
): SelectItem[] {
  if (selectedMetricType === MetricTypeValues.Custom) {
    if (!selectedGroup) {
      return []
    }
    return getMetricsNameOptionsFromGroupName(selectedGroup, groupedCreatedMetrics)
  }

  const selectedMetricPackDetails = metricPacks.find(metricPack => metricPack.identifier === selectedMetricType)

  return (
    selectedMetricPackDetails?.metrics?.map(metric => {
      return { label: metric.name as string, value: metric.metricIdentifier as string }
    }) || []
  )
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
