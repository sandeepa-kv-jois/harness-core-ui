import { Button, ButtonSize, ButtonVariation, Checkbox, Color, FontVariation, Text } from '@harness/uicore'
import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { SettingHandler } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingType } from '@default-settings/interfaces/SettingType.types'
import { useStrings } from 'framework/strings'
import type { SettingDTO, SettingRequestDTO } from 'services/cd-ng'
import cx from 'classnames'
import css from './SettingsCategorySection.module.scss'
interface SettingTypeRowProps {
  settingTypeHandler: SettingHandler
  onSelectionChange: (val: string) => void
  settingValue?: SettingDTO | undefined
  onRestore: () => void
  settingType: SettingType
  onAllowOverride: (checked: boolean) => void
  allowOverride: boolean
  errorMessage: string
  otherSettings?: Map<SettingType, SettingRequestDTO>

  allSettings: Map<SettingType, SettingDTO>
  isSubCategory: boolean
}
const SettingTypeRow: React.FC<SettingTypeRowProps> = ({
  settingTypeHandler,
  onSelectionChange,
  settingValue,
  settingType,
  onRestore,
  onAllowOverride,
  allowOverride,
  allSettings,
  errorMessage,
  isSubCategory
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
      <Text className={cx(isSubCategory && css.subCategoryLabel)} font={{ variation: FontVariation.BODY2 }}>
        {getString(label)}
      </Text>
      <div className={css.typeRenderer}>
        {settingRenderer({
          identifier: settingType,
          onSettingSelectionChange: onSelectionChange,
          onRestore,
          settingValue: settingValue || undefined,
          allSettings,
          setFieldValue
        })}
      </div>

      <span className={css.settingOverrideRestore}>
        {!settingValue?.isSettingEditable ? (
          <span />
        ) : (
          <Checkbox
            data-tooltip-id={'defaultSettingsFormOverrideAllow'}
            label={getString('defaultSettings.allowOverrides')}
            checked={allowOverride}
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              onAllowOverride(event.currentTarget.checked)
            }}
          />
        )}
        {settingValue?.value === settingValue?.defaultValue || !settingValue?.isSettingEditable ? (
          <span />
        ) : (
          <Button
            className={css.settingRestore}
            size={ButtonSize.SMALL}
            tooltipProps={{ dataTooltipId: 'defaultSettingsFormRestoreToDefault' }}
            icon="reset"
            iconProps={{ color: Color.BLUE_700 }}
            onClick={onRestore}
            text={getString('defaultSettings.restoreToDefault')}
            variation={ButtonVariation.LINK}
          />
        )}
      </span>
    </>
  )
}
export default SettingTypeRow
