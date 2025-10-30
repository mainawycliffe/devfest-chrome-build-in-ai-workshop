import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { TextImproverComponent } from './app/components/text-improver/text-improver.component';

bootstrapApplication(TextImproverComponent, appConfig)
  .catch((err) => console.error(err));
