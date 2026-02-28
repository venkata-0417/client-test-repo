import { Injectable } from '@angular/core';
@Injectable()
export class Globalconstants {
  readonly baseAPIUrl:
    // string = 'http://18.223.99.95/GDMS/api/';

// **********************************************************************************
    // Also need to change the Reset Password Link from forget-password-new.component.ts file,
    // , timeout duration in online-exam.component.ts file
    // & Screenshot prevention logic in pull-code.component.ts file
// **********************************************************************************

    string = 'http://localhost:50819/api/';

    // string = 'https://dmstest.crownims.com/escrowAPI/api/';

    // string = 'https://codescrow.crownims.com/escrowAPI/api/'; 
 
    // string = 'https://demodms.crownims.com/escrowAPI/api/';

    // string = 'http://52.77.47.210/escrowAPI/api/';

}