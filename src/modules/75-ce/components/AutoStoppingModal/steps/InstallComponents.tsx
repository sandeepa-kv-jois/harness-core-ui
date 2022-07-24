/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { Button, ButtonVariation, Layout, StepProps, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'

import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { CE_K8S_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { downloadYamlAsFile } from '@common/utils/downloadYamlUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import EnableAutoStoppingHeader from '@ce/components/CloudVisibilityModal/steps/EnableAutoStoppingStep'

import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useMutateAsGet } from '@common/hooks'
import { useCloudCostK8sClusterSetup } from 'services/ce'
import PermissionYAMLPreview from '@connectors/components/CreateConnector/CEK8sConnector/PermissionYAMLPreview'

import css from '../AutoStoppingModal.module.scss'

interface InstallComponentsProps {
  name: string
  isCloudReportingModal?: boolean
}

const yamlFileName = 'ccm-kubernetes.yaml'

const InstallComponents: React.FC<StepProps<ConnectorInfoDTO> & InstallComponentsProps> = ({
  previousStep,
  prevStepData,
  nextStep,
  isCloudReportingModal
}) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { triggerExtension } = useContext(DialogExtensionContext)
  const { accountId } = useParams<AccountPathProps>()

  useStepLoadTelemetry(CE_K8S_CONNECTOR_CREATION_EVENTS.LOAD_SECRET_CREATION)

  const connector = prevStepData

  const { data: permissionsYaml, loading: yamlLoading } = useMutateAsGet(useCloudCostK8sClusterSetup, {
    queryParams: {
      accountIdentifier: accountId
    },
    body: {
      connectorIdentifier: connector?.spec?.connectorRef,
      featuresEnabled: connector?.spec?.featuresEnabled,
      ccmConnectorIdentifier: connector?.identifier
    }
  })

  const handleDownload = async () => {
    trackEvent(CE_K8S_CONNECTOR_CREATION_EVENTS.DOWNLOAD_YAML, {})
    await downloadYamlAsFile(permissionsYaml, yamlFileName)
  }

  return (
    <Layout.Vertical height={'100%'} spacing={'medium'}>
      {isCloudReportingModal ? <EnableAutoStoppingHeader /> : null}
      <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
        {`ii. ${getString('ce.cloudIntegration.autoStoppingModal.installComponents.title')}`}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        <p>{getString('ce.cloudIntegration.autoStoppingModal.installComponents.desc')}</p>
        <p>{`1. ${getString('connectors.ceK8.providePermissionsStep.fileDescription.info1')}`}</p>
        <p>{`2. ${getString('connectors.ceK8.providePermissionsStep.fileDescription.info2')}`}</p>
        <p>{`3. ${getString('connectors.ceK8.providePermissionsStep.fileDescription.info3')}`}</p>
        <p>{`4. ${getString('connectors.ceK8.providePermissionsStep.fileDescription.info4')}`}</p>
      </Text>
      <div className={css.container}>
        <div className={css.downloadYaml}>
          <Text color={Color.GREY_900} margin={{ right: 'xlarge' }}>
            {getString('ce.cloudIntegration.autoStoppingModal.createSecret.step1')}
          </Text>
          <Button
            loading={yamlLoading}
            rightIcon="launch"
            variation={ButtonVariation.SECONDARY}
            margin={{ right: 'medium' }}
            text={getString('connectors.ceK8.providePermissionsStep.downloadYamlBtnText')}
            onClick={handleDownload}
          />
          <Button
            loading={yamlLoading}
            rightIcon="launch"
            variation={ButtonVariation.SECONDARY}
            text={getString('ce.cloudIntegration.autoStoppingModal.installComponents.previewYaml')}
            onClick={() =>
              triggerExtension(<PermissionYAMLPreview yamlContent={permissionsYaml as unknown as string} />)
            }
          />
        </div>
      </div>
      <div>
        <Button
          icon="chevron-left"
          text={getString('back')}
          variation={ButtonVariation.SECONDARY}
          margin={{ right: 'medium' }}
          onClick={() => previousStep?.()}
        />
        <Button
          rightIcon="chevron-right"
          text={getString('continue')}
          variation={ButtonVariation.PRIMARY}
          onClick={() => nextStep?.(connector)}
        />
      </div>
    </Layout.Vertical>
  )
}

export default InstallComponents
