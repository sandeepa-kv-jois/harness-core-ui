import React from 'react'
import { render, waitFor } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import ChangeTimeline from '../ChangeTimeline'
import type { ChangeTimelineProps } from '../ChangeTimeline.types'

const onSliderMoved = jest.fn()
jest.mock('services/cv', () => ({
  useChangeEventTimeline: jest.fn().mockImplementation(() => {
    return {
      data: {
        resource: {
          categoryTimeline: {
            Deployment: [],
            Infrastructure: [],
            Alert: []
          }
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

const defaultProps = {
  serviceIdentifier: '',
  environmentIdentifier: '',
  timestamps: [],
  timeFormat: '',
  startTime: 0,
  endTime: 0,
  onSliderMoved
}

function WrapperComponent(props: ChangeTimelineProps): JSX.Element {
  return (
    <TestWrapper>
      <ChangeTimeline {...props} />
    </TestWrapper>
  )
}

describe('Render ChangeTimeline', () => {
  test('should render with empty data', async () => {
    const { container } = render(<WrapperComponent {...defaultProps} />)
    await waitFor(() => expect(container.querySelector('[data-testid="timelineNoData"]')).toBeTruthy())
  })

  test('should render with error state', async () => {
    jest.spyOn(cvServices, 'useChangeEventTimeline').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: {
            data: {
              message: 'api call failed'
            }
          },
          loading: false
        } as any)
    )
    const { container } = render(<WrapperComponent {...defaultProps} />)
    await waitFor(() => expect(container.querySelector('[data-testid="timelineError"]')).toBeTruthy())
  })

  test('should render with loading state', async () => {
    jest.spyOn(cvServices, 'useChangeEventTimeline').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )
    const { container } = render(<WrapperComponent {...defaultProps} />)
    await waitFor(() => expect(container.querySelector('[data-testid="timelineLoading"]')).toBeTruthy())
  })
})
