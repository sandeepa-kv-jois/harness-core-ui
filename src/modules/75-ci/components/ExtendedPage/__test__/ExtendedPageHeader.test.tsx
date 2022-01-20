/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { ExtendedPageHeader } from '../ExtendedPageHeader'

describe('ExtendedPageHeader snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(<ExtendedPageHeader title={'title'} rowOneContent={<div />} rowTwoContent={<div />} />)
    expect(container).toMatchSnapshot()
  })
})
