import React from 'react'
import { render, act, fireEvent, waitFor, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import {
  getCategoryNamesList,
  SettingType,
  getCategoryHandler,
  getTypeHandler,
  getYupValidationForSetting,
  responseData
} from './DefaultFactoryMock'
import SettingsList from '../SettingsList'

jest.mock('@default-settings/factories/DefaultSettingsFactory', () => ({
  getCategoryNamesList: jest.fn().mockImplementation(() => getCategoryNamesList()),
  getCategoryHandler: jest.fn().mockImplementation(category => getCategoryHandler(category)),
  getTypeHandler: jest.fn().mockImplementation(setting => getTypeHandler(setting)),
  getYupValidationForSetting: jest.fn().mockImplementation(() => getYupValidationForSetting())
}))
let valueChanged = 5
const saveSettings = jest.fn(data => {
  valueChanged = data[0].value
  return Promise.resolve(responseData)
})
jest.mock('services/cd-ng', () => ({
  getSettingsListPromise: jest.fn().mockImplementation(() => {
    return Promise.resolve(responseData)
  }),
  useUpdateSettingValue: jest.fn().mockImplementation(() => {
    return { data: responseData, mutate: saveSettings, error: null, loading: false }
  })
}))
jest.mock('@default-settings/interfaces/SettingType', () => ({
  SettingType: SettingType
}))
describe('Default Settings Page', () => {
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper path={routes.toDefaultSettings({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <SettingsList />
      </TestWrapper>
    )
  })
  test('render data and save the changed data', async () => {
    const { container, getByText, getAllByText } = renderObj
    expect(container).toMatchSnapshot()
    const cd = getByText('common.purpose.cd.continuous')
    act(() => {
      fireEvent.click(cd)
    })

    await waitFor(() => {
      expect(getAllByText('mockbox')).toBeTruthy()
    })
    const restoreBtn = getAllByText('defaultSettings.restoreToDefault')
    const inputEl = container.querySelector(`input[name="test_setting_CD_1"]`)
    expect(inputEl?.getAttribute('value')).toEqual('5')
    act(() => {
      fireEvent.click(restoreBtn[0])
    })
    expect(inputEl?.getAttribute('value')).toEqual('8')
    const saveBtn = getByText('save')
    act(() => {
      fireEvent.click(saveBtn)
    })
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(valueChanged).toEqual('8'))
  })
})
