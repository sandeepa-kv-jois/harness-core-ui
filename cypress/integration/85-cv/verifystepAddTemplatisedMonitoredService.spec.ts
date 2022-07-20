import { featureFlagsCall, yamlSnippet } from '../../support/70-pipeline/constants'
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
  servicesCall,
  strategiesYamlSnippets
} from '../../support/85-cv/verifyStep/constants'

const connectorsResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 43,
    totalItems: 430,
    pageItemCount: 10,
    pageSize: 10,
    content: [
      {
        connector: {
          name: 'ceng_aws_rSAE7SbBcq',
          identifier: 'ceng_aws_rSAE7SbBcq',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'CEAws',
          spec: {
            crossAccountAccess: {
              crossAccountRoleArn: 'arn:aws:iam::132359207506:role/HarnessCERole-uji4nb8j2djs',
              externalId: 'harness:108817434118:EfOfrUbHTtupeZjUqxlHBg'
            },
            curAttributes: {
              reportName: 'test_utsav',
              s3BucketName: 'testutsavbucket',
              region: 'us-east-1',
              s3Prefix: 'utsav_prefix'
            },
            awsAccountId: '132359207506',
            featuresEnabled: ['BILLING']
          }
        },
        createdAt: 1657897514274,
        lastModifiedAt: 1657897514263,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1658300425390,
          lastTestedAt: 0,
          lastConnectedAt: 1658300425390
        },
        activityDetails: { lastActivityTime: 1657897514329 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'test-123',
          identifier: 'test123',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Artifactory',
          spec: { artifactoryServerUrl: 'test', auth: { type: 'Anonymous' }, delegateSelectors: [] }
        },
        createdAt: 1657785210252,
        lastModifiedAt: 1657785210249,
        status: {
          status: 'FAILURE',
          errorSummary:
            'Error Encountered (No eligible delegate was able to confirm that it has the capability to perform [ test/ ])',
          errors: [
            {
              reason: 'Unexpected Error',
              message: 'No eligible delegate was able to confirm that it has the capability to perform [ test/ ]',
              code: 450
            }
          ],
          testedAt: 1657785334304,
          lastTestedAt: 0,
          lastConnectedAt: 0
        },
        activityDetails: { lastActivityTime: 1657785210272 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'Bitbucket',
          identifier: 'Bitbucket',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Bitbucket',
          spec: {
            url: 'https://bitbucket.org/',
            validationRepo: null,
            authentication: {
              type: 'Http',
              spec: {
                type: 'UsernamePassword',
                spec: { username: 'Pratysh2710', usernameRef: null, passwordRef: 'account.Bitbucket_Access_Token' }
              }
            },
            apiAccess: {
              type: 'UsernameToken',
              spec: { username: 'Pratysh2710', usernameRef: null, tokenRef: 'account.Bitbucket_Access_Token' }
            },
            delegateSelectors: [],
            type: 'Account'
          }
        },
        createdAt: 1657660444617,
        lastModifiedAt: 1657806251061,
        status: {
          status: 'FAILURE',
          errorSummary: 'Error Encountered (Please ensure that the api access credentials are correct.)',
          errors: [
            {
              reason: 'Unexpected Error',
              message: 'Please ensure that the api access credentials are correct.',
              code: 450
            }
          ],
          testedAt: 1657806251965,
          lastTestedAt: 0,
          lastConnectedAt: 1657806238261
        },
        activityDetails: { lastActivityTime: 1657806251093 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'customddlogsv2',
          identifier: 'customddlogsv2',
          description: null,
          orgIdentifier: 'CVNG',
          projectIdentifier: null,
          tags: {},
          type: 'CustomHealth',
          spec: {
            baseURL: 'https://app.datadoghq.com/api/',
            headers: [
              { key: 'DD_API_KEY', encryptedValueRef: 'org.datadogapikey', value: null, valueEncrypted: true },
              { key: 'DD_APPLICATION_KEY', encryptedValueRef: 'org.datadogappkey', value: null, valueEncrypted: true }
            ],
            params: [],
            method: 'POST',
            validationBody: '{"filter":{"query":"*exception* ","from":1657638593000,"to":1657642193000}}',
            validationPath: 'v2/logs/events/search',
            delegateSelectors: []
          }
        },
        createdAt: 1657642836152,
        lastModifiedAt: 1658146175861,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1658303349317,
          lastTestedAt: 0,
          lastConnectedAt: 1658303349317
        },
        activityDetails: { lastActivityTime: 1658146175889 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'dhjksdfjk',
          identifier: 'dhjksdfjk',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Github',
          spec: {
            url: 'https://djhs',
            validationRepo: null,
            authentication: {
              type: 'Http',
              spec: {
                type: 'UsernameToken',
                spec: { username: 'mekjhwdk', usernameRef: null, tokenRef: 'account.viveksecret' }
              }
            },
            apiAccess: null,
            delegateSelectors: [],
            executeOnDelegate: false,
            type: 'Repo'
          }
        },
        createdAt: 1657605144080,
        lastModifiedAt: 1657605144075,
        status: {
          status: 'FAILURE',
          errorSummary: 'Error Encountered (Exception caught during execution of ls-remote command)',
          errors: [
            { reason: 'Unexpected Error', message: 'Exception caught during execution of ls-remote command', code: 450 }
          ],
          testedAt: 1657605159579,
          lastTestedAt: 0,
          lastConnectedAt: 0
        },
        activityDetails: { lastActivityTime: 1657605144097 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'dsuhyudugdutt',
          identifier: 'dsuhyudugdutt',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'K8sCluster',
          spec: {
            credential: { type: 'InheritFromDelegate', spec: null },
            delegateSelectors: ['abc', 'primary configuration']
          }
        },
        createdAt: 1657604329827,
        lastModifiedAt: 1657604355793,
        status: {
          status: 'FAILURE',
          errorSummary: ' No Delegate Found ( No Delegate Eligible to perform the request)',
          errors: [
            { reason: ' No Delegate Found', message: ' No Delegate Eligible to perform the request', code: 463 }
          ],
          testedAt: 1657604356285,
          lastTestedAt: 0,
          lastConnectedAt: 0
        },
        activityDetails: { lastActivityTime: 1657604355822 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'Gitlab',
          identifier: 'Gitlab',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Gitlab',
          spec: {
            url: 'https://gitlab.com',
            validationRepo: null,
            authentication: {
              type: 'Http',
              spec: {
                type: 'UsernameToken',
                spec: { username: null, usernameRef: null, tokenRef: 'account.Gitlab_Access_Token' }
              }
            },
            apiAccess: { type: 'Token', spec: { tokenRef: 'account.Gitlab_Access_Token' } },
            delegateSelectors: [],
            type: 'Account'
          }
        },
        createdAt: 1657354929126,
        lastModifiedAt: 1658301994627,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1658301999833,
          lastTestedAt: 0,
          lastConnectedAt: 1658301999833
        },
        activityDetails: { lastActivityTime: 1658301994667 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'ceng_azure_oVt3RarU8Z',
          identifier: 'ceng_azure_oVt3RarU8Z',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'CEAzure',
          spec: {
            featuresEnabled: ['VISIBILITY', 'BILLING'],
            tenantId: 'b229b2bb-5f33-4d22-bce0-730f6474e906',
            subscriptionId: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0',
            billingExportSpec: {
              storageAccountName: 'cesrcbillingstorage',
              containerName: 'cesrcbillingcontainer',
              directoryName: 'billingdirectoryharnessqa',
              reportName: 'cebillingreport',
              subscriptionId: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0'
            }
          }
        },
        createdAt: 1657292764367,
        lastModifiedAt: 1657292764358,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1658300428908,
          lastTestedAt: 0,
          lastConnectedAt: 1658300428908
        },
        activityDetails: { lastActivityTime: 1657292764392 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'Github',
          identifier: 'Github',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Github',
          spec: {
            url: 'https://github.com',
            validationRepo: null,
            authentication: {
              type: 'Http',
              spec: {
                type: 'UsernameToken',
                spec: { username: null, usernameRef: null, tokenRef: 'account.Github_Access_Token' }
              }
            },
            apiAccess: { type: 'Token', spec: { tokenRef: 'account.Github_Access_Token' } },
            delegateSelectors: [],
            executeOnDelegate: true,
            type: 'Account'
          }
        },
        createdAt: 1657139334236,
        lastModifiedAt: 1658302201890,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1658302203465,
          lastTestedAt: 0,
          lastConnectedAt: 1658302203465
        },
        activityDetails: { lastActivityTime: 1658302201935 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'ceng_gcp_d5wh5b3L1b',
          identifier: 'ceng_gcp_d5wh5b3L1b',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'GcpCloudCost',
          spec: {
            featuresEnabled: ['BILLING'],
            projectId: 'ce-qa-274307',
            serviceAccountEmail: 'harness-ce-harness-io-zeaak@ce-qa-274307.iam.gserviceaccount.com',
            billingExportSpec: {
              datasetId: 'BillingReport_zeaak_fls425ieo7olzmug',
              tableId: 'gcp_billing_export_harnessio_gcp'
            }
          }
        },
        createdAt: 1656860605283,
        lastModifiedAt: 1656860605279,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1658300430837,
          lastTestedAt: 0,
          lastConnectedAt: 1658300430837
        },
        activityDetails: { lastActivityTime: 1656860605304 },
        harnessManaged: false,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        governanceMetadata: null
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '325beb0f-f6ed-4e59-bf56-d088f8e66398'
}

describe('Verify step add', () => {
  const pipelineVariablesCall =
    '/pipeline/api/pipelines/v2/variables?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const connectorsCall =
    '/ng/api/connectors/listV2?routingId=accountId&pageIndex=0&pageSize=10&searchTerm=&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&includeAllConnectorsAvailableAtScope=true'
  const environmentsCall =
    '/ng/api/environmentsV2?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'

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
    cy.intercept('POST', pipelineVariablesCall, { fixture: 'pipeline/api/runpipeline/pipelines.variables' })
    cy.intercept('POST', connectorsCall, connectorsResponse)
    cy.intercept('POST', '/authz/api/acl?routingId=accountId').as('aclCall')
    cy.intercept('POST', 'https://m.stripe.com/6').as('stripeCall')
  })

  it('should check verify step add inputs are correct as given', () => {
    // service definition
    cy.get('input[name="serviceRef"]').click({ force: true })
    cy.get('.FloatingContainer--floatingContent').then($body => {
      if ($body.find('.Header--closeBtn').length > 0) {
        cy.get('.Header--closeBtn').click()
      }
    })
    cy.contains('span', 'New Service').click()
    cy.fillName('testService')
    cy.get('[data-id="service-save"]').click()
    cy.contains('span', 'Service created successfully').should('be.visible')
    cy.get('[value="testService"]').should('be.visible')
    cy.contains('p', /^Kubernetes$/).click()
    cy.wait(2000)
    cy.contains('span', 'Continue').click({ force: true })

    // Infrastructure definition
    cy.contains('span', 'New Environment').click()
    cy.fillName('testEnv')
    cy.contains('p', 'Production').click()
    cy.get('[data-id="environment-save"]').click()
    cy.contains('span', 'Environment created successfully').should('be.visible')
    cy.get('[value="testEnv"]').should('be.visible')

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
