import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, queryByText, queryByAttribute } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, fillAtForm, clickSubmit } from '@common/utils/JestFormHelper'

import type { ConnectorInfoDTO } from 'services/cd-ng'
import { GitConnectionType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import CreateGithubConnector from '../CreateGithubConnector'
import {
  mockResponse,
  mockSecret,
  usernamePassword,
  usernameTokenWithAPIAccessGithubApp,
  usernameTokenWithAPIAccessToken
} from './githubMocks'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}
const updateConnector = jest.fn()
const createConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn())
}))

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn())
}))

describe('Create Github connector Wizard', () => {
  test('Creating Github step one', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGithubConnector {...commonProps} isEditMode={false} connectorInfo={undefined} mock={mockResponse} />
      </TestWrapper>
    )
    // fill step 1
    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot() // Form validation for all required fields in step one
  })

  test('Creating Github step one and step two for HTTPS', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGithubConnector {...commonProps} isEditMode={false} connectorInfo={undefined} mock={mockResponse} />
      </TestWrapper>
    )

    // fill step 1
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'url',
        value: 'githubTestUrl'
      }
    ])

    expect(container).toMatchSnapshot() // matching snapshot with data
    await act(async () => {
      clickSubmit(container)
    })
    //step 2
    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot() // Form validation for all required fields
    expect(createConnector).toBeCalledTimes(0)
  })

  test('Creating Github step two for SSH key', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGithubConnector {...commonProps} isEditMode={false} connectorInfo={undefined} mock={mockResponse} />
      </TestWrapper>
    )

    // fill step 1
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })

    fillAtForm([
      {
        container,
        type: InputTypes.RADIOS,
        fieldId: 'connectionType',
        value: GitConnectionType.SSH
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'url',
        value: 'githubTestUrl'
      }
    ])

    expect(container).toMatchSnapshot() // matching snapshot with data
    await act(async () => {
      clickSubmit(container)
    })
    //step 2
    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot() // Form validation for all required fields
    expect(createConnector).toBeCalledTimes(0)
  })

  test('should edit form for  http and authtype username', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGithubConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={usernamePassword as ConnectorInfoDTO}
          mock={mockResponse}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'Enable API access')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should form for edit http and authtype username-token with API access', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGithubConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={usernameTokenWithAPIAccessGithubApp as ConnectorInfoDTO}
          mock={mockResponse}
        />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'Enable API access')).toBeDefined()
    expect(container).toMatchSnapshot()

    //updating connector
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledTimes(1)
    expect(updateConnector).toBeCalledWith({
      connector: {
        description: 'connector before demo',
        identifier: 'asasas',
        name: 'GithubWorking1',
        orgIdentifier: '',
        projectIdentifier: '',
        spec: {
          type: 'Account',
          url: 'https://github.com/dev',
          authentication: {
            type: 'Http',
            spec: { type: 'UsernameToken', spec: { tokenRef: 'account.githubPassword', username: 'dev' } }
          },
          apiAccess: {
            type: 'GithubApp',
            spec: {
              applicationId: '1234',
              installationId: '1234',
              privateKeyRef: 'account.githubPassword'
            }
          }
        },
        tags: {},
        type: 'Github'
      }
    })
  })

  test('should form for edit http and authtype username-token with API access', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGithubConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={usernameTokenWithAPIAccessToken as ConnectorInfoDTO}
          mock={mockResponse}
        />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'Enable API access')).toBeDefined()
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    expect(updateConnector).toBeCalledWith({
      connector: {
        name: 'GithubWorking1',
        identifier: 'asasas',
        description: 'connector before demo',
        orgIdentifier: '',
        projectIdentifier: '',
        tags: {},
        type: 'Github',
        spec: {
          url: 'https://github.com/dev',
          authentication: {
            type: 'Http',
            spec: {
              type: 'UsernameToken',
              spec: { username: 'dev', tokenRef: 'account.githubPassword' }
            }
          },
          apiAccess: {
            type: 'GithubApp',
            spec: { installationId: '1234', applicationId: '1234', privateKeyRef: 'account.githubPassword' }
          },
          type: 'Account'
        }
      }
    })
  })
})
