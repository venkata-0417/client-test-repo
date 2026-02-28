import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormControl, FormBuilder, Validators } from "@angular/forms";
import swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonService } from "src/app/Services/common.service";
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  UserList: any;
  changepasswordform: FormGroup;
  submitted = false;
  Reset = false;
  //_UserList: any;
  sMsg: string = "";
  //RoleList: any;
  _SingleUser: any = [];
  _UserID: any;

  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;

  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    public toastr: ToastrService,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private _commonService: CommonService
  ) { }

  ngOnInit(): void {
    
    this.changepasswordform = this.formBuilder.group({
      currentpwd: ["", Validators.required],
      pwd: ["", [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)]],
      confirmPass: ["", Validators.required],
      // recaptcha: ["", Validators.required],           
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID')

    }, {
      validator: this.ConfirmedValidator('pwd', 'confirmPass')
    });

    this.Getpagerights();
  }
  
  Getpagerights() {
    var pagename = "code-release";
    const apiUrl = this._global.baseAPIUrl + "Admin/Getpagerights?userid=" + localStorage.getItem("UserID") + "&pagename=" + pagename + "&user_Token=" + localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data) => {
      if (data <= 0) {
        localStorage.clear();
        this.router.navigate(["/Login"]);
      }
    });
  }

  //Newly added code 
  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }
  get f() {
    return this.changepasswordform.controls;
  }

  OnResetdata() {
    this.changepasswordform.controls['currentpwd'].setValue('');
    this.changepasswordform.controls['pwd'].setValue('');
    this.changepasswordform.controls['confirmPass'].setValue('');

  }

  onSubmit() {
    this.submitted = true;
    if (this.changepasswordform.invalid) {
      return;
    }

    this.changepasswordform.patchValue({
      currentpwd: this._commonService.encryptData(this.changepasswordform.controls['currentpwd'].value),
      pwd: this._commonService.encryptData(this.changepasswordform.controls['pwd'].value),
      confirmPass: this._commonService.encryptData(this.changepasswordform.controls['confirmPass'].value),
    });

    const apiUrl = this._global.baseAPIUrl + 'UserLogin/Changepassword';
    this._onlineExamService.postData(this.changepasswordform.value, apiUrl).subscribe((data: {}) => {
      if (data === "You can not reuse any password used in the previous 10 times.") {
        this.ShowErrormessage(data);
      }
      else if (data === "Enter Valid Current Password.") {
        this.ShowErrormessage(data);
      }
      else {
        this.ShowMessage(data);
      }
      this.OnResetdata();
    });

  }

  ShowErrormessage(data: any) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: data,
    });
  }

  ShowMessage(data: any) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: data,
    });
  }

  showSuccessmessage(data: any) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: data,
    });
  }
}
