import React, { useEffect, useState } from 'react'
import {
  Formik,
  FormikForm,
  FormInput,
  Container,
  Button,
  Layout,
  Card,
  CardBody,
  SelectOption,
  Text
} from '@wings-software/uikit'
import { useParams } from 'react-router-dom'
import type { IconName } from '@blueprintjs/core'
import * as Yup from 'yup'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import { useAllAccounts } from 'services/lw'
import i18n from './COGatewayBasics.i18n'
import css from './COGatewayBasics.module.scss'
interface COGatewayBasicsProps {
  nextTab: () => void
  previousTab: () => void
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
}

const COGatewayBasics: React.FC<COGatewayBasicsProps> = props => {
  const { orgIdentifier } = useParams()
  const [cloudAccounts, setcloudAccounts] = useState<SelectOption[]>([])
  const { data } = useAllAccounts({
    org_id: orgIdentifier // eslint-disable-line
  })
  useEffect(() => {
    if (data && data.response) {
      const filteredAccounts = data.response.filter(
        item => item.service_provider == props.gatewayDetails.provider.value
      )
      const options: SelectOption[] = filteredAccounts.map(item => {
        return {
          value: item.id ? item.id : '',
          label: item.name ? item.name : ''
        }
      })
      setcloudAccounts(options)
    }
  }, [data])
  return (
    <Layout.Vertical spacing="large" padding="large">
      <Container width="40%" style={{ marginLeft: '10%', paddingTop: 200 }}>
        <Card selected style={{ padding: '5px', width: '50px', height: '50px' }} cornerSelected={true}>
          <CardBody.Icon icon={props.gatewayDetails.provider.icon as IconName} iconSize={25}></CardBody.Icon>
        </Card>
        <Container style={{ margin: '0 auto', paddingTop: 50 }}>
          <Formik
            initialValues={{
              gatewayName: props.gatewayDetails.name,
              cloudAccount: props.gatewayDetails.cloudAccount
            }}
            onSubmit={values => alert(JSON.stringify(values))}
            render={formik => (
              <FormikForm>
                <Layout.Vertical spacing="large">
                  <FormInput.Text
                    name="gatewayName"
                    label={i18n.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue('gatewayName', e.target.value)
                      props.gatewayDetails.name = e.target.value
                      props.setGatewayDetails(props.gatewayDetails)
                    }}
                  />
                  <FormInput.Select
                    name="cloudAccount"
                    label={[i18n.connect, props.gatewayDetails.provider.name, i18n.account].join(' ')}
                    placeholder={i18n.select}
                    items={cloudAccounts}
                    onChange={(e: SelectOption) => {
                      formik.setFieldValue('cloudAccount', e.value)
                      props.gatewayDetails.cloudAccount = { id: e.value?.toString(), name: e.label }
                      props.setGatewayDetails(props.gatewayDetails)
                    }}
                  />
                </Layout.Vertical>
              </FormikForm>
            )}
            validationSchema={Yup.object().shape({
              gatewayName: Yup.string().trim().required('Gateway Name is required field'),
              cloudAccount: Yup.string().trim().required('Cloud Account is required field')
            })}
          ></Formik>
          <Text
            onClick={() => alert('coming soon')}
            style={{ fontSize: '13px', color: '#0278D5', lineHeight: '20px', cursor: 'pointer' }}
          >
            {['+', i18n.new, props.gatewayDetails.provider.name, i18n.connector].join(' ')}
          </Text>
        </Container>
      </Container>
      <Layout.Horizontal className={css.footer} spacing="medium">
        <Button text="Previous" icon="chevron-left" onClick={props.previousTab} />
        <Button intent="primary" text="Next" icon="chevron-right" onClick={props.nextTab} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default COGatewayBasics
