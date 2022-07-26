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
  testConnectionResponse,
  permissionsYamlMock
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
  })),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  }))
}))

jest.mock('services/ce', () => ({
  useCCMK8SMetadata: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => ccmK8sMetaResponse
  }))
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: permissionsYamlMock, loading: false }
  })
}))

describe('Test Cases for Cloud Integration Page', () => {
  const responseState = {
    executeQuery: ({ query }: { query: DocumentNode }) => {
      if (query === FetchCcmMetaDataDocument) {
        return fromValue(ccmMetadataResponse)
      }
    }
  }

  test('Should be able to render the page', async () => {
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
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    fireEvent.click(getAllByText(container, 'newConnector')[0])
    const dialog = findDialogContainer()

    await waitFor(() => expect(getAllByText(dialog!, 'overview').length).toBe(2))
  })

  test('Should be able to open Enable Reporting', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(getAllByText(container, 'ce.cloudIntegration.enableCloudCosts')[0]).toBeDefined())
    fireEvent.click(getAllByText(container, 'ce.cloudIntegration.enableCloudCosts')[0])

    const reportingDialog = findDialogContainer() as HTMLElement
    await waitFor(() => {
      expect(getAllByText(reportingDialog, 'ce.cloudIntegration.costVisibilityDialog.step1.title')).toBeDefined()
    })
    fireEvent.click(getByText(reportingDialog, 'ce.cloudIntegration.enableAutoStopping'))
    fireEvent.click(getByText(reportingDialog, 'continue'))
    fireEvent.click(getByText(reportingDialog, 'continue'))
    fireEvent.click(getByText(reportingDialog, 'finish'))
  })

  test('Should be able to open Enable AutoStopping', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(getAllByText(container, 'common.ce.autostopping')[0]).toBeDefined())
    fireEvent.click(getAllByText(container, 'common.ce.autostopping')[0])

    const autoStoppingDialog = findDialogContainer()
    await waitFor(() => {
      expect(getByText(autoStoppingDialog!, 'i. secrets.createSecret')).toBeDefined()
    })
    fireEvent.click(getByText(autoStoppingDialog!, 'continue'))
    expect(
      getByText(autoStoppingDialog!, 'ce.cloudIntegration.autoStoppingModal.installComponents.title')
    ).toBeDefined()
    fireEvent.click(getByText(autoStoppingDialog!, 'continue'))
    expect(getByText(autoStoppingDialog!, 'ce.cloudIntegration.autoStoppingModal.testComponents.title')).toBeDefined()
    fireEvent.click(getByText(autoStoppingDialog!, 'finish'))
  })

  test('Should be able to navigate to connector list page', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path="/account/:accountId/ce/cloud-integration" pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    fireEvent.click(getAllByText(container, 'newConnector')[1])

    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent('/account/TEST_ACC/settings/resources/connectors')
  })
})
