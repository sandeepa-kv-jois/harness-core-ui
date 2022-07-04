export const mockedTemplateInputsToValidate = {
  identifier: '<+monitoredService.serviceRef>_<+monitoredService.environmentRef>',
  type: 'Application',
  serviceRef: '<+input>',
  environmentRef: '<+input>',
  sources: {
    healthSources: [
      {
        identifier: 'Appd',
        type: 'AppDynamics',
        spec: {
          applicationName: '<+input>',
          tierName: '<+input>',
          metricDefinitions: [
            {
              identifier: 'appdMetric',
              completeMetricPath: '<+input>',
              analysis: {
                deploymentVerification: {
                  serviceInstanceMetricPath: '<+input>'
                }
              }
            }
          ],
          connectorRef: '<+input>'
        }
      }
    ]
  },
  variables: [
    {
      name: 'connectorVariable',
      type: 'String',
      value: '<+input>'
    }
  ]
}

export const mockedTemplateInputs = {
  identifier: '<+monitoredService.serviceRef>_<+monitoredService.environmentRef>',
  type: 'Application',
  sources: {
    healthSources: [
      {
        identifier: 'Appd',
        type: 'AppDynamics',
        spec: {
          metricDefinitions: [
            {
              identifier: 'appdMetric',
              analysis: {
                deploymentVerification: {}
              }
            }
          ],
          connectorRef: ''
        }
      }
    ]
  },
  variables: [
    {
      name: 'connectorVariable',
      type: 'String'
    }
  ]
}

export const expectedErrorsForEmptyTemplateInputs = {
  spec: {
    monitoredService: {
      spec: {
        templateInputs: {
          environmentRef: 'cv.monitoringSources.envValidation',
          serviceRef: 'cv.monitoringSources.serviceValidation',
          sources: {
            healthSources: [
              {
                spec: {
                  applicationName: 'connectors.cdng.validations.applicationNameValidation',
                  connectorRef: 'connectors.validation.connectorIsRequired',
                  metricDefinitions: [
                    {
                      analysis: {
                        deploymentVerification: {
                          serviceInstanceMetricPath: 'connectors.cdng.validations.serviceInstanceMetricPathValidation'
                        }
                      },
                      completeMetricPath: 'connectors.cdng.validations.completeMetricPathValidation'
                    }
                  ],
                  tierName: 'connectors.cdng.validations.tierNameValidation'
                }
              }
            ]
          },
          variables: [
            {
              value: 'connectorVariable is required'
            }
          ]
        }
      },
      type: 'Template Selection is required.'
    }
  }
}
