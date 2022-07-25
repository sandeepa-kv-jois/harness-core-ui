import React from 'react'
import { Container, Icon, Layout } from '@harness/uicore'
import type { Column } from 'react-table'
import type { OptionsStackingValue } from 'highcharts'
import Grid from '@ce/components/PerspectiveGrid/Grid'
import CEChart from '@ce/components/CEChart/CEChart'
import { CCM_CHART_TYPES } from '@ce/constants'

interface GridWithChartVisualiserProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  chartData: any
  chartLoading?: boolean
  dataLoading?: boolean
  chartOptions?: any
}

const GridWithChartVisualiser = <T extends Record<string, unknown>>({
  columns,
  data,
  chartData,
  chartLoading = false,
  dataLoading = false,
  chartOptions
}: GridWithChartVisualiserProps<T>) => {
  const plotOptions = {
    series: {
      connectNulls: true,
      animation: {
        duration: 500
      },
      stacking: 'normal' as OptionsStackingValue
    },
    area: {
      lineWidth: 1,
      marker: {
        enabled: false
      }
    },
    column: {
      borderColor: undefined
    },
    legend: {
      enabled: true,
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical'
    }
  }
  const xAxisOptions: Highcharts.XAxisOptions = {
    type: 'datetime',
    ordinal: true,
    min: null,
    tickInterval: 24 * 3600 * 1000,
    minPadding: 0.05,
    maxPadding: 0.05
  }

  if (chartLoading || dataLoading) {
    return (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Icon name="spinner" size={26} />
      </Layout.Horizontal>
    )
  }

  return (
    <Container>
      {chartLoading ? (
        <Layout.Horizontal flex={{ justifyContent: 'center' }}>
          <Icon name="spinner" size={26} />
        </Layout.Horizontal>
      ) : (
        <CEChart
          options={{
            series: chartData as any,
            chart: {
              zoomType: 'x',
              height: 300,
              type: CCM_CHART_TYPES.COLUMN,
              spacingTop: 40
            },
            plotOptions,
            yAxis: {
              endOnTick: true,
              min: 0,
              max: null,
              tickAmount: 3,
              title: {
                text: ''
              },
              labels: {
                formatter: function () {
                  return `$${this.value}`
                }
              }
            },
            xAxis: xAxisOptions,
            annotations: [
              {
                // labels: anomaliesLabels(),
                draggable: '',
                visible: true,
                labelOptions: {
                  crop: false,
                  useHTML: true,
                  backgroundColor: 'transparent',
                  borderWidth: 0
                }
              }
            ],
            ...chartOptions
          }}
        />
      )}
      <Grid columns={columns} data={data} />
    </Container>
  )
}

export default GridWithChartVisualiser
