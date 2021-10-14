import { isNumber } from 'lodash-es'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { TimeSeriesMetricDataDTO } from 'services/cv'
import type { SeriesConfig } from './TimeseriesRow'

export function transformAnalysisDataToChartSeries(
  analysisData: TimeSeriesMetricDataDTO['metricDataList'] = []
): SeriesConfig[] {
  const highchartsLineData = []
  analysisData.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
  let currentRiskColor: string | null = getRiskColorValue(analysisData?.[0].risk)
  const zones: Highcharts.SeriesZonesOptionsObject[] = [{ value: undefined, color: currentRiskColor }]

  for (const dataPoint of analysisData) {
    const { timestamp: x, risk, value: y } = dataPoint || {}
    const riskColor = getRiskColorValue(risk)
    if (isNumber(x) && isNumber(y) && risk) {
      highchartsLineData.push({
        x,
        y
      })
      if (riskColor !== currentRiskColor) {
        zones[zones.length - 1].value = x
        zones.push({ value: undefined, color: riskColor })
        currentRiskColor = riskColor
      }
    } else {
      currentRiskColor = null
      highchartsLineData.push({ x, y: null, color: 'transparent' })
    }
  }

  return [{ series: [{ type: 'line', data: highchartsLineData, zones, zoneAxis: 'x', clip: false, lineWidth: 1 }] }]
}
