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


@Component({
  selector: 'app-login-new',
  templateUrl: './login-new.component.html',
  styleUrls: ['./login-new.component.scss'],
  providers: [BsModalService, MessageService]
})

export class LoginNewComponent implements OnInit {
  AuthenticateForm: FormGroup;
  loginForm: FormGroup;
  submitted = false;
  _LogData: any;
  fieldTextType: boolean;
  modalRef: BsModalRef;
  lbl: any;
  OTPScreen = false
  countdown: number = 0; // Countdown in seconds
  private timer: any;

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
    private messageService: MessageService
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
      username: ['', Validators.compose([Validators.required]), Validators.maxLength(50)],
      password: ['', Validators.required],
    });

    this.AuthenticateForm = this.formBuilder.group({
      username: [''],
      OTP: ['', Validators.required],
    });

    localStorage.clear();
    this.lbl = "estoragesupport@crownims.com";
  }

  ngOnDestroy(): void {
    this.clearTimer(); 
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

  onSubmit() {
    this.submitted = true;
    const apiUrl = this._global.baseAPIUrl + 'UserLogin/Create';
    // this.authService.userLogin(this.loginForm.value, apiUrl).subscribe(data => {
    this._onlineExamService.postData(this.loginForm.value, apiUrl).subscribe(data => {

      if (data.length > 0 && data[0].id != 0) {
        var that = this;
        that._LogData = data[0];

        if (that._LogData.Days <= 15) {
          var mess = " Your password expires in  " + that._LogData.Days + "  days. Change the password as soon as possible to prevent login problems"
          this.showSuccessmessage(mess);
        }

        // localStorage.setItem('UserID', that._LogData.id);
        // localStorage.setItem('currentUser', that._LogData.id);
        // localStorage.setItem('sysRoleID', that._LogData.sysRoleID);
        // localStorage.setItem('User_Token', that._LogData.User_Token);
        this.AuthenticateForm.controls['username'].setValue(this.loginForm.get("username").value);
        // localStorage.setItem('UsertypeID', that._LogData.UsertypeID);
        // localStorage.setItem('UserName', this.loginForm.get("username").value);
        this.OTPScreen = true;
        this.startCountdown();
        // if (this.loginForm.get("username").value == "admin") {
        //   this.router.navigate(['process/code-verification']);
        // } else {
        //   this.router.navigate(['process/code-verification']);
        // }
      }
      else if (data[0].userid === null || data[0].userid === '') {
        this.ErrorMessage("Wrong UserID and Password.");
      }
      else {
        this.ErrorMessage(data[0].userid)
      }
    });
  }

  VerifyOTP() {
    this.submitted = true;
    this.AuthenticateForm.controls['username'].setValue(this.loginForm.get("username").value);
    const apiUrl = this._global.baseAPIUrl + 'UserLogin/VerifyOTP';
    this._onlineExamService.postData(this.AuthenticateForm.value, apiUrl).subscribe(data => {
      if (data === "OTP Expired. Please Resend it.") {
        this.ErrorMessage(data);
      }
      else if (data === "Enter Valid OTP !!!") {
        this.ErrorMessage(data);
      }
      else {
        this.showSuccessmessage(data);
        this.SignIn();
      }
    });
  }

  SignIn() {
    this.submitted = true;
    const apiUrl = this._global.baseAPIUrl + 'UserLogin/UserSignIn';
    this.authService.userLogin(this.loginForm.value, apiUrl).subscribe(data => {

      if (data.length > 0 && data[0].id != 0) {
        var that = this;
        that._LogData = data[0];

        if (that._LogData.Days <= 15) {
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
          this.router.navigate(['process/code-verification']);
        } else {
          this.router.navigate(['process/code-verification']);
        }
      }
      else if (data[0].userid === null || data[0].userid === '') {
        this.ErrorMessage("Wrong UserID and Password.");
      }
      else {
        this.ErrorMessage(data[0].userid)
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  ErrorMessage(msg: any) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, sticky: false });
  }

  showSuccessmessage(data: any) {
    this.messageService.add({ severity: "success", summary: "Success", detail: data, });
  }

}
