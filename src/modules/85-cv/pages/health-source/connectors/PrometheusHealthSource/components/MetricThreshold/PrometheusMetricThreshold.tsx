import React from 'react'
import { Accordion, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import PrometheusMetricThresholdContent from './Components/PrometheusMetricThresholdContent'
import type {
  PrometheusMetricThresholdContextType,
  PrometheusMetricThresholdPropsType
} from './PrometheusMetricThreshold.types'

export const PrometheusMetricThresholdContext = React.createContext<PrometheusMetricThresholdContextType>(
  {} as PrometheusMetricThresholdContextType
)

PrometheusMetricThresholdContext.displayName = 'PrometheusMetricThresholdContext'

export default function PrometheusMetricThreshold({
  formikValues,
  groupedCreatedMetrics,
  setMetricThresholds
}: PrometheusMetricThresholdPropsType): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container margin={{ bottom: 'huge' }} padding="large">
      <Accordion activeId="advancedPrometheus">
        <Accordion.Panel
          id="advancedPrometheus"
          summary={getString('cv.monitoringSources.appD.advancedOptional')}
          details={
            <PrometheusMetricThresholdContext.Provider
              value={{ formikValues, groupedCreatedMetrics, setMetricThresholds }}
            >
              <PrometheusMetricThresholdContent />
            </PrometheusMetricThresholdContext.Provider>
          }
        ></Accordion.Panel>
      </Accordion>
    </Container>
  )
}
