/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, waitFor, getAllByText } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { FetchCcmMetaDataDocument } from 'services/ce/services'

import CloudIntegrationPage from '../CloudIntegrationPage'

import {
  ccmMetadataResponse,
  ccmK8sListResponse,
  ccmK8sMetaResponse,
  listV2Response,
  testConnectionResponse
} from './mocks'

const params = {
  accountId: 'TEST_ACC'
}

jest.mock('services/cd-ng', () => ({
  useGetCCMK8SConnectorList: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => ccmK8sListResponse
  })),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => listV2Response
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => testConnectionResponse
  }))
}))

jest.mock('services/ce', () => ({
  useCCMK8SMetadata: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => ccmK8sMetaResponse
  }))
}))

describe('Test Cases for Cloud Integration Page', () => {
  test('Should be able to render the page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchCcmMetaDataDocument) {
          return fromValue(ccmMetadataResponse)
        }
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText(container, 'ce.cloudIntegration.sideNavText')).toBeDefined()
      expect(getByText(container, 'connector1')).toBeDefined()
    })
  })

  test('Should be able to open new connector dialog', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchCcmMetaDataDocument) {
          return fromValue(ccmMetadataResponse)
        }
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    fireEvent.click(getAllByText(container, 'newConnector')[0])
    const dialog = findDialogContainer()

    waitFor(() => expect(getByText(dialog!, 'overview')).toBeDefined())
  })
})
