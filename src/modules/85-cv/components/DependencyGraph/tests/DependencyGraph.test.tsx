import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import {
  nodes,
  graphData,
  formattedNodes,
  defaultOptions,
  mockedDependenciesResults,
  mockedServiceDependencies
} from '@cv/components/DependencyGraph/tests/DependencyGraph.mock'
import type * as cvService from 'services/cv'
import {
  formatNodes,
  dependencyGraphOptions,
  getDependencyData
} from '@cv/components/DependencyGraph/DependencyGraph.utils'
import { RiskValues } from '@cv/utils/CommonUtils'

describe('Unit tests for DependencyGraph', () => {
  test('Ensure Graph Component renders', async () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    await waitFor(() => expect(container.querySelector('[class*="DependencyGraph"]')).not.toBeNull())
  })

  test.each(nodes)('Ensure %o node has been rendered', async ({ name }) => {
    render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    await waitFor(() => expect(screen.findAllByText(name)).not.toBeNull())
  })

  test('Ensure the correct number of LOW nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === RiskValues.HEALTHY)
    expect(container.getElementsByClassName(`Status_${RiskValues.HEALTHY}`).length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of MEDIUM nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === RiskValues.NEED_ATTENTION)
    expect(container.getElementsByClassName(`Status_${RiskValues.NEED_ATTENTION}`).length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of TBD nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === RiskValues.OBSERVE)
    expect(container.getElementsByClassName(`Status_${RiskValues.OBSERVE}`).length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of red nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === RiskValues.UNHEALTHY)
    expect(container.getElementsByClassName(`Status_${RiskValues.UNHEALTHY}`).length).toBe(LOWNodes.length)
  })

  test('Ensure the formatNodes function returns correctly formatted nodes', () => {
    const actualFormattedNodes = formatNodes(nodes, graphData)
    const actualFormattedNodesWithIdsAndClassname = actualFormattedNodes.map(node => ({
      id: node.id,
      className: node.className
    }))
    expect(actualFormattedNodesWithIdsAndClassname).toEqual(formattedNodes)
  })

  test('verify if getDependencyData gives correct results', () => {
    expect(getDependencyData(mockedServiceDependencies as cvService.RestResponseServiceDependencyGraphDTO)).toEqual(
      mockedDependenciesResults
    )
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Ensure default options returns correctly', () => {
    expect(JSON.stringify(dependencyGraphOptions({ data: graphData, nodes }))).toEqual(JSON.stringify(defaultOptions))
  })
})
