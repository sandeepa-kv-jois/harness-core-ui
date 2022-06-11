import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './CostCalculator.module.scss'

export const FFEquation = (): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ alignItems: 'start', justifyContent: 'left' }} className={css.equation}>
      <Layout.Vertical spacing={'xsmall'} padding={{ right: 'large' }}>
        <Text>{`${getString('authSettings.costCalculator.developerLicenses')} ${getString('common.subtotal')}`}</Text>
        <Text font={{ size: 'medium' }}>{getString('common.perMonth')}</Text>
        <Text font={{ size: 'xsmall' }}>{getString('authSettings.billedAnnually')}</Text>
        <Text font={{ size: 'xsmall' }}>{`${getString('authSettings.unitPrice')} ${getString(
          'common.perMonth'
        )}`}</Text>
      </Layout.Vertical>
      <Text padding={{ right: 'large', top: 'medium' }} font={{ size: 'large' }}>
        +
      </Text>
      <Layout.Vertical spacing={'xsmall'} padding={{ right: 'large' }}>
        <Text>{`${getString('authSettings.costCalculator.maus')} ${getString('common.subtotal')}`}</Text>
        <Text font={{ size: 'medium' }}>{getString('common.perMonth')}</Text>
        <Text font={{ size: 'xsmall' }}>{getString('authSettings.billedAnnually')}</Text>
        <Text font={{ size: 'xsmall' }}>{`${getString('authSettings.unitPrice')} ${getString(
          'common.perMonth'
        )}`}</Text>
        <Text font={{ size: 'xsmall' }}>{getString('authSettings.firstIncludedFree')}</Text>
      </Layout.Vertical>
      <Text padding={{ right: 'large', top: 'medium' }} font={{ size: 'large' }}>
        =
      </Text>
      <Layout.Vertical spacing={'xsmall'}>
        <Text>{getString('authSettings.yearlySubscriptionTotal')}</Text>
        <Layout.Horizontal spacing={'xsmall'} flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
          <Text font={{ size: 'medium' }}>{getString('common.perMonth')}</Text>
          <Text font={{ size: 'xsmall' }}>{getString('authSettings.plusTax')}</Text>
        </Layout.Horizontal>
        <Text font={{ size: 'xsmall' }}>{getString('authSettings.billedAnnually')}</Text>
        <Text font={{ size: 'xsmall' }}>{getString('authSettings.autoRenewal')}</Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
