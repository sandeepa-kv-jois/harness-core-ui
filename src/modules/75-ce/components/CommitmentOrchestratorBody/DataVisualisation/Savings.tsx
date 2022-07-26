/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import type { Column as TableColumn } from 'react-table'
import { Container } from '@harness/uicore'
import { Column, RenderCostCell, RenderNameCell } from '@ce/components/PerspectiveGrid/Columns'
import { getStaticSchedulePeriodTime } from '@ce/utils/momentUtils'
import GridWithChartVisualiser from './GridWithChartVisualiser'

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

interface SavingsData {
  name: string
  total: number
}

interface ChartSeriesData {
  name: string
  data: SavingsData[]
  keys: string[]
}

enum GROUP_BY {
  COMMITMENT_TYPE = 'Commitment Type',
  INSTANCE_FAMILY = 'Instance Family',
  REGIONS = 'Regions'
}

const Savings: React.FC = () => {
  const [cols] = useState(DEFAULT_COLS)
  const [data, setData] = useState<SavingsData[]>([])
  const [groupBy, setGroupBy] = useState<GROUP_BY>(GROUP_BY.COMMITMENT_TYPE)
  const [chart, setChart] = useState<ChartSeriesData[]>()
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
        const columnsData: SavingsData[] = []
        const chartData: ChartSeriesData[] = []
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
      <GridWithChartVisualiser
        columns={cols as TableColumn<SavingsData>[]}
        data={data}
        chartData={chart}
        chartLoading={loading}
        dataLoading={loading}
        groupByProps={{
          options: [GROUP_BY.COMMITMENT_TYPE, GROUP_BY.INSTANCE_FAMILY, GROUP_BY.REGIONS],
          selectedOption: groupBy,
          onOptionClick: option => setGroupBy(option as GROUP_BY)
        }}
      />
    </Container>
  )
}

export default Savings
