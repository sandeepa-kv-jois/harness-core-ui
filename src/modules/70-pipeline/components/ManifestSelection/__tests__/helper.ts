/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const addManifestUpdateStageArg = {
  name: 'Deploy Service',
  identifier: 'Deploy_Service',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      service: {
        identifier: 'Deploy_Stage',
        name: 'Deploy Stage',
        description: ''
      },
      serviceDefinition: {
        type: 'Kubernetes',
        spec: {
          artifacts: { sidecars: [], primary: null },
          startupScript: {
            type: 'Git',
            spec: {
              connectorRef: 'GIT2',
              gitFetchType: 'Branch',
              paths: '[filePath]',
              branch: 'branch'
            }
          },
          applicationSettings: {
            type: 'Git',
            spec: {
              connectorRef: 'GIT2',
              gitFetchType: 'Branch',
              paths: '[filePath]',
              branch: 'branch'
            }
          },
          connectionStrings: {
            type: 'Git',
            spec: {
              connectorRef: 'GIT2',
              gitFetchType: 'Branch',
              paths: '[filePath]',
              branch: 'branch'
            }
          },
          manifests: [
            {
              manifest: {
                identifier: 'MID ',
                type: 'K8sManifest',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: '<+input>',
                      gitFetchType: 'Branch',
                      branch: 'branch',
                      commitId: null,
                      paths: ['1', '2']
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'mid',
                type: 'K8sManifest',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: '<+input>',
                      gitFetchType: 'Branch',
                      branch: 'branch',
                      commitId: null,
                      paths: ['a1', 'b']
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'mid1',
                type: 'K8sManifest',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: '<+input>',
                      gitFetchType: 'Branch',
                      branch: 'br1',
                      commitId: null,
                      paths: '<+input>'
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'newmid',
                type: 'K8sManifest',
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: '<+input>',
                      gitFetchType: 'Branch',
                      branch: 'br2',
                      commitId: null,
                      paths: ['p1']
                    }
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'testidentifier',
                type: 'EcsTaskDefinition',
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            }
          ],
          artifactOverrideSets: [],
          manifestOverrideSets: [
            {
              identifier: 'overrideSetIdentifier',
              overrideSets: {
                overrideSet: {
                  manifests: [
                    {
                      manifest: {
                        identifier: 'MID ',
                        type: 'K8sManifest',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: '<+input>',
                              gitFetchType: 'Branch',
                              branch: 'branch',
                              commitId: null,
                              paths: ['1', '2']
                            }
                          }
                        }
                      }
                    },
                    {
                      manifest: {
                        identifier: 'mid',
                        type: 'K8sManifest',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: '<+input>',
                              gitFetchType: 'Branch',
                              branch: 'branch',
                              commitId: null,
                              paths: ['a1', 'b']
                            }
                          }
                        }
                      }
                    },
                    {
                      manifest: {
                        identifier: 'mid1',
                        type: 'K8sManifest',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: '<+input>',
                              gitFetchType: 'Branch',
                              branch: 'br1',
                              commitId: null,
                              paths: '<+input>'
                            }
                          }
                        }
                      }
                    },
                    {
                      manifest: {
                        identifier: 'newmid',
                        type: 'K8sManifest',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: '<+input>',
                              gitFetchType: 'Branch',
                              branch: 'br2',
                              commitId: null,
                              paths: ['p1']
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      },
      tags: {}
    },
    infrastructure: {
      environment: {
        name: 'Infra Stage Env',
        identifier: 'Infra_Stage_Env',
        description: '',
        type: 'PreProduction'
      },
      infrastructureDefinition: {
        type: 'KubernetesDirect',
        spec: { connectorRef: 'account.cidelegate', namespace: 'ns1', releaseName: 'release1' }
      }
    },
    execution: {
      steps: [
        {
          step: {
            name: 'Rollout Deployment',
            identifier: 'rolloutDeployment',
            type: 'K8sRollingDeploy',
            spec: { timeout: '10m', skipDryRun: false }
          }
        }
      ],
      rollbackSteps: [
        {
          step: {
            name: 'Rollback Rollout Deployment',
            identifier: 'rollbackRolloutDeployment',
            type: 'K8sRollingRollback',
            spec: { timeout: '10m' }
          }
        }
      ]
    }
  }
}
