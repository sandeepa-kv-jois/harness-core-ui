import React from 'react'
import { Formik, FormikForm, Container, Text } from '@wings-software/uikit'
import { object as yupObject } from 'yup'
import {
  ConnectorSelection,
  SelectOrCreateConnectorFieldNames
} from '@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import i18n from './SelectKubernetesConnector.i18n'
import type { KubernetesActivitySourceInfo } from '../KubernetesActivitySourceUtils'
import { buildKubernetesActivitySourceInfo } from '../KubernetesActivitySourceUtils'
import css from './SelectKubernetesConnector.module.scss'

interface SelectKubernetesConnectorProps {
  onSubmit: (data: KubernetesActivitySourceInfo) => void
  onPrevious: () => void
  data?: KubernetesActivitySourceInfo
}

const ValidationSchema = yupObject().shape({
  [SelectOrCreateConnectorFieldNames.CONNECTOR_REF]: yupObject().required('Connector Reference is required.')
})

export function SelectKubernetesConnector(props: SelectKubernetesConnectorProps): JSX.Element {
  const { onPrevious, onSubmit, data } = props
  return (
    <Formik
      initialValues={data || buildKubernetesActivitySourceInfo()}
      validationSchema={ValidationSchema}
      onSubmit={values => onSubmit({ ...values })}
    >
      {formikProps => (
        <FormikForm id="onBoardingForm">
          <Container className={css.main}>
            <Text font={{ size: 'medium' }} margin={{ top: 'large', bottom: 'large' }}>
              {i18n.selectConnectorHeading}
            </Text>
            <CVSelectionCard
              isSelected={true}
              className={css.monitoringCard}
              iconProps={{
                name: 'service-kubernetes',
                size: 40
              }}
              cardLabel={i18n.iconLabel}
              renderLabelOutsideCard={true}
            />
            <ConnectorSelection
              connectorType="K8sCluster"
              value={formikProps.values.connectorRef}
              createConnectorText={i18n.createConnectorText}
              firstTimeSetupText={i18n.firstTimeSetupText}
              connectToMonitoringSourceText={i18n.kubernetesConnectionText}
              onSuccess={connectorInfo => {
                formikProps.setFieldValue(SelectOrCreateConnectorFieldNames.CONNECTOR_REF, {
                  label: connectorInfo?.connector?.name,
                  value: connectorInfo?.connector?.identifier
                })
              }}
            />
          </Container>
          <SubmitAndPreviousButtons onPreviousClick={onPrevious} />
        </FormikForm>
      )}
    </Formik>
  )
}
