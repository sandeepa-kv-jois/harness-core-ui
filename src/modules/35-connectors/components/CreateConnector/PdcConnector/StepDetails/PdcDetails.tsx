/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  StepProps,
  Container,
  ButtonVariation,
  HarnessDocTooltip,
  FormInput
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import UploadJSON from '../components/UploadJSON'

import css from '../CreatePdcConnector.module.scss'

interface PdcDetailsProps {
  name: string
  isEditMode: boolean
  onConnectorCreated: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo: ConnectorInfoDTO | void
}

export interface uploadHostItem {
  hostname: string
}
interface StepConfigureProps {
  closeModal?: () => void
  onSuccess?: () => void
  hosts?: string | string[]
  spec?: { hosts: string | any[] }
}

const PdcDetails: React.FC<StepProps<StepConfigureProps> & Partial<PdcDetailsProps>> = props => {
  const { prevStepData, nextStep } = props
  const { getString } = useStrings()

  const [hostsJSON, setHostsJSON] = useState([] as uploadHostItem[])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    const data = { ...formData }
    if (hostsJSON?.length > 0) {
      data.hosts = hostsJSON
    }
    nextStep?.({ ...prevStepData, ...data } as StepConfigureProps)
  }

  const initialFormValues = useMemo(() => {
    const hosts = prevStepData?.hosts || prevStepData?.spec?.hosts
    return {
      hosts: typeof hosts === 'string' ? hosts : hosts?.map?.((host: any) => host.hostname).join('\n')
    }
  }, [])

  return (
    <Layout.Vertical spacing="medium" className={css.secondStep}>
      <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'pdcHostDetails' }}>
        {getString('details')}
      </Text>
      <Formik initialValues={initialFormValues} formName="pdcDetailsForm" onSubmit={handleSubmit}>
        {formikProps => (
          <>
            <Container className={css.clusterWrapper}>
              <Layout.Horizontal className={css.hostContainer} spacing="xxlarge">
                <div className={css.manualHostContainer}>
                  <FormInput.TextArea
                    className={css.textInput}
                    name="hosts"
                    label={
                      <HarnessDocTooltip
                        tooltipId={'pdc-connector-hosts'}
                        labelText={getString('connectors.pdc.hosts')}
                      />
                    }
                  />
                </div>
                <span>{getString('common.orCaps')}</span>
                <UploadJSON
                  setJsonValue={json => {
                    setHostsJSON(json)
                    formikProps.setFieldValue('hosts', json.map(hostItem => hostItem.hostname).join('\n'))
                  }}
                />
              </Layout.Horizontal>
            </Container>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                variation={ButtonVariation.SECONDARY}
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="pdcBackButton"
              />
              <Button
                type="submit"
                onClick={formikProps.submitForm}
                variation={ButtonVariation.PRIMARY}
                text={getString('continue')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default PdcDetails
