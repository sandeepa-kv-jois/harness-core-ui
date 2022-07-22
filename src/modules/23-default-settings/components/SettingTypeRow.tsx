import { Button, ButtonSize, ButtonVariation, Checkbox, Color, Text } from '@harness/uicore'
import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { SettingHandler, SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingType } from '@default-settings/interfaces/SettingType.types'
import { useStrings } from 'framework/strings'
import type { SettingDTO, SettingRequestDTO } from 'services/cd-ng'

import css from './SettingsCategorySection.module.scss'
interface SettingTypeRowProps {
  settingTypeHandler: SettingHandler
  onSelectionChange: (val: string) => void
  settingValue?: string
  onRestore: () => void
  settingType: SettingType
  onAllowOverride: (checked: boolean) => void
  allowOverride: boolean
  allowedValues: SettingRendererProps['allowedValues']
  errorMessage: string
  otherSettings?: Map<SettingType, SettingRequestDTO>

  allSettings: Map<SettingType, SettingDTO>
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
  allSettings,
  errorMessage
}) => {
  const { label, settingRenderer, featureFlag } = settingTypeHandler

  const { setFieldValue, setFieldError } = useFormikContext()
  const { getString } = useStrings()
  let enableFeatureFlag = true
  const currentFeatureFlagsInSystem = useFeatureFlags()
  useEffect(() => {
    if (errorMessage) {
      setFieldError(settingType, errorMessage)
    }
  }, [errorMessage])
  if (featureFlag) {
    enableFeatureFlag = !!currentFeatureFlagsInSystem[featureFlag]
  }
  if (!enableFeatureFlag) {
    return null
  }

  return (
    <>
      <Text>{getString(label)}</Text>
      {settingRenderer({
        identifier: settingType,
        onSettingSelectionChange: onSelectionChange,
        onRestore,
        settingValue: settingValue || '',
        allowedValues,
        allSettings,
        setFieldValue
      })}
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
