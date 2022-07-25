import React from 'react'
import { FontVariation, Text } from '@harness/uicore'
import type { SettingType } from '@default-settings/interfaces/SettingType.types'

import DefaultSettingsFactory, { GroupedSettings } from '@default-settings/factories/DefaultSettingsFactory'
import type { SettingDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import SettingTypeRow from './SettingTypeRow'
import css from './SettingsCategorySection.module.scss'
interface SettingCategorySectionContentsProps {
  settingsTypesSet: Set<SettingType> | undefined
  onSelectionChange: (settingType: SettingType, val: string) => void
  onRestore: (settingType: SettingType) => void
  onAllowOverride: (val: boolean, settingType: SettingType) => void
  settingErrorMessages: Map<SettingType, string>
  registeredGroupedSettings: GroupedSettings[]

  allSettings: Map<SettingType, SettingDTO>
}
const SettingCategorySectionContents: React.FC<SettingCategorySectionContentsProps> = ({
  settingsTypesSet,
  onRestore,
  onSelectionChange,
  onAllowOverride,
  allSettings,
  settingErrorMessages,
  registeredGroupedSettings
}) => {
  const { getString } = useStrings()
  if (!settingsTypesSet) {
    return null
  }
  const onSelectionChangeLocal = (settingType: SettingType, val: string) => {
    if (onSelectionChange) {
      onSelectionChange(settingType, val)
    }
  }
  const onRestoreLocal = (settingType: SettingType) => {
    if (onRestore) {
      onRestore(settingType)
    }
  }
  const GroupHeader: React.FC<{ groupName: keyof StringsMap }> = ({ groupName }) => (
    <>
      <Text font={{ variation: FontVariation.TINY }} >{getString(groupName).toUpperCase()}</Text>
      <span></span> <span></span>
    </>
  )
  return (
    <div className={css.settingTable}>
      {registeredGroupedSettings.reduce((settingsArray: (JSX.Element | null)[], registeredGroupedSetting) => {
        if (registeredGroupedSetting.groupName) {
          settingsArray.push(<GroupHeader groupName={registeredGroupedSetting.groupName} />)
        }

        const filteredGroupSettings = Array.from(registeredGroupedSetting.settingTypes.values()).map(settingTypeKey => {
          const settingTypeHandler = DefaultSettingsFactory.getTypeHandler(settingTypeKey)
          if (!settingTypeHandler || !settingsTypesSet.has(settingTypeKey)) {
            return null
          }
          return (
            <SettingTypeRow
              key={settingTypeKey}
              allSettings={allSettings}
              settingType={settingTypeKey}
              onRestore={() => onRestoreLocal(settingTypeKey)}
              settingTypeHandler={settingTypeHandler}
              settingValue={allSettings.get(settingTypeKey)}
              onSelectionChange={(val: string) => onSelectionChangeLocal(settingTypeKey, val)}
              onAllowOverride={(checked: boolean) => {
                onAllowOverride(checked, settingTypeKey)
              }}
              allowOverride={!!allSettings.get(settingTypeKey)?.allowOverrides}
              errorMessage={settingErrorMessages.get(settingTypeKey) || ''}
              isSubCategory={!!registeredGroupedSetting.groupName}
            />
          )
        })

        settingsArray = settingsArray.concat(filteredGroupSettings)

        return settingsArray
      }, [])}
    </div>
  )
}
export default SettingCategorySectionContents
