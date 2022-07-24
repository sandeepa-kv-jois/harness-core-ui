/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text, FontVariation, Icon, Layout, Button, ButtonVariation, Container } from '@harness/uicore'
import type { IconProps } from '@harness/icons'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import css from './GetStartedWithCD.module.scss'

export default function GetStartedWithCI(): React.ReactElement {
  const { getString } = useStrings()

  const renderBuildPipelineStep = React.useCallback(
    ({ iconProps, label, isLastStep }: { iconProps: IconProps; label: keyof StringsMap; isLastStep?: boolean }) => (
      <Layout.Horizontal flex padding={{ right: 'xsmall' }} spacing="small">
        <Icon name={iconProps.name} size={iconProps.size} className={iconProps.className} />
        <Text font={{ size: 'small' }} padding={{ left: 'xsmall', right: 'xsmall' }}>
          {getString(label)}
        </Text>
        {!isLastStep ? <Icon name="arrow-right" size={12} className={css.arrow} /> : null}
      </Layout.Horizontal>
    ),
    []
  )

  return (
    <>
      <Layout.Vertical flex className={css.buildYourOwnPipeline}>
        <Layout.Horizontal flex className={css.cdIcon}>
          <Icon name="cd-main" size={50} />
          <Text font={{ variation: FontVariation.H5 }} className={css.cdName}>
            {getString('cd.continuous')}
          </Text>
        </Layout.Horizontal>
        <Layout.Vertical flex margin={{ bottom: 'large' }}>
          <Text font={{ variation: FontVariation.H1_SEMI }}>{getString('common.getStarted.firstPipeline')}</Text>
        </Layout.Vertical>
        <Layout.Vertical className={css.vertical}>
          <Text font={{ variation: FontVariation.SMALL }}>{getString('common.getStarted.quicklyCreate')}</Text>
        </Layout.Vertical>
        <Layout.Vertical className={css.vertical}>
          <Layout.Horizontal padding={{ top: 'xxlarge', bottom: 'xlarge' }}>
            {renderBuildPipelineStep({
              iconProps: {
                name: 'services',
                size: 20,
                className: cx(css.icon, css.iconPadding)
              },
              label: 'common.getStarted.selectWorkload'
            })}
            {renderBuildPipelineStep({
              iconProps: { name: 'ci-infra', size: 20, className: cx(css.icon, css.paddingXSmall) },
              label: 'common.getStarted.selectArtifact'
            })}
            {renderBuildPipelineStep({
              iconProps: {
                name: 'infrastructure',
                size: 20,
                className: cx(css.icon, css.iconPadding)
              },
              label: 'common.getStarted.selectInfra'
            })}
            {renderBuildPipelineStep({
              iconProps: {
                name: 'ci-build-pipeline',
                size: 20,
                className: cx(css.icon, css.iconPaddingSmall)
              },
              label: 'common.getStarted.buildPipeline',
              isLastStep: true
            })}
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical className={css.vertical}>
          <Container padding={{ top: 'small', bottom: 'large' }}>
            <Container className={cx(css.separator, css.horizontal)} />
          </Container>
          <Button
            variation={ButtonVariation.PRIMARY}
            className={css.createPipeline}
            text={getString('common.createPipeline')}
          />
        </Layout.Vertical>
      </Layout.Vertical>
    </>
  )
}
