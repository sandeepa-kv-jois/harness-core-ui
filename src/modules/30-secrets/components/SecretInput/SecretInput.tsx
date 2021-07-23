import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { connect, FormikContext } from 'formik'
import { Layout, Icon, Container, Text, Color } from '@wings-software/uicore'

import { get, isPlainObject, pick } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import useCreateOrSelectSecretModal from '@secrets/modals/CreateOrSelectSecretModal/useCreateOrSelectSecretModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { SecretResponseWrapper, ResponsePageSecretResponseWrapper, ConnectorInfoDTO } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import { getReference } from '@secrets/utils/SSHAuthUtils'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import css from './SecretInput.module.scss'

export interface SecretInputProps {
  name: string
  label?: string
  placeholder?: string
  type?: SecretResponseWrapper['secret']['type']
  onSuccess?: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  /**
   * Used when opening Create/Select/Update Secret modal from the Create Connector modal context
   * to be added as a source_category query param to get a filtered list of secrets/connectors from the BE
   */
  connectorTypeContext?: ConnectorInfoDTO['type']
  allowSelection?: boolean
  privateSecret?: boolean
}

interface FormikSecretInput extends SecretInputProps {
  formik: FormikContext<any>
}

const SecretInput: React.FC<FormikSecretInput> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const {
    formik,
    label,
    name,
    onSuccess,
    type = 'SecretText',
    secretsListMockData,
    placeholder,
    connectorTypeContext,
    allowSelection = true,
    privateSecret
  } = props
  const secretReference = formik.values[name]

  const { openCreateOrSelectSecretModal } = useCreateOrSelectSecretModal(
    {
      type,
      onSuccess: secret => {
        formik.setFieldValue(name, secret)
        /* istanbul ignore next */
        onSuccess?.(secret)
      },
      secretsListMockData,
      connectorTypeContext: connectorTypeContext
    },
    [name, onSuccess]
  )
  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: formData => {
      const secret: SecretReference = {
        ...pick(formData, 'identifier', 'name', 'orgIdentifier', 'projectIdentifier'),
        referenceString: getReference(getScopeFromDTO(formData), formData.identifier) as string
      }
      formik.setFieldValue(name, secret)
      onSuccess?.(secret)
    },
    connectorTypeContext: connectorTypeContext,
    privateSecret: privateSecret
  })

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  const getPlaceHolder = (): string => {
    return placeholder || getString(type === 'SSHKey' ? 'secrets.selectSecret' : 'createOrSelectSecret')
  }

  return (
    <FormGroup
      helperText={errorCheck() ? get(formik?.errors, name) : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
    >
      <Layout.Vertical>
        {label ? <label className={'bp3-label'}>{label}</label> : null}
        <Container flex={{ alignItems: 'center', justifyContent: 'space-between' }} className={css.container}>
          <Link
            to="#"
            className={css.containerLink}
            data-testid={name}
            onClick={e => {
              e.preventDefault()
              if (allowSelection) {
                openCreateOrSelectSecretModal()
              } else {
                openCreateSecretModal(type)
              }
            }}
          >
            <Icon size={24} height={12} name={'key-main'} />
            <Text
              color={Color.PRIMARY_7}
              flex={{ alignItems: 'center', justifyContent: 'flex-start', inline: false }}
              padding="small"
              className={css.containerLinkText}
            >
              <div>{secretReference ? getString('secret.configureSecret') : getPlaceHolder()}</div>
              {secretReference ? <div>{`<${secretReference['name']}>`}</div> : null}
            </Text>
          </Link>
          {secretReference ? (
            <RbacButton
              minimal
              className={css.containerEditBtn}
              data-testid={`${name}-edit`}
              onClick={() =>
                openCreateSecretModal(type, {
                  identifier: secretReference?.['identifier'],
                  projectIdentifier: secretReference?.['projectIdentifier'],
                  orgIdentifier: secretReference?.['orgIdentifier']
                } as SecretIdentifiers)
              }
              permission={{
                permission: PermissionIdentifier.UPDATE_SECRET,
                resource: {
                  resourceType: ResourceType.SECRET,
                  resourceIdentifier: secretReference?.['identifier']
                },
                resourceScope: {
                  accountIdentifier: accountId,
                  projectIdentifier: secretReference?.['projectIdentifier'],
                  orgIdentifier: secretReference?.['orgIdentifier']
                }
              }}
              text={<Icon size={16} name={'edit'} color={Color.PRIMARY_7} />}
            />
          ) : null}
        </Container>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikSecretInput, 'formik'>>(SecretInput)
