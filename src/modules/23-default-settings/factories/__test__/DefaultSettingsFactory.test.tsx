import React from 'react'
import * as Yup from 'yup'
import { SettingType } from '@default-settings/pages/__test__/DefaultFactoryMock'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { DefaultSettingTextbox } from '@default-settings/components/ReusableHandlers'
jest.mock('@default-settings/interfaces/SettingType.types', () => ({
  SettingType: SettingType
}))
describe('Default Settings Factory', () => {
  DefaultSettingsFactory.registerCategory('CD', {
    icon: 'cd-main',
    label: 'common.purpose.cd.continuous',
    settings: [
      {
        settingTypes: new Set([
          SettingType.test_setting_CD_1 as any,
          SettingType.test_setting_CD_2,
          SettingType.test_setting_CD_3
        ])
      }
    ]
  })
  DefaultSettingsFactory.registerTypeHandler(SettingType.test_setting_CI_5 as any, {
    label: 'secrets.createSSHCredWizard.btnVerifyConnection',
    settingRenderer: props => <DefaultSettingTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
  })
  test('test factory changes', async () => {
    const categeoryHandler = DefaultSettingsFactory.getCategoryHandler('CD')
    expect(categeoryHandler?.icon).toEqual('cd-main')
    const typeHandler = DefaultSettingsFactory.getTypeHandler(SettingType.test_setting_CI_5 as any)
    expect(typeHandler?.label).toEqual('secrets.createSSHCredWizard.btnVerifyConnection')
    const getCategoryNamesList = DefaultSettingsFactory.getCategoryNamesList()
    expect(getCategoryNamesList[0]).toEqual('CD')
    const getCategoryList = DefaultSettingsFactory.getCategoryList()
    expect(getCategoryList.get('CD')?.label).toEqual('common.purpose.cd.continuous')
    const getYupValidationForSetting = DefaultSettingsFactory.getYupValidationForSetting(
      SettingType.test_setting_CI_5 as any
    )
    expect(getYupValidationForSetting).toBeTruthy()
  })
})
