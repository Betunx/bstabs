import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

// Set debug mode flag for conditional logging
(window as any).__DEBUG_MODE__ = environment.enableDebugMode;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
