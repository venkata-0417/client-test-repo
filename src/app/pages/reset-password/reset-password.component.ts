import { Component, OnInit, TemplateRef } from "@angular/core";
import { Globalconstants } from "../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../Services/online-exam-service.service";

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../../Services/authentication.service';
import { DxiConstantLineModule } from "devextreme-angular/ui/nested";
import { CommonService } from "src/app/Services/common.service";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  ForgotPasswordForm: FormGroup;
  showPassword: boolean = false;
  CheckUserForm: boolean = false;
  submitted = false;
  _LogData: any;
  error: any;
  lbl: any;
  config = {
    class: 'modal-dialog-centered'
  }
  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private http: HttpClient,
    private messageService: MessageService,
    private httpService: HttpClient,
    private _commonService: CommonService

  ) { }

  ngOnInit(): void {

    this.ForgotPasswordForm = this.formBuilder.group({
      username: [this.route.snapshot.params['REQ']],
      newPassword: ["",[Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/),],],
      confirmNewPassword: ["", Validators.required],
    },
    {
      validator: this.ConfirmedValidator("newPassword", "confirmNewPassword"),
    }
  );

    this.CheckUser(this.ForgotPasswordForm.controls['username'].value);

    localStorage.clear();
    this.lbl = "estoragesupport@crownims.com";
  }

  CheckUser(User: any){
    this.submitted = true;

    let base64 = User
    .replace(/-/g, '+')
    .replace(/_/g, '/');

    const pad = base64.length % 4;
    if (pad > 0) {
      base64 += '='.repeat(4 - pad);
    }

    const apiUrl = this._global.baseAPIUrl + 'UserLogin/CheckUser';
    this._onlineExamService.postData({ base64 }, apiUrl).subscribe({
      next: (data) => { 
        this.CheckUserForm = false;
        // this.showSuccessmessage(data)
      },
      error: (errorResponse) => {
        const errorMessage = errorResponse.error.Message;
        this.ErrorMessage(errorMessage);
        this.error = errorMessage;
        this.CheckUserForm = true;
      }
    });
  }

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors.confirmedValidator
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
  
  onSubmit() {

    this.submitted = true;
    if (this.ForgotPasswordForm.invalid) {
      return;
    }

    let User = this.ForgotPasswordForm.controls['username'].value;
    let base64 = User
    .replace(/-/g, '+')
    .replace(/_/g, '/');

    const pad = base64.length % 4;
    if (pad > 0) {
      base64 += '='.repeat(4 - pad);
    }

    this.ForgotPasswordForm.patchValue({
      username: base64,
      newPassword: this._commonService.encryptData(this.ForgotPasswordForm.controls['newPassword'].value),
      confirmNewPassword: this._commonService.encryptData(this.ForgotPasswordForm.controls['confirmNewPassword'].value),
    });

    const apiUrl = this._global.baseAPIUrl + 'UserLogin/ResetPassword';
    this._onlineExamService.postData(this.ForgotPasswordForm.value, apiUrl).subscribe({
      next: (data) => { 
        // this.showSuccessmessage(data);
        this._commonService.setMessage(data);
        this.router.navigate(["/Login"]);
      },
      error: (errorResponse) => {
        const errorMessage = errorResponse.error.Message;
        this.ErrorMessage(errorMessage);
      }
    });
  }

  get f() {
    return this.ForgotPasswordForm.controls;
  }
N
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ErrorMessage(msg: any) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, sticky: false });
  }

  showSuccessmessage(data: any) {
    this.messageService.add({ severity: "success", summary: "Success", detail: data, });
  }

  OnReset() {
    this.ForgotPasswordForm.reset();
  }

}
