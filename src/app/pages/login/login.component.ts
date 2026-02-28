import { Component, OnInit, TemplateRef, HostListener } from "@angular/core";
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
import { MessageService } from 'primeng/api';
import { CommonService } from "src/app/Services/common.service";
import { LoadingService } from "src/app/Services/loading.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [BsModalService, MessageService]
})
export class LoginComponent implements OnInit {
  AuthenticateForm: FormGroup;
  loginForm: FormGroup;
  submitted = false;
  UserInActivated = false;
  _LogData: any;
  fieldTextType: boolean;
  modalRef: BsModalRef;
  lbl: any;
  OTPScreen = false
  countdown: number = 0; // Countdown in seconds
  private timer: any;
  showPassword: boolean = false;

  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';
  animal: string;
  name: string;
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
    private _commonService: CommonService,
    private loadingService: LoadingService
  ) { }

  @HostListener('window:beforeunload', ['$event'])
  confirmReload($event: any): void {
    if (this.OTPScreen) {
      $event.preventDefault();
      $event.returnValue = 'Are you sure you want to reload? You might lose your OTP process.';
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.AuthenticateForm = this.formBuilder.group({
      username: [''],
      OTP: ['', Validators.required],
    });

    localStorage.clear();
    this.lbl = "estoragesupport@crownims.com";

    this.RedirectedMessage();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  RedirectedMessage() {
    const message = this._commonService.getMessage();
    setTimeout(() => {
      if (message) {
        this.showSuccessmessage(message);
      }
    }, 100);
  }

  startCountdown(): void {
    this.countdown = 60;
    this.clearTimer();
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.clearTimer();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  HelpDailog(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }

  onSubmit(D: any) {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (D == 1) {
      this.loginForm.patchValue({
        // username: this._commonService.encryptData(this.loginForm.controls['username'].value),
        password: this._commonService.encryptData(this.loginForm.controls['password'].value),
      });
    }
    else if (D == 2) {
      let pass = this._commonService.decryptdata(this.loginForm.controls['password'].value);
      this.loginForm.patchValue({
        // username: this._commonService.encryptData(this.loginForm.controls['username'].value),
        password: this._commonService.encryptData(pass),
      });
    }

    this.submitted = true;
    const apiUrl = this._global.baseAPIUrl + 'UserLogin/Create';
    // this.authService.userLogin(this.loginForm.value, apiUrl).subscribe(data => {
    this._onlineExamService.postData(this.loginForm.value, apiUrl).subscribe(data => {

      if (data.length > 0 && data[0].id != 0) {
        var that = this;
        that._LogData = data[0];

        if (that._LogData.Days <= 15) {
          console.log(that._LogData.Days);
          var mess = " Your password expires in  " + that._LogData.Days + "  days. Change the password as soon as possible to prevent login problems"
          this.showSuccessmessage(mess);
        }
        this.AuthenticateForm.controls['username'].setValue(this.loginForm.get("username").value);
        this.OTPScreen = true;
        this.startCountdown();
      }
      else if (data[0].userid === null || data[0].userid === '') {
        this.ErrorMessage("Wrong EmialID and Password.");
      }
      else {
        this.ErrorMessage(data[0].userid)
      }
    });
  }

  VerifyOTP() {
    this.AuthenticateForm.patchValue({
      OTP: this._commonService.encryptData(this.AuthenticateForm.controls['OTP'].value),
    });
    this.submitted = true;
    this.AuthenticateForm.controls['username'].setValue(this.loginForm.get("username").value);
    const apiUrl = this._global.baseAPIUrl + 'UserLogin/VerifyOTP';
    this._onlineExamService.postData(this.AuthenticateForm.value, apiUrl).subscribe({
      next: (data) => {
        this.showSuccessmessage(data);
        this.SignIn();
        this.otpReset();
      },
      error: (errorResponse) => {
        const errorMessage = errorResponse.error.Message;
        this.ErrorMessage(errorMessage);
        if (errorResponse.status === 403) {
          this.UserInActivated = true;
        }
        this.otpReset();
      }
    });
  }

  SignIn() {
    this.submitted = true;
    const apiUrl = this._global.baseAPIUrl + 'UserLogin/UserSignIn';
    this.authService.userLogin(this.loginForm.value, apiUrl).subscribe({
      next: (data) => {

        this.loadingService.manualLoading(true);

        if (data.length > 0 && data[0].id != 0) {
          var that = this;
          that._LogData = data[0];

          if (that._LogData.Days <= 15) {
            console.log(that._LogData.Days);
            var mess = " Your password expires in  " + that._LogData.Days + "  days. Change the password as soon as possible to prevent login problems"
            this.showSuccessmessage(mess);
          }

          localStorage.setItem('UserID', that._LogData.id);
          localStorage.setItem('currentUser', that._LogData.id);
          localStorage.setItem('sysRoleID', that._LogData.sysRoleID);
          localStorage.setItem('User_Token', that._LogData.User_Token);
          localStorage.setItem('UsertypeID', that._LogData.UsertypeID);
          localStorage.setItem('UserName', this.loginForm.get("username").value);
          localStorage.setItem('LevelType', that._LogData.UserLevel);
          this.OTPScreen = true;

          if (this.loginForm.get("username").value == "admin") {
            this.router.navigate(['process/code-verification']).finally(() => {
              this.loadingService.manualLoading(false);
            });
          } else {
            this.router.navigate(['process/code-verification']).finally(() => {
              this.loadingService.manualLoading(false);
            });
          }
        }
        else if (data[0].userid === null || data[0].userid === '') {
          this.ErrorMessage("Wrong UserID and Password.");
          this.loadingService.manualLoading(false);
        }
        else {
          this.ErrorMessage(data[0].userid)
          this.loadingService.manualLoading(false);
        }
      },
      error: () => {
        this.loadingService.manualLoading(false);
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  get d() {
    return this.AuthenticateForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ErrorMessage(msg: any) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, sticky: false });
  }

  showSuccessmessage(data: any) {
    this.messageService.add({ severity: "success", summary: "Success", detail: data, });
  }

  otpReset() {
    const otpControl = this.AuthenticateForm.controls['OTP'];
    otpControl.setValue('');
    otpControl.markAsPristine();
    otpControl.markAsUntouched();
    otpControl.updateValueAndValidity();
  }
}

