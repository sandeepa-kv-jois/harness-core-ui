/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { IconName } from '@harness/uicore'
import type {
  SettingCategory,
  SettingGroups,
  SettingType,
  YupValidation
} from '@default-settings/interfaces/SettingType.types'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { FeatureFlag } from '@common/featureFlags'
import type { SettingDTO } from 'services/cd-ng'

export interface SettingRendererProps {
  identifier: string
  onSettingSelectionChange: (val: string) => void
  onRestore: () => void
  settingValue: string
  allowedValues?: SettingDTO['allowedValues'] | undefined
  allSettings: Map<SettingType, SettingDTO>
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
}
export interface SettingHandler {
  label: keyof StringsMap
  settingRenderer: (props: SettingRendererProps) => React.ReactElement
  yupValidation: YupValidation
  featureFlag?: FeatureFlag
}
export interface GroupedSettings {
  groupName?: keyof StringsMap
  groupId?: SettingGroups
  settingTypes: Set<SettingType>
}
export interface SettingCategoryHandler {
  icon: IconName
  label: keyof StringsMap
  featureFlag?: FeatureFlag
  settings: GroupedSettings[]
}

class DefaultSettingsFactory {
  private map: Map<SettingType, SettingHandler>
  private settingCategoryMap: Map<SettingCategory, SettingCategoryHandler>

  constructor() {
    this.map = new Map()
    this.settingCategoryMap = new Map()
  }

  registerCategory(settingCategory: SettingCategory, handler: SettingCategoryHandler): void {
    this.settingCategoryMap.set(settingCategory, handler)
  }

  registerTypeHandler(settingType: SettingType, handler: SettingHandler): void {
    this.map.set(settingType, handler)
  }
  getCategoryList(): Map<SettingCategory, SettingCategoryHandler> {
    return this.settingCategoryMap
  }
  getCategoryNamesList(): SettingCategory[] {
    return Array.from(this.settingCategoryMap.keys())
  }

  getCategoryHandler(settingCategory: SettingCategory): SettingCategoryHandler | undefined {
    return this.settingCategoryMap.get(settingCategory)
  }

  getTypeHandler(settingType: SettingType): SettingHandler | undefined {
    return this.map.get(settingType)
  }
  getYupValidationForSetting(settingType: SettingType): YupValidation | undefined {
    return this.map.get(settingType)?.yupValidation
  }
}

export default new DefaultSettingsFactory()
