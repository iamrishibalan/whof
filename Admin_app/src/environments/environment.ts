
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  baseURL: 'https://foodapp.s2ftech.in/api/index.php/',
  mediaURL: 'https://foodapp.s2ftech.in/api/uploads/',
  onesignal: {
    appId: '59e83a37-26d6-409a-8458-b7e96440d964',
    googleProjectNumber: 'GOOGLE_PROJECT_NUMBER',
    restKey: 'NmZiYmJhYjMtZDZiMS00YmZlLWE4ODAtN2VjZWZlN2E3OWVh'
  },
  general: {
    symbol: '₹',
    code: 'INR'
  },
  authToken: 's2ftech',
  default_country_code: '91'
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
