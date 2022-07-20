import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { Target } from 'services/cf'
import * as cfServices from 'services/cf'
import * as useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { NewTargets, NewTargetsProps } from '../NewTarget'

const onCreated = jest.fn()
const mutateMock = jest.fn()

const renderComponent = (props: Partial<NewTargetsProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <NewTargets
        onCreated={onCreated}
        existingTargets={[]}
        orgIdentifier="dummy org identifier"
        accountIdentifier="dummy account identifier"
        projectIdentifier="dummy project identifier"
        {...props}
      />
    </TestWrapper>
  )

const createAndSubmitTarget = async (): Promise<void> => {
  userEvent.click(screen.getByRole('button', { name: 'plus cf.targets.create' }))

  // modal
  await waitFor(() => expect(screen.queryByTestId('create-target-form')).toBeDefined())

  userEvent.type(screen.getByPlaceholderText('cf.targets.enterValue'), 'new target identifier', {
    allAtOnce: true
  })

  userEvent.type(screen.getByPlaceholderText('cf.targets.enterName'), 'new target name', { allAtOnce: true })

  userEvent.click(screen.getByRole('button', { name: 'add' }))
}

const createAndSubmitTargets = async (): Promise<void> => {
  userEvent.click(screen.getByRole('button', { name: 'plus cf.targets.create' }))

  await waitFor(() => expect(screen.queryByTestId('create-target-form')).toBeDefined())

  userEvent.type(screen.getByPlaceholderText('cf.targets.enterValue'), 'first target identifier', {
    allAtOnce: true
  })
  userEvent.type(screen.getByPlaceholderText('cf.targets.enterName'), 'first target name', { allAtOnce: true })

  userEvent.click(screen.getByRole('button', { name: 'plus' }))

  userEvent.type(screen.getAllByPlaceholderText('cf.targets.enterValue')[1], 'second target identifier', {
    allAtOnce: true
  })
  userEvent.type(screen.getAllByPlaceholderText('cf.targets.enterName')[1], 'second target name', { allAtOnce: true })

  userEvent.click(screen.getByRole('button', { name: 'add' }))
}

const newTargetTemplate = (name: string, identifier: string): Target => {
  return {
    identifier,
    name,
    anonymous: false,
    attributes: {},
    environment: '',
    project: 'dummy project identifier',
    account: 'dummy account identifier',
    org: 'dummy org identifier'
  }
}

describe('NewTarget', () => {
  beforeEach(() => jest.clearAllMocks())
  const useCreateTargetMock = jest.spyOn(cfServices, 'useCreateTarget')
  const useUploadTargetsMock = jest.spyOn(cfServices, 'useUploadTargets')
  const useActiveEnvironmentMock = jest.spyOn(useActiveEnvironment, 'default')

  test('it should call useCreateTarget API with correct values', async () => {
    useCreateTargetMock.mockReturnValue({
      cancel: jest.fn(),
      loading: false,
      error: null,
      mutate: mutateMock.mockResolvedValue({ status: 'fulfilled' })
    })

    renderComponent()
    await createAndSubmitTarget()

    await waitFor(() => {
      expect(mutateMock).toBeCalledWith(newTargetTemplate('new target name', 'new target identifier'))
      expect(onCreated).toHaveBeenCalled()
      // modal closes after successful submission
      expect(screen.queryByTestId('create-target-form')).not.toBeInTheDocument()
    })
  })

  test('it should handle error if API call fails', async () => {
    useCreateTargetMock.mockReturnValue({
      cancel: jest.fn(),
      loading: false,
      error: null,
      mutate: mutateMock.mockRejectedValue({ message: 'ERROR CREATING TARGET' })
    })

    renderComponent()
    await createAndSubmitTarget()

    await waitFor(() => {
      expect(screen.getByText('ERROR CREATING TARGET')).toBeInTheDocument()
      expect(onCreated).not.toHaveBeenCalled()
      expect(screen.queryByTestId('create-target-form')).toBeInTheDocument()
    })
  })

  test('it should call useCreateTarget API multiple times', async () => {
    useCreateTargetMock.mockReturnValue({
      cancel: jest.fn(),
      loading: false,
      error: null,
      mutate: mutateMock.mockResolvedValue({ status: 'fulfilled' })
    })

    renderComponent()
    await createAndSubmitTargets()

    await waitFor(() => {
      expect(mutateMock).toBeCalledWith(newTargetTemplate('first target name', 'first target identifier'))
      expect(mutateMock).toBeCalledWith(newTargetTemplate('second target name', 'second target identifier'))

      expect(mutateMock).toBeCalledTimes(2)
      expect(onCreated).toHaveBeenCalled()
      expect(screen.queryByTestId('create-target-form')).not.toBeInTheDocument()
    })
  })

  test.skip('it should call correct values when uploading a CSV file', async () => {
    const uploadMutateMock = jest.fn()

    useActiveEnvironmentMock.mockReturnValue({
      activeEnvironment: 'dummy environment identifier',
      withActiveEnvironment: jest.fn()
    })

    useUploadTargetsMock.mockReturnValue({
      cancel: jest.fn(),
      loading: false,
      error: null,
      mutate: uploadMutateMock
    })

    useCreateTargetMock.mockReturnValue({
      cancel: jest.fn(),
      loading: false,
      error: null,
      mutate: mutateMock
    })

    const CSV = ['"name1","identifier1"', '"name2","identifier2"', '"name3","identifier3"'].join('\n')

    const blob = new Blob([CSV])
    const mockCSVFile = new File([blob], 'targets.csv', {
      type: 'text/csv'
    })

    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'plus cf.targets.create' }))
    await waitFor(() => expect(screen.queryByTestId('create-target-form')).toBeDefined())

    userEvent.click(screen.getByRole('radio', { name: 'cf.targets.upload' }))
    await waitFor(() => expect(screen.getByText('cf.targets.uploadYourFile')).toBeInTheDocument())

    userEvent.click(screen.getByRole('img', { name: 'upload' }))
    userEvent.upload(document.querySelector('input[name="bulk-upload"]')!, mockCSVFile)

    userEvent.click(screen.getByRole('button', { name: 'add' }))

    await waitFor(() => {
      expect(uploadMutateMock).toHaveBeenCalled()
      expect(onCreated).toHaveBeenCalled()
      expect(screen.queryByTestId('create-target-form')).not.toBeInTheDocument()
    })
  })
})
