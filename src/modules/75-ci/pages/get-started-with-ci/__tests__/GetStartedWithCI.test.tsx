/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GetStartedWithCI from '../GetStartedWithCI'
import * as hostedBuilds from '../../../hooks/useProvisionDelegateForHostedBuilds'
import { ProvisioningStatus } from '../InfraProvisioningWizard/Constants'

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {
          pageItemCount: 0,
          content: [
            {
              connector: {
                name: 'Github',
                identifier: 'Github',
                type: 'Github',
                spec: {
                  url: 'https://github.com',
                  validationRepo: 'harness/buildah',
                  authentication: {
                    type: 'Http',
                    spec: {
                      type: 'UsernameToken',
                      spec: {
                        username: 'oauth2',
                        usernameRef: null,
                        tokenRef: 'account.Github_Access_Token'
                      }
                    }
                  },
                  apiAccess: {
                    type: 'Token',
                    spec: {
                      tokenRef: 'account.Github_Access_Token'
                    }
                  }
                }
              },
              status: {
                status: 'SUCCESS',
                lastConnectedAt: 1658839003741
              }
            }
          ]
        }
      }
    }
  })),
  getSecretV2Promise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        secret: {
          type: 'SecretText',
          name: 'k8serviceToken',
          identifier: 'k8serviceToken',
          tags: {},
          description: '',
          spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline' }
        }
      }
    })
  )
}))

describe('Test Get Started With CI', () => {
  test('initial render', async () => {
    jest.spyOn(hostedBuilds, 'useProvisionDelegateForHostedBuilds').mockReturnValue({
      initiateProvisioning: jest.fn(),
      delegateProvisioningStatus: ProvisioningStatus.SUCCESS
    })
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCI />
      </TestWrapper>
    )
    expect(getByText('ci.getStartedWithCI.firstPipeline')).toBeTruthy()
    const createPipelineBtn = getByText('getStarted')
    expect(createPipelineBtn).toBeInTheDocument()
  })
})
