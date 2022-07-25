import React from 'react'
import { Container } from '@harness/uicore'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AppDMetricThresholdTab from '../AppDMetricThresholdTab'

jest.mock('../AppDIgnoreThresholdTabContent', () => () => <Container data-testid="AppDIgnoreThresholdTabContent" />)
jest.mock('../AppDFailFastThresholdTabContent', () => () => <Container data-testid="AppDFailFastThresholdTabContent" />)

describe('AppDMetricThresholdTab', () => {
  test('should render the component by selecting Ignore threshold by default', () => {
    render(
      <TestWrapper>
        <AppDMetricThresholdTab />
      </TestWrapper>
    )

    expect(screen.getByTestId('AppDIgnoreThresholdTabContent')).toBeInTheDocument()
    expect(screen.queryByTestId('AppDFailFastThresholdTabContent')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText(/cv.monitoringSources.appD.failFastThresholds/))

    expect(screen.queryByTestId('AppDIgnoreThresholdTabContent')).not.toBeInTheDocument()
    expect(screen.getByTestId('AppDFailFastThresholdTabContent')).toBeInTheDocument()
  })
})
