import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import BIDashboard from '../BIDashboard'

describe('Test cases for BI Dashboard page', () => {
  test('Should render the list of dashboard', () => {
    const { container } = render(
      <TestWrapper>
        <BIDashboard />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
