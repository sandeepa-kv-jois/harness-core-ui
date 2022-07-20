import { Button, ButtonSize, ButtonVariation, Checkbox, Color, Layout, Text } from '@harness/uicore'
import React from 'react'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { SettingHandler, SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingType } from '@default-settings/interfaces/SettingType'
import { useStrings } from 'framework/strings'
import type { SettingRequestDTO } from 'services/cd-ng'

import css from './SettingsCategorySection.module.scss'
import { useFormikContext } from 'formik'
interface SettingTypeRowProps {
  settingTypeHandler: SettingHandler
  onSelectionChange: (val: string) => void
  settingValue?: any
  onRestore: () => void
  settingType: SettingType
  onAllowOverride: (checked: boolean) => void
  allowOverride: boolean
  allowedValues: SettingRendererProps['allowedValues']
  otherSettingsWhichAreChanged: Map<SettingType, SettingRequestDTO>
  errorMessage: string
  otherSettings?: Map<SettingType, SettingRequestDTO>
}
const SettingTypeRow: React.FC<SettingTypeRowProps> = ({
  settingTypeHandler,
  onSelectionChange,
  settingValue,
  settingType,
  onRestore,
  onAllowOverride,
  allowOverride,
  allowedValues,
  otherSettingsWhichAreChanged,
  errorMessage
}) => {
  const { label, settingRenderer, featureFlag } = settingTypeHandler

  const { setFieldValue, values } = useFormikContext()
  console.log(values)
  const { getString } = useStrings()
  let enableFeatureFlag = true
  if (featureFlag) {
    enableFeatureFlag = useFeatureFlag(featureFlag)
  }
  if (!enableFeatureFlag) {
    return null
  }

  return (
    <>
      <Text>{getString(label)}</Text>
      <Layout.Vertical>
        {settingRenderer &&
          settingRenderer({
            identifier: settingType,
            onSettingSelectionChange: onSelectionChange,
            onRestore,
            settingValue,
            allowedValues,
            otherSettingsWhichAreChanged,
            setFieldValue
          })}
        {errorMessage && (
          <Text lineClamp={1} intent="danger">
            {errorMessage}
          </Text>
        )}
      </Layout.Vertical>
      <span className={css.settingOverrideRestore}>
        <Checkbox
          label={getString('defaultSettings.allowOverrides')}
          checked={allowOverride}
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            onAllowOverride(event.currentTarget.checked)
          }}
        />
        <Button
          className={css.settingRestore}
          size={ButtonSize.SMALL}
          icon="reset"
          iconProps={{ color: Color.BLUE_700 }}
          onClick={onRestore}
          text={getString('defaultSettings.restoreToDefault')}
          variation={ButtonVariation.LINK}
        />
      </span>
    </>
  )
}
export default SettingTypeRow
