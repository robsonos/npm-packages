<p align="center">
  <img 
      alt="Maintenance status"
      src="https://img.shields.io/maintenance/yes/2024?style=flat-square">
  <a
    href="https://github.com/robsonos/npm-packages/actions/workflows/ci.yml"
    style="color: inherit; text-decoration: none;">
    <img
      alt="GitHub Workflow Status (with event)"
      src="https://img.shields.io/github/actions/workflow/status/robsonos/npm-packages/ci.yml">
  </a>
  <a
    href="https://www.npmjs.com/package/@robsonos/ionic-mdi"
    style="color: inherit; text-decoration: none;">
    <img 
      alt="GitHub License"
      src="https://img.shields.io/npm/l/@robsonos/ionic-mdi?style=flat-square">
  </a>
  <br />
  <a
    href="https://www.npmjs.com/package/@robsonos/ionic-mdi"
    style="color: inherit; text-decoration: none;">
    <img
      alt="Version from npmjs"
      src="https://img.shields.io/npm/v/@robsonos/ionic-mdi?style=flat-square">
  </a>
  <a
    href="https://www.npmjs.com/package/@robsonos/ionic-mdi"
    style="color: inherit; text-decoration: none;">
    <img
      alt="Downloads from npmjs"
      src="https://img.shields.io/npm/dw/@robsonos/ionic-mdi?style=flat-square">
  </a>
  <a
    href="#contributors"
    style="color: inherit; text-decoration: none;">  
    <img
        alt="GitHub contributors from allcontributors.org"
        src="https://img.shields.io/github/all-contributors/robsonos/npm-packages">
  </a>
</p>

## Usage

- Import the icons to the component

```typescript
import { addIcons } from 'ionicons';
import {
    iconSettingsRound,
    iconWarningOutlined,
    iconWarningSharp,
    iconBattery0BarOutlined,
} from '@material-design-icons/svg/icons';
...
 constructor() {
    addIcons({
      iconSettingsRound,
      iconWarningOutlined,
      iconWarningSharp,
      battery0: iconBattery0BarOutlined,
    })
 }
 ...
```

- Then use them on the template:

```html
<ion-icon name="icon-settings-round"></ion-icon>
<ion-icon ios="icon-warning-outlined" md="icon-warning-sharp"></ion-icon>
<ion-icon name="battery0"></ion-icon>
```

For more details check out Ionic's [build options](https://ionicframework.com/docs/angular/build-options)

## Licenses

This project uses Material Design icon by Google, licensed under the Apache License 2.0. See the [LICENSE](LICENSE) for details.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
