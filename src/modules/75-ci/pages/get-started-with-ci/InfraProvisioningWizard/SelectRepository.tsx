/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { debounce } from 'lodash-es'
import type { Column, CellProps } from 'react-table'
import {
  Text,
  FontVariation,
  Layout,
  TableV2,
  Container,
  RadioButton,
  Color,
  TextInput,
  FormError,
  Icon,
  Select,
  SelectOption,
  IconProps,
  IconName
} from '@harness/uicore'
import { ConnectorInfoDTO, useGetListOfAllReposByRefConnector, UserRepoResponse } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ACCOUNT_SCOPE_PREFIX, getFullRepoName } from './Constants'

import css from './InfraProvisioningWizard.module.scss'

export interface SelectRepositoryRef {
  repository?: UserRepoResponse
}

export type SelectRepositoryForwardRef =
  | ((instance: SelectRepositoryRef | null) => void)
  | React.MutableRefObject<SelectRepositoryRef | null>
  | null

interface SelectRepositoryProps {
  selectedRepository?: UserRepoResponse
  showError?: boolean
  validatedConnectorRef?: string
  connectorsEligibleForPreSelection?: ConnectorInfoDTO[]
  onConnectorSelect?: (connector: ConnectorInfoDTO) => void
  disableNextBtn: () => void
  enableNextBtn: () => void
}

const SelectRepositoryRef = (
  props: SelectRepositoryProps,
  forwardRef: SelectRepositoryForwardRef
): React.ReactElement => {
  const {
    selectedRepository,
    showError,
    validatedConnectorRef,
    disableNextBtn,
    enableNextBtn,
    connectorsEligibleForPreSelection,
    onConnectorSelect
  } = props
  const { getString } = useStrings()
  const [repository, setRepository] = useState<UserRepoResponse | undefined>(selectedRepository)
  const [query, setQuery] = useState<string>('')
  const [repositories, setRepositories] = useState<UserRepoResponse[]>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const {
    data: repoData,
    loading: fetchingRepositories,
    refetch: fetchRepositories,
    cancel: cancelRepositoriesFetch
  } = useGetListOfAllReposByRefConnector({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      connectorRef: ''
    },
    lazy: true
  })
  const [selectedConnector, setSelectedConnector] = useState<SelectOption>()

  const getIcon = React.useCallback((type: ConnectorInfoDTO['type']): IconName | undefined => {
    switch (type) {
      case Connectors.GITHUB:
        return 'github'
      case Connectors.GITLAB:
        return 'gitlab'
      case Connectors.BITBUCKET:
        return 'bitbucket-blue'
      default:
        return
    }
  }, [])

  const selectionItems = useMemo((): SelectOption[] => {
    return connectorsEligibleForPreSelection?.map((item: ConnectorInfoDTO) => {
      const { type, name, identifier } = item
      return {
        icon: { name: getIcon(type), className: css.listIcon } as IconProps,
        label: name,
        value: identifier
      } as SelectOption
    }) as SelectOption[]
  }, [connectorsEligibleForPreSelection])

  useEffect(() => {
    if (validatedConnectorRef && selectionItems.length > 0) {
      setSelectedConnector(selectionItems.filter((item: SelectOption) => item.value === validatedConnectorRef)?.[0])
    }
  }, [selectionItems, validatedConnectorRef])

  useEffect(() => {
    const connectorRefForRepoFetch = validatedConnectorRef || (selectedConnector?.value as string)
    if (connectorRefForRepoFetch) {
      cancelRepositoriesFetch()
      fetchRepositories({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: `${ACCOUNT_SCOPE_PREFIX}${connectorRefForRepoFetch}`
        }
      })
    }
  }, [validatedConnectorRef, selectedConnector])

  useEffect(() => {
    setRepository(undefined)
    const matchingConnector = connectorsEligibleForPreSelection?.filter(
      (item: ConnectorInfoDTO) => item.identifier === selectedConnector?.value
    )?.[0]
    if (matchingConnector) {
      onConnectorSelect?.(matchingConnector)
    }
  }, [selectedConnector])

  useEffect(() => {
    setRepositories(repoData?.data)
  }, [repoData?.data])

  const debouncedRepositorySearch = useCallback(
    debounce((queryText: string): void => {
      setQuery(queryText)
    }, 500),
    []
  )

  useEffect(() => {
    if (fetchingRepositories) {
      disableNextBtn()
    } else {
      enableNextBtn()
    }
  }, [fetchingRepositories])

  useEffect(() => {
    if (selectedRepository) {
      setRepository(selectedRepository)
    }
  }, [selectedRepository])

  useEffect(() => {
    if (query) {
      setRepositories(
        (repoData?.data || []).filter(item => getFullRepoName(item).toLowerCase().includes(query.toLowerCase()))
      )
    } else {
      setRepositories(repoData?.data)
    }
  }, [query])

  useEffect(() => {
    if (!forwardRef) {
      return
    }

    if (typeof forwardRef === 'function') {
      return
    }

    forwardRef.current = {
      repository
    }
  }, [repository])

  const renderRepositories = React.useCallback((): JSX.Element => {
    if (fetchingRepositories) {
      return (
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" padding={{ top: 'xsmall' }}>
          <Icon name="steps-spinner" color="primary7" size={25} />
          <Text font={{ variation: FontVariation.H6 }}>{getString('ci.getStartedWithCI.fetchingRepos')}</Text>
        </Layout.Horizontal>
      )
    }
    if (Array.isArray(repositories) && repositories.length > 0) {
      return <RepositorySelectionTable repositories={repositories} onRowClick={setRepository} />
    }
    return (
      <Text flex={{ justifyContent: 'center' }} padding={{ top: 'medium' }}>
        {getString('noSearchResultsFoundPeriod')}
      </Text>
    )
  }, [fetchingRepositories, repositories, repoData?.data])

  const showValidationErrorForRepositoryNotSelected = useMemo((): boolean => {
    return (!fetchingRepositories && showError && !repository?.name) || false
  }, [showError, repository?.name, fetchingRepositories])

  return (
    <Layout.Vertical spacing="xsmall">
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.selectYourRepo')}</Text>
      <Text font={{ variation: FontVariation.BODY2 }}>{getString('ci.getStartedWithCI.codebaseHelptext')}</Text>
      <Container padding={{ top: 'small' }} width="65%">
        <Layout.Horizontal>
          <TextInput
            leftIcon="search"
            placeholder={getString('ci.getStartedWithCI.searchRepo')}
            className={css.repositorySearch}
            leftIconProps={{ name: 'search', size: 18, padding: 'xsmall' }}
            onChange={e => {
              debouncedRepositorySearch((e.currentTarget as HTMLInputElement).value)
            }}
            disabled={fetchingRepositories}
          />
          <Select
            items={selectionItems}
            value={selectedConnector}
            className={css.connectorSelect}
            onChange={(item: SelectOption) => setSelectedConnector(item)}
            disabled={fetchingRepositories}
          />
        </Layout.Horizontal>
      </Container>
      <Container
        className={cx(css.repositories, { [css.repositoriesWithError]: showValidationErrorForRepositoryNotSelected })}
      >
        {renderRepositories()}
        {showValidationErrorForRepositoryNotSelected ? (
          <Container padding={{ top: 'xsmall' }}>
            <FormError
              name={'repository'}
              errorMessage={getString('ci.getStartedWithCI.plsChoose', {
                field: `a ${getString('repository').toLowerCase()}`
              })}
            />
          </Container>
        ) : null}
      </Container>
    </Layout.Vertical>
  )
}

interface RepositorySelectionTableProps {
  repositories: UserRepoResponse[]
  onRowClick: (repo: UserRepoResponse) => void
}

function RepositorySelectionTable({ repositories, onRowClick }: RepositorySelectionTableProps): React.ReactElement {
  const { getString } = useStrings()
  const [selectedRow, setSelectedRow] = useState<UserRepoResponse | undefined>(undefined)

  useEffect(() => {
    if (selectedRow) {
      onRowClick(selectedRow)
    }
  }, [selectedRow])

  const columns: Column<UserRepoResponse>[] = React.useMemo(
    () => [
      {
        accessor: 'name',
        width: '100%',
        Cell: ({ row }: CellProps<UserRepoResponse>) => {
          const { name: repositoryName } = row.original
          const isRowSelected = selectedRow && getFullRepoName(row.original) === getFullRepoName(selectedRow)
          return (
            <Layout.Horizontal
              data-testid={repositoryName}
              className={css.repositoryRow}
              flex={{ justifyContent: 'flex-start' }}
              spacing="small"
            >
              <RadioButton checked={isRowSelected} />
              <Text
                lineClamp={1}
                font={{ variation: FontVariation.BODY2 }}
                color={isRowSelected ? Color.PRIMARY_7 : Color.GREY_900}
              >
                {getFullRepoName(row.original)}
              </Text>
            </Layout.Horizontal>
          )
        },
        disableSortBy: true
      }
    ],
    [getString]
  )

  return (
    <TableV2<UserRepoResponse>
      columns={columns}
      data={repositories || []}
      hideHeaders={true}
      minimal={true}
      resizable={false}
      sortable={false}
      className={css.repositoryTable}
      onRowClick={data => setSelectedRow(data)}
    />
  )
}

export const SelectRepository = React.forwardRef(SelectRepositoryRef)
