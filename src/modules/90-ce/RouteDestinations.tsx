import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import routes from '@common/RouteDefinitions'
import SidebarProvider from '@common/navigation/SidebarProvider'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import CESideNav from '@ce/components/CESideNav/CESideNav'
import { ModuleName, useAppStore } from 'framework/exports'
import CEHomePage from './pages/home/CEHomePage'
import CEDashboardPage from './pages/dashboard/CEDashboardPage'
import CECODashboardPage from './pages/co-dashboard/CECODashboardPage'
import CECOCreateGatewayPage from './pages/co-create-gateway/CECOCreateGatewayPage'

const RedirectToCEHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCEHome(params)} />
}
const RedirectToCEProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CD)) {
    return <Redirect to={routes.toCECODashboard(params)} />
  } else {
    return <Redirect to={routes.toCDHome(params)} />
  }
}

export default (
  <Route path={routes.toCE({ ...accountPathProps })}>
    <SidebarProvider navComponent={CESideNav} subtitle="CONTINUOUS" title="Efficiency">
      <Route path={routes.toCE({ ...accountPathProps })} exact>
        <RedirectToCEHome />
      </Route>
      <Route path={routes.toCDProject({ ...accountPathProps, ...projectPathProps })} exact>
        <RedirectToCEProject />
      </Route>
      <RouteWithLayout path={routes.toCEHome({ ...accountPathProps })} exact>
        <CEHomePage />
      </RouteWithLayout>
      <RouteWithLayout path={routes.toCEDashboard({ ...accountPathProps, ...projectPathProps })} exact>
        <CEDashboardPage />
      </RouteWithLayout>
      <RouteWithLayout path={routes.toCECODashboard({ ...accountPathProps, ...projectPathProps })} exact>
        <CECODashboardPage />
      </RouteWithLayout>
      <RouteWithLayout path={routes.toCECOCreateGateway({ ...accountPathProps, ...projectPathProps })} exact>
        <CECOCreateGatewayPage />
      </RouteWithLayout>
    </SidebarProvider>
  </Route>
)
