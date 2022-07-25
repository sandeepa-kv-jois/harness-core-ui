import React, { useEffect, useState } from 'react'
import { Container } from '@harness/uicore'
import { Column, RenderCostCell, RenderNameCell, RenderPercentageCell } from '@ce/components/PerspectiveGrid/Columns'
import GridWithChartVisualiser from './GridWithChartVisualiser'
import { getStaticSchedulePeriodTime } from '@ce/utils/momentUtils'

export const DEFAULT_COLS: Column[] = [
  {
    Header: 'Name',
    accessor: 'name',
    className: 'name',
    width: 250,
    hideable: false,
    Cell: RenderNameCell
  },
  {
    Header: 'Compute spend',
    accessor: 'compute_spend',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  },
  {
    Header: 'Utilisation',
    accessor: 'utilization',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  },
  {
    Header: 'Utilisation (%)',
    accessor: 'percentage',
    width: 200,
    hideable: false,
    Cell: RenderPercentageCell
  }
]

const Utilisation: React.FC = () => {
  const [cols] = useState(DEFAULT_COLS)
  const [data, setData] = useState([])
  const [chart, setChart] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    !loading && setLoading(true)
    fetch(
      'http://34.72.252.106:9090/accounts/kmpySmUISimoRrJL6NL73w/co/v1/detail/commitment_utilisation?start_date=2022-07-08&end_date=2022-07-15',
      {
        method: 'POST',
        body: JSON.stringify({})
      }
    )
      .then(res => res.json())
      .then((res: Record<string, any>) => {
        const columnsData: Column[] = []
        const chartData = []
        Object.entries(res.response).forEach(([key, value]) => {
          columnsData.push({
            name: key,
            ...(value as any).table
          })
          const colsData = (value as any).chart.map((col: any) => [
            getStaticSchedulePeriodTime(col.date),
            col.utilization_percentage
          ])
          chartData.push({
            name: key,
            data: colsData,
            keys: ['x', 'y']
          })
        })
        setChart(chartData)
        setData(columnsData)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <Container>
      <GridWithChartVisualiser
        columns={cols}
        data={data}
        chartData={chart}
        chartLoading={loading}
        dataLoading={loading}
        chartOptions={{
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
                return `${this.value}%`
              }
            }
          } as Highcharts.YAxisOptions
        }}
      />
      {/* <Layout.Horizontal> */}
      {/* <Text font={{ variation: FontVariation.BODY }}>Group by</Text> */}
      {/* <Tabs id={'groups'} onChange={id => setGroupBy(id as GROUP_BY)}>
          <Tab
            id={GROUP_BY.COMMITMENT_TYPE}
            title={'Commitment type'}
            panel={<GridWithChartVisualiser columns={cols} data={data} />}
          />
          <Tab
            id={GROUP_BY.INSTANCE_FAMILY}
            title={'Instance Family'}
            panel={<GridWithChartVisualiser columns={cols} data={data} />}
          />
          <Tab id={GROUP_BY.REGIONS} title={'Regions'} panel={<GridWithChartVisualiser columns={cols} data={data} />} />
        </Tabs> */}
      {/* <Layout.Horizontal>
        </Layout.Horizontal> */}
      {/* <Select items={[]} /> */}
      {/* </Layout.Horizontal> */}
    </Container>
  )
}

export default Utilisation
