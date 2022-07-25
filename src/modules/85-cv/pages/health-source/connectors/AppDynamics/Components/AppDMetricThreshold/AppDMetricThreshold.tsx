import React from 'react'
import { Accordion, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import AppDMetricThresholdContent from './Components/AppDMetricThresholdContent'
import type { AppDMetricThresholdContextType, AppDMetricThresholdPropsType } from './AppDMetricThreshold.types'

export const AppDMetricThresholdContext = React.createContext<AppDMetricThresholdContextType>(
  {} as AppDMetricThresholdContextType
)

AppDMetricThresholdContext.displayName = 'AppDMetricThresholdContext'

export default function AppDMetricThreshold({
  formikValues,
  metricPacks,
  groupedCreatedMetrics,
  setNonCustomFeilds
}: AppDMetricThresholdPropsType): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container margin={{ bottom: 'huge' }} padding="large">
      <Accordion activeId="advancedAppD">
        <Accordion.Panel
          id="advancedAppD"
          summary={getString('cv.monitoringSources.appD.advancedOptional')}
          details={
            <AppDMetricThresholdContext.Provider
              value={{ formikValues, metricPacks, groupedCreatedMetrics, setNonCustomFeilds }}
            >
              <AppDMetricThresholdContent />
            </AppDMetricThresholdContext.Provider>
          }
        ></Accordion.Panel>
      </Accordion>
    </Container>
  )
}
