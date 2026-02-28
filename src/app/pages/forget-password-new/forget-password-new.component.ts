import { Component, OnInit, TemplateRef } from "@angular/core";
import { Globalconstants } from "../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../Services/online-exam-service.service";

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import { AuthenticationService } from '../../Services/authentication.service';
import { DxiConstantLineModule } from "devextreme-angular/ui/nested";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { MessageService } from "primeng/api";
import { CommonService } from "src/app/Services/common.service";

@Component({
  selector: 'app-forget-password-new',
  templateUrl: './forget-password-new.component.html',
  styleUrls: ['./forget-password-new.component.scss'],
  providers: [BsModalService]
})
export class ForgetPasswordNewComponent implements OnInit {

  ForgotPasswordForm: FormGroup;
  submitted = false;
  _LogData: any;
  modalRef: BsModalRef;
  lbl: any;
  config = {
    class: 'modal-dialog-centered'
  }
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private http: HttpClient,
    private httpService: HttpClient,
    private messageService: MessageService,
    private _commonService: CommonService

  ) { }

  ngOnInit(): void {

    this.ForgotPasswordForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])]
    });

    localStorage.clear();
    this.lbl = "estoragesupport@crownims.com";
  }

  HelpDailog(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }
  
  onSubmit() {
    this.submitted = true;
    if (this.ForgotPasswordForm.invalid) {
      return;
    }
    
    let email = this._commonService.encryptData(this.ForgotPasswordForm.get('username')?.value);

    let modifiedforpath = email.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    // let resetRoute = `/#/reset-password/${modifiedforpath}`; // Live

    let resetRoute = `/escrow/#/reset-password/${modifiedforpath}`; // DMSTest or DemoDMS

    let baseUrl = window.location.origin; // e.g., http://localhost:4200 or https://yourdomain.com

    let fullResetUrl = this._commonService.encryptData(`${baseUrl}${resetRoute}`);

    let requestData = {
      url: fullResetUrl,
      username: email
    };

    const apiUrl = this._global.baseAPIUrl + 'UserLogin/Forgotpassword';
    this._onlineExamService.postData(requestData, apiUrl).subscribe({
      next: (data) => { 
        this._commonService.setMessage('A password reset link has been sent to your email address.');
        // this.showSuccessmessage('A password reset link has been sent to your email address.');
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
