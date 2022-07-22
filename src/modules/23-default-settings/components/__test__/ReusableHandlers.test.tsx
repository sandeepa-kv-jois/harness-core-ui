import React from 'react'
import { noop } from 'lodash-es'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import {
  DefaultSettingNumberTextbox,
  DefaultSettingCheckBoxWithTrueAndFalse,
  DefaultSettingStringDropDown,
  DefaultSettingTextbox
} from '@default-settings/components/ReusableHandlers'
import type { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { StringsMap } from 'framework/strings/StringsContext'
describe('Reusable Components', () => {
  const props: SettingRendererProps = {
    setFieldValue: jest.fn(),
    allSettings: new Map(),
    identifier: 'abcd',
    onRestore: jest.fn(),
    onSettingSelectionChange: jest.fn(),
    settingValue: 'abcd',
    allowedValues: ['abcd', 'bcd']
  }

  test('text box', () => {
    const renderObj = render(
      <Formik initialValues={{ textbx: 'abcd' }} onSubmit={noop} formName="testing">
        <DefaultSettingTextbox {...props} identifier="textbx" />
      </Formik>
    )

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'textbx', value: 'user name' })

    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingCheckBoxWithTrueAndFalse', () => {
    const renderObj = render(<DefaultSettingCheckBoxWithTrueAndFalse {...props} identifier="check" />)

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.CHECKBOX, fieldId: 'check', value: 'false' })
    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingCheckBoxWithTrueAndFalse with different labels', () => {
    const renderObj = render(
      <DefaultSettingCheckBoxWithTrueAndFalse
        {...props}
        identifier="check"
        falseLabel={'new false' as keyof StringsMap}
        trueLabel={'new true' as keyof StringsMap}
      />
    )

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.CHECKBOX, fieldId: 'check', value: 'false' })
    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingStringDropDown', () => {
    const renderObj = render(<DefaultSettingStringDropDown {...props} identifier="drpdown" />)

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.SELECT, fieldId: 'drpdown', value: 'bcd' })
    expect(container).toMatchSnapshot()
  })
  test('no DefaultSettingStringDropDown', () => {
    const renderObj = render(<DefaultSettingStringDropDown {...props} identifier="drpdown" allowedValues={undefined} />)

    const { container } = renderObj
    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingTextbox', () => {
    const renderObj = render(<DefaultSettingNumberTextbox {...props} identifier="nbr" />)

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'nbr', value: '3' })
    expect(container).toMatchSnapshot()
  })
})
