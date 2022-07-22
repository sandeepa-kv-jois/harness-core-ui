/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getResourceIcon = (cloudProvider: string) => {
  switch (cloudProvider) {
    case 'CLUSTER':
      return 'service-kubernetes'

    case 'AWS':
      return 'service-aws'

    case 'AZURE':
      return 'service-azure'

    case 'GCP':
      return 'gcp'

    /* istanbul ignore next */
    default:
      return 'harness'
  }
}

export const getServiceIcons = (serviceProvider: string) => {
  switch (serviceProvider) {
    case 'RDS':
      return 'aws-rds'

    // case 'GCP INSTANCE':
    // case 'GCP DISK':
    //   return 'gcp-engine'

    // case 'AZURE VM':
    //   return 'azure-vm'

    // case 'AWS EC2':
    // case 'AWS EBS':
    //   return 'aws-ectwo-service'

    /* istanbul ignore next */
    default:
      return 'dashboard'
  }
}
