import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforces specific scopes
    'scope-enum': [RuleConfigSeverity.Error, 'always', ['repo', 'ionic-mdi']],
    // Ensures that a scope is always provided
    'scope-empty': [RuleConfigSeverity.Error, 'never'],
  },
};

export default Configuration;
