/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import type { Column as TableColumn } from 'react-table'
import { Container, FontVariation, Layout, Tab, Tabs, Text } from '@harness/uicore'
import { Column, RenderCostCell, RenderNameCell } from '@ce/components/PerspectiveGrid/Columns'
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
    Header: 'Total cost',
    accessor: 'total',
    width: 200,
    hideable: false,
    Cell: RenderCostCell
  }
]

type Data = { name: string; total: number }

enum GROUP_BY {
  COMMITMENT_TYPE = 'Commitment Type',
  INSTANCE_FAMILY = 'Instance Family',
  REGIONS = 'Regions'
}

const ComputeCoverage: React.FC = () => {
  const [cols] = useState(DEFAULT_COLS)
  const [data, setData] = useState([])
  const [groupBy, setGroupBy] = useState<GROUP_BY>(GROUP_BY.COMMITMENT_TYPE)
  const [chart, setChart] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    !loading && setLoading(true)
    fetch(
      'https://autocud.lightwingtest.com/accounts/kmpySmUISimoRrJL6NL73w/co/v1/detail/savings?start_date=2022-07-08&end_date=2022-07-15',
      {
        method: 'POST',
        body: JSON.stringify({ group_by: groupBy })
      }
    )
      .then(res => res.json())
      .then((res: Record<string, any>) => {
        const columnsData: Column[] = []
        const chartData: any[] = []
        Object.entries(res.response).forEach(([key, value]) => {
          columnsData.push({
            name: key,
            ...(value as any).table
          })
          const colsData = (value as any).chart.map((col: any) => [getStaticSchedulePeriodTime(col.date), col.savings])
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
  }, [groupBy])

  return (
    <Container>
      <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
        <Text font={{ variation: FontVariation.BODY }}>Group by</Text>
        <Tabs id={'groups'} onChange={id => setGroupBy(id as GROUP_BY)}>
          <Tab
            id={GROUP_BY.COMMITMENT_TYPE}
            title={'Commitment type'}
            panel={
              <GridWithChartVisualiser
                columns={cols as TableColumn<Data>[]}
                data={data}
                chartData={chart}
                chartLoading={loading}
                dataLoading={loading}
              />
            }
          />
          <Tab
            id={GROUP_BY.INSTANCE_FAMILY}
            title={'Instance Family'}
            panel={
              <GridWithChartVisualiser
                columns={cols as TableColumn<Data>[]}
                data={data}
                chartData={chart}
                chartLoading={loading}
                dataLoading={loading}
              />
            }
          />
          <Tab
            id={GROUP_BY.REGIONS}
            title={'Regions'}
            panel={
              <GridWithChartVisualiser
                columns={cols as TableColumn<Data>[]}
                data={data}
                chartData={chart}
                chartLoading={loading}
                dataLoading={loading}
              />
            }
          />
        </Tabs>
        {/* <Layout.Horizontal>
        </Layout.Horizontal> */}
        {/* <Select items={[]} /> */}
      </Layout.Horizontal>
    </Container>
  )
}

export default ComputeCoverage
