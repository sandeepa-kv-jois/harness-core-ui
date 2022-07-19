/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  Container,
  Text,
  FormInput,
  MultiTypeInputType,
  getMultiTypeFromValue,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { HealthSourceServices } from './SelectHealthSourceServices.constant'
import { RiskProfile } from './components/RiskProfile/RiskProfile'
import type { SelectHealthSourceServicesProps } from './SelectHealthSourceServices.types'
import { getTypeOfInput } from '../../connectors/AppDynamics/AppDHealthSource.utils'
import css from './SelectHealthSourceServices.module.scss'

export default function SelectHealthSourceServices({
  values,
  metricPackResponse,
  labelNamesResponse,
  hideServiceIdentifier = false,
  hideCV,
  hideSLIAndHealthScore,
  isTemplate,
  expressions,
  showOnlySLI = false,
  isConnectorRuntimeOrExpression
}: SelectHealthSourceServicesProps): JSX.Element {
  const { getString } = useStrings()

  const [metricPathMultiType, setMetricPathMultiType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(values.serviceInstanceMetricPath)
  )

  useEffect(() => {
    if (values.serviceInstanceMetricPath) {
      setMetricPathMultiType(getTypeOfInput(values.serviceInstanceMetricPath))
    }
  }, [values.serviceInstanceMetricPath])

  const { continuousVerification, healthScore, serviceInstance, riskCategory } = values
  return (
    <Container className={css.main}>
      <Container className={css.checkBoxGroup}>
        <Text tooltipProps={{ dataTooltipId: 'assignLabel' }} className={css.groupLabel}>
          {getString('cv.monitoredServices.assignLabel')}
        </Text>
        {!hideSLIAndHealthScore ? (
          <>
            <FormInput.CheckBox label={getString('cv.slos.sli')} name={HealthSourceServices.SLI} />
            <FormInput.CheckBox
              label={getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
              name={HealthSourceServices.HEALTHSCORE}
            />
          </>
        ) : null}
        {showOnlySLI && <FormInput.CheckBox label={getString('cv.slos.sli')} name={HealthSourceServices.SLI} />}
        {!hideCV ? (
          <FormInput.CheckBox
            label={getString('cv.monitoredServices.continuousVerification')}
            name={HealthSourceServices.CONTINUOUS_VERIFICATION}
          />
        ) : null}
        {isTemplate && values.continuousVerification && Boolean(labelNamesResponse) === false && (
          <FormInput.MultiTextInput
            key={metricPathMultiType}
            name={'serviceInstanceMetricPath'}
            label="ServiceInstanceLabel"
            onChange={(_value, _valueType, multiType) => {
              if (multiType !== metricPathMultiType) {
                setMetricPathMultiType(multiType)
              }
            }}
            multiTextInputProps={{
              expressions,
              value: values.serviceInstanceMetricPath,
              multitypeInputValue: metricPathMultiType,
              defaultValue: RUNTIME_INPUT_VALUE,
              allowableTypes: [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            }}
          />
        )}
      </Container>
      {(continuousVerification || healthScore) && (
        <RiskProfile
          isTemplate={isTemplate}
          expressions={expressions}
          metricPackResponse={metricPackResponse}
          labelNamesResponse={labelNamesResponse}
          continuousVerificationEnabled={continuousVerification && !hideServiceIdentifier}
          serviceInstance={serviceInstance}
          riskCategory={riskCategory}
          isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
        />
      )}
    </Container>
  )
}
