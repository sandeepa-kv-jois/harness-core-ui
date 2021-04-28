import React from 'react'
import { render, act, fireEvent, waitFor, queryByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { AuthenticationMechanisms } from '@common/constants/Utils'
import HarnessAccount from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockResponse, authSettings } from '@common/pages/AuthenticationSettings/__test__/mock'

jest.mock('services/cd-ng', () => ({
  useUpdateAuthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  usePutLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useSetTwoFactorAuthAtAccountLevel: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()
const submitUserPasswordUpdate = jest.fn()
const updatingAuthMechanism = false

const disabledUserPasswordLogin = {
  ...authSettings,
  authenticationMechanism: AuthenticationMechanisms.OAUTH
}

const disabledOauthLogin = {
  ...authSettings,
  ngAuthSettings: authSettings.ngAuthSettings.filter(
    settings => settings.settingsType !== AuthenticationMechanisms.OAUTH
  )
}

describe('HarnessAccount', () => {
  test('Disable login vai Username-Password', async () => {
    const { getByTestId, container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <HarnessAccount
          authSettings={authSettings}
          refetchAuthSettings={refetchAuthSettings}
          submitUserPasswordUpdate={submitUserPasswordUpdate}
          updatingAuthMechanism={updatingAuthMechanism}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const toggleUserPasswordLogin = getByTestId('toggle-user-password-login')
    act(() => {
      fireEvent.click(toggleUserPasswordLogin)
    })

    await waitFor(() => queryByText(document.body, 'common.authSettings.disableUserPasswordLogin'))
    const confirmDisable = findDialogContainer()
    expect(confirmDisable).toBeTruthy()

    const confirmBtn = queryByText(confirmDisable!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmBtn!)
    })

    expect(submitUserPasswordUpdate).toBeCalled()
  }),
    test('Enable login vai Username-Password', () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <HarnessAccount
            authSettings={disabledUserPasswordLogin}
            refetchAuthSettings={refetchAuthSettings}
            submitUserPasswordUpdate={submitUserPasswordUpdate}
            updatingAuthMechanism={updatingAuthMechanism}
          />
        </TestWrapper>
      )

      const toggleUserPasswordLogin = getByTestId('toggle-user-password-login')
      act(() => {
        fireEvent.click(toggleUserPasswordLogin)
      })

      expect(submitUserPasswordUpdate).toBeCalled()
    }),
    test('Enable at least one SSO before disabling login vai Username-Password', () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <HarnessAccount
            authSettings={disabledOauthLogin}
            refetchAuthSettings={refetchAuthSettings}
            submitUserPasswordUpdate={submitUserPasswordUpdate}
            updatingAuthMechanism={updatingAuthMechanism}
          />
        </TestWrapper>
      )

      const toggleUserPasswordLogin = getByTestId('toggle-user-password-login')
      act(() => {
        fireEvent.click(toggleUserPasswordLogin)
      })

      expect(
        queryByText(document.body, 'common.authSettings.enableAtLeastOneSSoBeforeDisablingUserPasswordLogin')
      ).toBeTruthy()
    })
})
