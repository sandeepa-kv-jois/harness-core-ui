import { environmentsCall, featureFlagsCall } from '../../support/70-pipeline/constants'
import {
  applyTemplatesCall,
  applyTemplatesResponseForServiceRuntime,
  inputSetsCall,
  inputSetsTemplateCall,
  inputSetTemplateForRuntimeServiceCall,
  inputSetTemplateRuntimeServiceResponse,
  monitoresServices,
  monitoresServicesResponse,
  monitoresServicesResponseWithNoHealthSource,
  pipelineDetailsCall,
  pipelineDetailsWithRoutingIdCall,
  pipelineDetailsWithRoutingIDResponse,
  pipelineSaveServiceRuntimeResponse,
  pipelineSummaryCall,
  pipelineSummaryResponse,
  serviceEnvironmentNoMonitoredServicesResponse,
  serviceEnvironmentTest2Call,
  serviceEnvironmentTest3Call,
  servicesCallV2,
  servicesV2AccessResponse,
  inputSetTemplateNoInput,
  templateResolvedPipeline,
  templateResolvedPipelineResponse,
  savePipelineGetResponse,
  inputSetsTemplateServiceRunTimeInputResponse,
  inputSetsTemplateResponse2,
  servicesCall
} from '../../support/85-cv/verifyStep/constants'

describe('Verify step add', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.login('test', 'test')

    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'CVNG_TEMPLATE_VERIFY_STEP',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.visitVerifyStepInPipeline()
    cy.fillName('testPipeline_Cypress')
    cy.get('[type="submit"]').click()

    cy.verifyStepInitialSetup()
    cy.intercept(
      'POST',
      '/pipeline/api/inputSets/template?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&pipelineIdentifier=testPipeline_Cypress&projectIdentifier=project1',
      inputSetTemplateNoInput
    ).as('inputSetsTemplateCall')

    cy.intercept('GET', servicesCall, { fixture: 'ng/api/servicesV2' })
    cy.intercept('GET', environmentsCall, { fixture: 'ng/api/environmentsV2' })
  })

  it('should check verify step add inputs are correct as given', () => {
    // service definition
    cy.get('input[name="serviceRef"]').click({ force: true })
    cy.contains('p', 'testService').click({ force: true })
    cy.contains('p', /^Kubernetes$/).click()

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.get('input[placeholder="- Select Environment -"]').click({ force: true })
    cy.contains('p', 'testEnv').click({ force: true })

    cy.verifyStepSelectConnector()

    cy.verifyStepSelectStrategyAndVerifyStep()
    cy.wait('@monitoredServices')

    cy.get("input[name='spec.monitoredServiceRef']").should('have.value', 'appd_prod')
    cy.get("input[name='spec.monitoredServiceRef']").should('be.disabled')
    cy.findByText(/^Health Sources$/i).should('exist')
    cy.findByTestId(/healthSourceTable_appd-test/i).should('exist')

    cy.fillName('test_verify')

    cy.get('input[name="spec.type"]').click({ force: true })
    cy.contains('p', 'Rolling Update').click({ force: true })
    cy.get('input[name="spec.spec.sensitivity"]').click({ force: true })
    cy.contains('p', 'High').click({ force: true })
    cy.get('input[name="spec.spec.duration"]').click({ force: true })
    cy.contains('p', '5 min').click({ force: true })
    cy.get('input[name="spec.monitoredService.type"]').click({ force: true })
    cy.contains('p', 'Template').click({ force: true })

    cy.intercept('GET', pipelineSummaryCall, pipelineSummaryResponse).as('pipelineSummaryCall')
    cy.intercept('GET', pipelineDetailsCall, pipelineSaveServiceRuntimeResponse).as('pipelineDetailsCall')

    cy.findByRole('button', { name: /Apply Changes/i }).click()

    cy.wait(2000)

    cy.findByRole('button', { name: /^Save$/i }).click({ force: true })

    cy.wait(500)

    cy.findByText('Pipeline published successfully').should('be.visible')

    cy.intercept('GET', templateResolvedPipeline, templateResolvedPipelineResponse).as('templateResolvedPipeline')

    cy.wait('@pipelineSave').then(interception => {
      expect(interception.request.body).includes('type: Verify')
      expect(interception.request.body).includes('sensitivity: HIGH')
      expect(interception.request.body).includes('duration: 5m')
      expect(interception.request.body).includes('deploymentTag: <+serviceConfig.artifacts.primary.tag>')
      expect(interception.request.body).includes('timeout: 2h')
    })

    cy.findByTestId('card-run-pipeline').click()

    cy.wait('@stagesExecutionList')
    cy.wait('@inputSetsTemplateCallResponse')
    cy.wait('@templateResolvedPipeline')

    cy.findByText('No runtime inputs are required for the execution of this Pipeline').should('exist')
  })
})
