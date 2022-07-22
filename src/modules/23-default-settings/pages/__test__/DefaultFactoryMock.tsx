import React from 'react'
import * as Yup from 'yup'
import { FormInput } from '@harness/uicore'
import type { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'

const MockDefaultSettingTextbox: React.FC<SettingRendererProps> = ({ onSettingSelectionChange, identifier }) => {
  return (
    <>
      <span>mockbox</span>
      <FormInput.Text
        name={identifier}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onSettingSelectionChange(e.target.value)
        }}
      />
    </>
  )
}
export const getCategoryNamesList = () => {
  return ['CD', 'CI', 'CORE']
}
export const SettingType = {
  ACCOUNT: 'ACCOUNT',
  TEST_SETTING_ID: 'test_setting_id',
  TEST_SETTING_ID_2: 'test_setting_id_2',
  TEST_SETTING_CI: 'test_setting_CI',
  test_setting_CORE_1: 'test_setting_CORE_1',
  test_setting_CORE_2: 'test_setting_CORE_2',
  test_setting_CD_1: 'test_setting_CD_1',
  test_setting_CD_2: 'test_setting_CD_2',
  test_setting_CD_3: 'test_setting_CD_3',
  test_setting_CI_1: 'test_setting_CI_1',
  test_setting_CI_2: 'test_setting_CI_2',
  test_setting_CI_3: 'test_setting_CI_3',
  test_setting_CI_4: 'test_setting_CI_4',
  test_setting_CI_5: 'test_setting_CI_5',
  test_setting_CI_6: 'test_setting_CI_6',
  test_setting_CI_7: 'test_setting_CI_7'
}
export const SettingGroups = {
  group_2: 'group_2',
  group_1: 'group_1'
}

export const getCategoryHandler = (category: string) => {
  switch (category) {
    case 'CD': {
      return {
        icon: 'cd-main',
        label: 'common.purpose.cd.continuous',
        settings: [
          {
            settingTypes: new Set([
              SettingType.test_setting_CD_1,
              SettingType.test_setting_CD_2,
              SettingType.test_setting_CD_3
            ])
          }
        ]
      }
    }
    case 'CI': {
      return {
        icon: 'ci-main',
        label: 'common.purpose.ci.continuous',
        settings: [
          {
            settingTypes: new Set([SettingType.test_setting_CI_6, SettingType.test_setting_CI_7])
          },
          {
            groupId: SettingGroups.group_1,
            groupName: 'addStepGroup',
            settingTypes: new Set([
              SettingType.test_setting_CI_5,
              SettingType.test_setting_CI_2,
              SettingType.test_setting_CI_3
            ])
          },
          {
            groupId: SettingGroups.group_2,
            groupName: 'auditTrail.delegateGroups',
            settingTypes: new Set([SettingType.test_setting_CI_5, SettingType.test_setting_CI_4])
          }
        ]
      }
    }
    case 'CORE': {
      return {
        icon: 'access-control',
        label: 'account',
        settings: [
          {
            settingTypes: new Set([
              SettingType.TEST_SETTING_ID,
              SettingType.TEST_SETTING_ID_2,
              SettingType.TEST_SETTING_CI,
              SettingType.ACCOUNT,
              SettingType.TEST_SETTING_CI,
              SettingType.test_setting_CD_1,
              SettingType.test_setting_CD_2,
              SettingType.test_setting_CD_3,
              SettingType.test_setting_CORE_1,
              SettingType.test_setting_CORE_2
            ])
          }
        ]
      }
    }
  }
}
export const getYupValidationForSetting = () => {
  return Yup.string().max(15, 'Must be 15 characters or less')
}

// const DependendentValues: React.FC<SettingRendererProps> = ({
//     allSettings,
//     setFieldValue,

//     ...otherProps
//   }) => {
//     const isEvenorOdd = (number: string | undefined) => {
//       if (isUndefined(number)) {
//         return ''
//       }

//       return parseInt(number) % 2 ? 'Odd' : 'Even'
//     }

//     useEffect(() => {
//       setFieldValue(otherProps.identifier, isEvenorOdd(allSettings.get(SettingType.test_setting_CI_2)?.value))
//     }, [allSettings.get(SettingType.test_setting_CI_2)?.value])
//     return (
//       <span>
//         <span>Depeneedent</span>
//         <DefaultSettingTextbox setFieldValue={setFieldValue} {...otherProps} allSettings={allSettings} />
//       </span>
//     )
//   }
export const getTypeHandler = (setting: string) => {
  return {
    label: setting,
    settingRenderer: (props: any) => <MockDefaultSettingTextbox {...props} />,
    yupValidation: Yup.string().max(15, 'Must be 15 characters or less').required('Required')
  }
}
export const responseData = {
  status: 'SUCCESS',
  data: [
    {
      setting: {
        identifier: 'test_setting_CD_1',
        name: 'Test CD setting 1',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CD',
        groupIdentifier: null,
        valueType: 'Number',
        allowedValues: null,
        allowOverrides: false,
        value: '5',
        defaultValue: '8',
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1658463769101
    },
    {
      setting: {
        identifier: 'test_setting_CD_2',
        name: 'Test CD setting 2',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CD',
        groupIdentifier: null,
        valueType: 'Boolean',
        allowedValues: null,
        allowOverrides: true,
        value: 'false',
        defaultValue: 'true',
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1658429205649
    },
    {
      setting: {
        identifier: 'test_setting_CD_3',
        name: 'Test CD setting 3',
        orgIdentifier: null,
        projectIdentifier: null,
        category: 'CD',
        groupIdentifier: null,
        valueType: 'String',
        allowedValues: null,
        allowOverrides: true,
        value: '6',
        defaultValue: null,
        settingSource: 'ACCOUNT',
        isSettingEditable: true
      },
      lastModifiedAt: 1658429205654
    }
  ],
  metaData: null,
  correlationId: '649be947-1e50-47aa-a9cf-6de5c06d8bf8'
}
