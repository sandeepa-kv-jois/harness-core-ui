import type { UseStringsReturn } from 'framework/strings'
import type { MetricPackDTO } from 'services/cv'
import type { SelectItem } from '../../../AppDMetricThreshold.types'
import { CriteriaValues, MetricTypeValues } from '../../../AppDMetricThresholdConstants'

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

// export function getMetricTypeItems(getString: UseStringsReturn['getString']): SelectItem[] {
//   return [
//     {
//       label: getString('performance'),
//       value: MetricTypeValues.Performance
//     },
//     {
//       label: getString('cv.monitoringSources.appD.customMetric'),
//       value: MetricTypeValues.CustomMetric
//     },
//     {
//       label: getString('error'),
//       value: MetricTypeValues.Error
//     }
//   ]
// }
export function getMetricTypeItems(metricPacks?: MetricPackDTO[]): SelectItem[] {
  if (!metricPacks || !metricPacks.length) return []

  return metricPacks.map(metricPack => {
    return {
      label: metricPack.identifier as string,
      value: metricPack.identifier as string
    }
  })
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

// export function getMetricItems(getString: UseStringsReturn['getString']): SelectItem[] {
//   return [
//     {
//       label: getString('cv.monitoringSources.appD.averageWaitTime'),
//       value: 'averageWaitTime'
//     },
//     {
//       label: getString('cv.monitoringSources.appD.callsPerMinute'),
//       value: 'callsPerMinute'
//     }
//   ]
// }
export function getMetricItems(metricPacks: MetricPackDTO[], selectedMetricType?: string): SelectItem[] | undefined {
  const selectedMetricPackDetails = metricPacks.find(metricPack => metricPack.identifier === selectedMetricType)

  return selectedMetricPackDetails?.metrics?.map(metric => {
    return { label: metric.name as string, value: metric.metricIdentifier as string }
  })
}

export function getActionItems(getString: UseStringsReturn['getString']): SelectItem[] {
  return [
    {
      label: getString('cv.monitoringSources.appD.failImmediately'),
      value: 'failImmediately'
    },
    {
      label: getString('cv.monitoringSources.appD.failAfterMulti'),
      value: 'failAfterMulti'
    }
  ]
}

export function getDefaultMetricTypeValue(metricData: Record<string, boolean>, metricPacks?: MetricPackDTO[]) {
  if (!metricData || !metricPacks || !metricPacks.length) {
    return null
  }
  if (metricData[MetricTypeValues.Performance]) {
    return MetricTypeValues.Performance
  } else if (metricData[MetricTypeValues.Errors]) {
    return MetricTypeValues.Errors
  }
}
