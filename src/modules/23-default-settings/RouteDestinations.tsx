import React from 'react'
import { RouteWithLayout } from '@common/router'
import SettingsList from '@default-settings/pages/SettingsList'
import routes from '@common/RouteDefinitions'

import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
DefaultSettingsFactory.registerCategory('CD', {
  icon: 'cd-main',
  label: 'common.purpose.cd.continuous',
  settings: []
})
DefaultSettingsFactory.registerCategory('CI', {
  icon: 'ci-main',
  label: 'common.purpose.ci.continuous',
  settings: []
})
DefaultSettingsFactory.registerCategory('CORE', {
  icon: 'access-control',
  label: 'account',
  settings: []
})

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toDefaultSettings({ ...accountPathProps })} exact>
      <SettingsList />
    </RouteWithLayout>
  </>
)
export const DefaultSettingsRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => (
  <>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routes.toDefaultSettings({
        ...accountPathProps,
        ...projectPathProps,
        ...moduleParams
      })}
    >
      <SettingsList />
    </RouteWithLayout>
  </>
)
