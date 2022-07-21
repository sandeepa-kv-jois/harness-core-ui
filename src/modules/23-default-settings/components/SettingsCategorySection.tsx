import {
  Accordion,
  Card,
  getErrorInfoFromErrorObject,
  useToaster,
  Text,
  FontVariation,
  Container,
  Icon
} from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getSettingsListPromise, SettingDTO, SettingRequestDTO } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SettingCategory, SettingType, SettingYupValidation } from '../interfaces/SettingType'
import SettingCategorySectionContents from './SettingCategorySectionContents'
import css from './SettingsCategorySection.module.scss'

interface SettingsCategorySectionProps {
  settingCategory: SettingCategory
  onSettingChange: (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => void
  updateAllSettings: (settings: Map<SettingType, SettingDTO>) => void
  allSettings: Map<SettingType, SettingDTO>
  settingErrorMessages: Map<SettingType, string>
  updateValidationSchema: (val: SettingYupValidation) => void
}

const SettingsCategorySection: React.FC<SettingsCategorySectionProps> = ({
  settingCategory,
  onSettingChange,
  settingErrorMessages,
  updateValidationSchema,
  allSettings,
  updateAllSettings
}) => {
  const { setFieldValue } = useFormikContext()

  const settingCategoryHandler = DefaultSettingsFactory.getSettingCategoryHandler(settingCategory)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & ModulePathParams>()

  const { getString } = useStrings()

  let enableFeatureFlag = true
  const currentFeatureFlagsInSystem = useFeatureFlags()

  const [refinedSettingTypes, updateSettingTypes] = useState<Set<SettingType>>(new Set())

  const { showError } = useToaster()
  const [loadingSettingTypes, updateLoadingSettingTypes] = useState(false)
  const categorySectionOpen = async () => {
    if (!refinedSettingTypes.size) {
      updateLoadingSettingTypes(true)
      try {
        const data = await getSettingsListPromise({
          queryParams: { accountIdentifier: accountId, category: settingCategory, orgIdentifier, projectIdentifier }
        })
        const refinedSettingTypesTemp: Set<SettingType> = new Set()
        const categorySettings = new Map()
        const validationsSchema: SettingYupValidation = {}
        data?.data?.forEach(val => {
          const registeredSettingsOnUI = settingCategoryHandler?.settings.reduce((registerdSet, group) => {
            registerdSet = new Set([...registerdSet, ...group.settingTypes])
            return registerdSet
          }, new Set())
          categorySettings.set(val.setting.identifier as SettingType, val.setting)
          setFieldValue(val.setting.identifier, val.setting.value)
          validationsSchema[val.setting.identifier as SettingType] = DefaultSettingsFactory.getYupValidationForSetting(
            val.setting.identifier as SettingType
          )
          if (registeredSettingsOnUI?.has(val.setting.identifier)) {
            refinedSettingTypesTemp.add(val.setting.identifier as SettingType)
          }
        })
        updateAllSettings(categorySettings)
        updateValidationSchema(validationsSchema)
        updateSettingTypes(refinedSettingTypesTemp)
      } catch (error) {
        showError(getErrorInfoFromErrorObject(error))
      } finally {
        updateLoadingSettingTypes(false)
      }
    }
  }
  const updateChagnedSettingLocal = (settingType: SettingType, settingTypeDTO: SettingDTO) => {
    const changedSetting = new Map()
    changedSetting.set(settingType, settingTypeDTO)
    updateAllSettings(changedSetting)
  }

  const onSelectionChange = (settingType: SettingType, val: string) => {
    if (allSettings.get(settingType)) {
      let selectedSettingTypeDTO = allSettings.get(settingType)
      if (selectedSettingTypeDTO) {
        selectedSettingTypeDTO = {
          ...selectedSettingTypeDTO,
          value: val
        }
        setFieldValue(settingType, val)
        onSettingChange(settingType, selectedSettingTypeDTO, 'UPDATE')
        updateChagnedSettingLocal(settingType, selectedSettingTypeDTO)
      }
    }
  }

  const onAllowOverride = (checked: boolean, settingType: SettingType) => {
    if (allSettings.get(settingType)) {
      let selectedSettingTypeDTO = allSettings.get(settingType)
      if (selectedSettingTypeDTO) {
        selectedSettingTypeDTO = {
          ...selectedSettingTypeDTO,
          allowOverrides: checked
        }
        onSettingChange(settingType, selectedSettingTypeDTO, 'UPDATE')
        updateChagnedSettingLocal(settingType, selectedSettingTypeDTO)
      }
    }
  }

  const onRestore = (settingType: SettingType) => {
    if (allSettings.get(settingType)) {
      let selectedSettingTypeDTO = allSettings.get(settingType)
      if (selectedSettingTypeDTO) {
        selectedSettingTypeDTO = {
          ...selectedSettingTypeDTO,
          value: selectedSettingTypeDTO.defaultValue
        }
        setFieldValue(settingType, selectedSettingTypeDTO.defaultValue)
        onSettingChange(settingType, selectedSettingTypeDTO, 'RESTORE')
        updateChagnedSettingLocal(settingType, selectedSettingTypeDTO)
      }
    }
  }

  if (!settingCategoryHandler) {
    return null
  }
  const { label, settings: registeredGroupedSettings, featureFlag, icon } = settingCategoryHandler
  if (featureFlag) {
    enableFeatureFlag = !!currentFeatureFlagsInSystem[featureFlag]
  }

  if (!enableFeatureFlag) {
    return null
  }
  return (
    <Card className={css.summaryCard}>
      <Accordion
        summaryClassName={css.summarySetting}
        detailsClassName={css.detailSettings}
        onChange={openTabId => {
          if (openTabId) {
            categorySectionOpen()
          }
        }}
        collapseProps={{ keepChildrenMounted: false }}
      >
        <Accordion.Panel
          details={
            loadingSettingTypes ? (
              <Container flex={{ justifyContent: 'center' }}>
                <Icon name="spinner" size={30} />
              </Container>
            ) : refinedSettingTypes.size ? (
              <SettingCategorySectionContents
                allSettings={allSettings}
                onSelectionChange={onSelectionChange}
                onRestore={onRestore}
                onAllowOverride={onAllowOverride}
                settingsTypesSet={refinedSettingTypes}
                settingErrorMessages={settingErrorMessages}
                registeredGroupedSettings={registeredGroupedSettings}
              />
            ) : (
              <Container flex={{ justifyContent: 'center' }}>
                <Text font={{ variation: FontVariation.BODY2 }}>{getString('defaultSettings.noSettingToDisplay')}</Text>
              </Container>
            )
          }
          id={settingCategory}
          summary={
            <Text font={{ variation: FontVariation.H5 }} icon={icon} iconProps={{ margin: { right: 'small' } }}>
              {getString(label)}
            </Text>
          }
        />
      </Accordion>
    </Card>
  )
}
export default SettingsCategorySection
