/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as ceServices from 'services/ce'
import BIDashboard from '../BIDashboard'
import BIDashboardData from './BIDashboardData.json'

jest.mock('@harness/uicore', () => {
  const fullModule = jest.requireActual('@harness/uicore')

  return {
    ...fullModule,
    PageSpinner: () => <span data-testid="page-spinner">Page Spinner</span>
  }
})

jest.mock('services/ce', () => ({
  useListBIDashboards: jest.fn().mockImplementation(() => {
    return {
      data: BIDashboardData,
      refetch: jest.fn(),
      loading: false
    }
  })
}))

describe('Test cases for BI Dashboard page', () => {
  test('Should render the list of dashboard', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <BIDashboard />
      </TestWrapper>
    )

    expect(getByText('ce.biDashboard.bannerText')).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test('Should show the loader in case data is loading', () => {
    jest
      .spyOn(ceServices, 'useListBIDashboards')
      .mockImplementation(() => ({ data: BIDashboardData, loading: true, refetch: jest.fn } as any))

    render(
      <TestWrapper>
        <BIDashboard />
      </TestWrapper>
    )

    expect(screen.getByTestId('page-spinner')).toBeInTheDocument()
  })
})
