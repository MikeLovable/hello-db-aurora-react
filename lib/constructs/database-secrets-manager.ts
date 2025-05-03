
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { DatabaseSecrets } from './interfaces';

/**
 * Creates and manages database secrets for different user roles
 */
export class DatabaseSecretsManager {
  /**
   * Create secrets for database users
   * 
   * @param scope The CDK construct scope
   * @param id Base ID for the secrets
   * @returns Object containing the created secrets
   */
  public static createDatabaseSecrets(scope: Construct, id: string): DatabaseSecrets {
    const adminUserSecret = new secretsmanager.Secret(scope, 'AdminUserSecret', {
      secretName: `${id}-admin-user-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'adminuser' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
      },
    });

    const appUserSecret = new secretsmanager.Secret(scope, 'AppUserSecret', {
      secretName: `${id}-app-user-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'appuser' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
      },
    });

    const customResourceUserSecret = new secretsmanager.Secret(scope, 'CustomResourceUserSecret', {
      secretName: `${id}-cr-user-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'cruser' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
      },
    });

    return {
      adminUserSecret,
      appUserSecret,
      customResourceUserSecret
    };
  }
}
