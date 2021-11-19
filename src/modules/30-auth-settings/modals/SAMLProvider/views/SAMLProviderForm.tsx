import React from 'react'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'
import {
  Layout,
  Heading,
  Color,
  Formik,
  FormikForm,
  Container,
  FormInput,
  Text,
  Button,
  Checkbox,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  TextInput,
  ButtonVariation,
  ThumbnailSelect,
  Label,
  getErrorInfoFromErrorObject,
  FontVariation
} from '@wings-software/uicore'
import copy from 'copy-to-clipboard'
import { defaultTo } from 'lodash-es'
import type { ToasterProps } from '@wings-software/uicore/dist/hooks/useToaster/useToaster'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import { useUploadSamlMetaData, useUpdateSamlMetaData, SamlSettings } from 'services/cd-ng'
import { getSamlEndpoint } from '@auth-settings/constants/utils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  createFormData,
  FormValues,
  SAMLProviderType,
  Providers,
  getSelectedSAMLProvider
} from '@auth-settings/modals/SAMLProvider/utils'
import css from '../useSAMLProvider.module.scss'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  samlProvider?: SamlSettings
}

const handleSuccess = (
  successCallback: ToasterProps['showSuccess'],
  isCreate: boolean,
  createText: string,
  updateText: string
): void => {
  successCallback(isCreate ? createText : updateText, 5000)
}

const SAMLProviderForm: React.FC<Props> = ({ onSubmit, onCancel, samlProvider }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [selected, setSelected] = React.useState<SAMLProviderType>()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const hasSamlProvider = selected || samlProvider
  const SAMLProviderTypes: SAMLProviderType[] = [
    {
      value: Providers.AZURE,
      label: getString('authSettings.azure'),
      icon: 'service-azure'
    },
    {
      value: Providers.OKTA,
      label: getString('authSettings.okta'),
      icon: 'service-okta'
    },
    {
      value: Providers.ONE_LOGIN,
      label: getString('authSettings.oneLogin'),
      icon: 'service-onelogin'
    },
    {
      value: Providers.OTHER,
      label: getString('common.other'),
      icon: 'main-more'
    }
  ]

  const selectedSAMLProvider = getSelectedSAMLProvider(selected, getString)
  const { mutate: uploadSamlSettings, loading: uploadingSamlSettings } = useUploadSamlMetaData({
    queryParams: {
      accountId
    }
  })

  const { mutate: updateSamlSettings, loading: updatingSamlSettings } = useUpdateSamlMetaData({
    queryParams: {
      accountId
    }
  })

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      let response

      if (samlProvider) {
        response = await updateSamlSettings(createFormData(values) as any)
      } else {
        response = await uploadSamlSettings(createFormData(values) as any)
      }

      if (response) {
        handleSuccess(
          showSuccess,
          !samlProvider,
          getString('authSettings.samlProviderAddedSuccessfully'),
          getString('authSettings.samlProviderUpdatedSuccessfully')
        )
        onSubmit?.()
      }
    } catch (e) {
      /* istanbul ignore next */ modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(e))
    }
  }

  const filesValidation = samlProvider
    ? yup.array()
    : yup.array().required(getString('common.validation.fileIsRequired'))

  return (
    <Layout.Horizontal>
      <Layout.Vertical width={660} padding={{ right: 'xxxlarge' }}>
        <Formik
          formName="samlProviderForm"
          initialValues={{
            displayName: defaultTo(samlProvider?.displayName, ''),
            authorizationEnabled: samlProvider ? !!samlProvider?.authorizationEnabled : true,
            groupMembershipAttr: defaultTo(samlProvider?.groupMembershipAttr, ''),
            entityIdEnabled: samlProvider ? !!samlProvider?.entityIdentifier : false,
            entityIdentifier: defaultTo(samlProvider?.entityIdentifier, '')
          }}
          validationSchema={yup.object().shape({
            displayName: yup.string().trim().required(getString('common.validation.nameIsRequired')),
            files: filesValidation,
            groupMembershipAttr: yup.string().when('authorizationEnabled', {
              is: val => val,
              then: yup.string().trim().required(getString('common.validation.groupAttributeIsRequired'))
            }),
            entityIdentifier: yup.string().when('entityIdEnabled', {
              is: val => val,
              then: yup.string().trim().required(getString('common.validation.entityIdIsRequired'))
            })
          })}
          onSubmit={values => {
            handleSubmit(values)
          }}
        >
          {({ values, setFieldValue }) => (
            <FormikForm>
              <Container width={474} margin={{ bottom: 'large' }}>
                <ModalErrorHandler bind={setModalErrorHandler} />
                <FormInput.Text name="displayName" label={getString('name')} />
              </Container>
              {!samlProvider && (
                <Layout.Vertical spacing="small" padding={{ bottom: 'medium' }}>
                  <Label>{getString('authSettings.selectSAMLProvider')}</Label>
                  <ThumbnailSelect
                    name="type"
                    items={SAMLProviderTypes}
                    onChange={(value: unknown) => {
                      setSelected(value as SAMLProviderType)
                    }}
                  />
                </Layout.Vertical>
              )}
              {hasSamlProvider && (
                <React.Fragment>
                  <Label>
                    {getString('authSettings.enterSAMLEndPoint', {
                      selectedSAMLProvider
                    })}
                  </Label>
                  <TextInput
                    value={getSamlEndpoint(accountId)}
                    rightElement={
                      (
                        <Button
                          icon="duplicate"
                          inline
                          variation={ButtonVariation.ICON}
                          onClick={() => {
                            copy(getSamlEndpoint(accountId))
                              ? showSuccess(getString('clipboardCopySuccess'))
                              : showError(getString('clipboardCopyFail'))
                          }}
                        />
                      ) as any
                    }
                    readOnly
                  />
                  <Container margin={{ bottom: 'xxxlarge' }}>
                    <FormInput.FileInput
                      name="files"
                      label={`${getString(
                        samlProvider ? 'authSettings.identityProvider' : 'authSettings.uploadIdentityProvider',
                        {
                          selectedSAMLProvider
                        }
                      )}`}
                      buttonText={getString('upload')}
                      placeholder={getString('authSettings.chooseFile')}
                      multiple
                    />
                  </Container>
                  <Container>
                    <Checkbox
                      name="authorization"
                      label={getString('authSettings.enableAuthorization')}
                      font={{ weight: 'semi-bold' }}
                      color={Color.GREY_600}
                      checked={values.authorizationEnabled}
                      onChange={e => setFieldValue('authorizationEnabled', e.currentTarget.checked)}
                    />
                    {values.authorizationEnabled && (
                      <Container width={300} margin={{ top: 'medium' }}>
                        <FormInput.Text
                          name="groupMembershipAttr"
                          label={getString('authSettings.groupAttributeName')}
                        />
                      </Container>
                    )}
                  </Container>
                  <Container margin={{ top: 'large' }}>
                    <Checkbox
                      name="enableEntityId"
                      label={getString('authSettings.enableEntityIdLabel')}
                      font={{ variation: FontVariation.FORM_LABEL }}
                      color={Color.GREY_600}
                      checked={values.entityIdEnabled}
                      onChange={e => setFieldValue('entityIdEnabled', e.currentTarget.checked)}
                    />
                    {values.entityIdEnabled && (
                      <Container width={300} margin={{ top: 'medium' }}>
                        <FormInput.Text name="entityIdentifier" label={getString('authSettings.entityIdLabel')} />
                      </Container>
                    )}
                  </Container>
                </React.Fragment>
              )}
              <Layout.Horizontal spacing="small" padding={{ top: 'xxxlarge' }}>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  text={getString(samlProvider ? 'save' : 'add')}
                  type="submit"
                  disabled={uploadingSamlSettings || updatingSamlSettings}
                />
                <Button text={getString('cancel')} onClick={onCancel} variation={ButtonVariation.TERTIARY} />
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </Layout.Vertical>
      <Layout.Vertical width={290} padding={{ left: 'xxxlarge' }} margin={{ bottom: 'large' }} border={{ left: true }}>
        <Heading level={6} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
          {getString('authSettings.friendlyReminder')}
        </Heading>
        <Text color={Color.GREY_800} font={{ size: 'small' }} margin={{ bottom: 'xxlarge' }} className={css.notes}>
          {getString('authSettings.friendlyReminderDescription')}
        </Text>
        {hasSamlProvider && (
          <React.Fragment>
            <Heading level={6} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
              {getString('authSettings.enablingAuthorization')}
            </Heading>
            <Text color={Color.GREY_800} font={{ size: 'small' }} margin={{ bottom: 'xxlarge' }} className={css.notes}>
              {getString('authSettings.enablingAuthorizationDescription', {
                selectedSAMLProvider
              })}
            </Text>
            <Heading level={6} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
              {getString('authSettings.testingSSO')}
            </Heading>
            <Text color={Color.GREY_800} font={{ size: 'small' }} margin={{ bottom: 'xxlarge' }} className={css.notes}>
              {getString('authSettings.testingSSODescription')}
            </Text>
          </React.Fragment>
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default SAMLProviderForm
