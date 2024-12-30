# ionic-mdi

<!-- TODO: mention: -->
<!-- https://fonts.google.com/icons?icon.set=Material+Icons
https://github.com/marella/material-design-icons -->

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
<ion-icon name="icon-settings-round"> </ion-icon>
<ion-icon ios="icon-warning-outlined" md="icon-warning-sharp"> </ion-icon>
<ion-icon name="battery0"> </ion-icon>
```

https://ionicframework.com/docs/angular/build-options#ngmodule-based-applications
