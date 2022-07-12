/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FontVariation, Layout, Tab, Tabs, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import CommandBlock from '@ce/common/CommandBlock/CommandBlock'
import DownloadCLI from '../DownloadCLI/DownloadCLI'
import css from './RuleDetailsBody.module.scss'

interface CLITabContainerProps {
  ruleName: string
}

const DownloadCliStep = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Text className={css.sshStepIndicator} font={{ variation: FontVariation.H6 }}>
        {getString('ce.co.ruleDetails.sshTab.step1.indicator') + ':'}
      </Text>
      <Layout.Vertical spacing={'small'} className={css.sshStepText}>
        <Container>
          <Text font={{ variation: FontVariation.H6 }}>
            {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.download')}
          </Text>
          <Text font={{ variation: FontVariation.BODY }}>{getString('ce.co.ruleDetails.sshTab.step1.info')}</Text>
        </Container>
        <DownloadCLI showInfoText={false} />
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const ApplyCommandsStep = ({ ruleName }: { ruleName: string }) => {
  const { getString } = useStrings()
  return (
    <Container>
      <Layout.Horizontal>
        <Text className={css.sshStepIndicator} font={{ variation: FontVariation.H6 }}>
          {getString('ce.co.ruleDetails.sshTab.step2.indicator') + ':'}
        </Text>
        <Layout.Vertical spacing={'small'} className={css.sshStepText}>
          <Container>
            <Text font={{ variation: FontVariation.H6 }}>{getString('ce.co.ruleDetails.sshTab.step2.title')}</Text>
            <Text font={{ variation: FontVariation.BODY }}>{getString('ce.co.ruleDetails.sshTab.step2.info')}</Text>
          </Container>
          <Container className={css.sshTabs}>
            <Tabs id={'requirements'}>
              <Tab
                id={'ssh'}
                title="SSH"
                panel={
                  <CommandBlock
                    allowCopy
                    commandSnippet={`harness ssh --name ${ruleName} --user ubuntu -- <any_ssh_params>`}
                  />
                }
              />
              <Tab
                id="rdp"
                title="RDP"
                panel={<CommandBlock allowCopy commandSnippet={`harness rdp --name ${ruleName}`} />}
              />
              <Tab
                id="ssm"
                title="SSM"
                panel={
                  <CommandBlock
                    allowCopy
                    commandSnippet={`harness ssh --name ${ruleName} --user ubuntu -- <any_ssh_params>`}
                  />
                }
              />
              <Tab id="gcloud" title="gcloud" />
            </Tabs>
          </Container>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Container>
  )
}

const CLITabContainer: React.FC<CLITabContainerProps> = props => {
  const { getString } = useStrings()

  return (
    <Container className={css.tabRowContainer}>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H6 }}>{getString('ce.co.ruleDetails.sshTab.header')}</Text>
        <Text font={{ variation: FontVariation.BODY }}>{getString('ce.co.ruleDetails.sshTab.description')}</Text>
      </Layout.Vertical>
      <Layout.Vertical spacing="medium" margin={{ top: 'medium' }}>
        <DownloadCliStep />
        <ApplyCommandsStep ruleName={props.ruleName} />
      </Layout.Vertical>
    </Container>
  )
}

export default CLITabContainer
