import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import DOMPurify from 'dompurify';
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "primeng/api";
import { EMPTY } from "rxjs";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-git-selection',
  templateUrl: './git-selection.component.html',
  styleUrls: ['./git-selection.component.scss']
})
export class GitSelectionComponent implements OnInit {
  GitSelectionForm: FormGroup;
  submitted = false;
  activated = false;
  Reset = false;
  scheduleractivity = false;
  activationBtn = false;
  isReadonly = false;
  schedulerType: string = '';
  backbtn: string;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.GitSelectionForm = this.formBuilder.group(
      {
        GITID: [0],
        project_id: ["", Validators.required],
        ProjectName: ["", Validators.required],
        // remoteDirectory: ["", Validators.required],
        git_user: ["", Validators.required],
        repoUrl: ["", Validators.required],
        token: ["", [Validators.required]],
        // , Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]{10,}$/)],
        repository: ["", Validators.required],
        Scheduler: [0, [Validators.required, Validators.pattern(/^(?!0$)/)]],
        SchedulerFrequency: ['', [Validators.required]],
        isActivate: [''],
        DailyTime: [''],
        WeeklyDay: [''],
        WeeklyTime: [''],
        MonthlyDate: ['', [Validators.min(1), Validators.max(31)]],
        MonthlyTime: [''],

        User_Token: localStorage.getItem("User_Token"),
        user_Token: localStorage.getItem("User_Token"),
        CreatedBy: localStorage.getItem("UserID"),
      }
    )

    let _PID = localStorage.getItem('_PID');

    if (Number(_PID) > 0) {
      this.GitSelectionForm.controls['project_id'].setValue(localStorage.getItem('_PID'));
      this.GitSelectionForm.controls['ProjectName'].setValue(localStorage.getItem('_ProjectName'));
      this.GitSelectionForm.controls['GITID'].setValue(localStorage.getItem('_Config_TypeId'));
    }
    if (_PID === '') {
      this.GitSelectionForm.controls['ProjectName'].setValue(localStorage.getItem('_ProjectName'));
    }

    if (this.GitSelectionForm.controls['GITID'].value !== 0 && this.GitSelectionForm.controls['GITID'].value !== null) {
      this.getGITDetails();
    }
    else if(this.GitSelectionForm.controls['GITID'].value !== 0 && this.GitSelectionForm.controls['GITID'].value !== null && this.backbtn === "ActivationCompleted"){
      this.getSFTPDetailsForEdit();
    }
  }

  get f() {
    return this.GitSelectionForm.controls;
  }
  //Old Function Kapil
  // getGITDetails() {
  //   const apiUrl = this._global.baseAPIUrl + "Git/GetDetailsByID?Id=" + this.GitSelectionForm.get('GITID').value + "&user_Token=" + this.GitSelectionForm.get('User_Token').value
  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
  //     this.GitSelectionForm.patchValue({
  //       git_user: data[0].git_user,
  //       repoUrl: data[0].repoUrl,
  //       token: data[0].token,
  //       repository: data[0].repository,
  //       remoteDirectory: data[0].remoteDirectory,
  //       Scheduler: data[0].Scheduler,
  //       SchedulerFrequency: data[0].SchedulerFrequency,
  //       DailyTime: data[0].DailyTime,
  //       WeeklyDay: data[0].WeeklyDay,
  //       WeeklyTime: data[0].WeeklyTime,
  //       MonthlyDate: data[0].MonthlyDate,
  //       MonthlyTime: data[0].MonthlyTime,
  //       isActivate: data[0].isActivate,
  //     });

  //     if (this.GitSelectionForm.controls['isActivate'].value === "N" || this.GitSelectionForm.controls['isActivate'].value === null) {
  //       this.activationBtn = true;
  //     }

  //     if (this.GitSelectionForm.controls['Scheduler'].value === "Y") {
  //       this.scheduleractivity = true;
  //     }

  //     if (this.GitSelectionForm.controls['SchedulerFrequency'].value === "Daily") {
  //       this.schedulerType = this.GitSelectionForm.controls['SchedulerFrequency'].value;
  //     }
  //     else if (this.GitSelectionForm.controls['SchedulerFrequency'].value === "Weekly") {
  //       this.schedulerType = this.GitSelectionForm.controls['SchedulerFrequency'].value;
  //     }
  //     else if (this.GitSelectionForm.controls['SchedulerFrequency'].value === "Monthly") {
  //       this.schedulerType = this.GitSelectionForm.controls['SchedulerFrequency'].value;
  //     }
  //     else {
  //       this.schedulerType = "";
  //     }
  //   });
  //   this.isReadonly = true;
  // }

  getSFTPDetailsForEdit(){
    const apiUrl = this._global.baseAPIUrl + "SFTP/GetDetailsBySFTPID?Id=" + this.GitSelectionForm.get('GITID').value + "&user_Token=" + this.GitSelectionForm.get('User_Token').value
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      this.GitSelectionForm.controls['git_user'].setValue(data[0].git_user);
      this.GitSelectionForm.controls['repoUrl'].setValue(data[0].repoUrl);
      this.GitSelectionForm.controls['token'].setValue(data[0].token);
      this.GitSelectionForm.controls['repository'].setValue(data[0].repository);
      this.GitSelectionForm.controls['remoteDirectory'].setValue(data[0].remoteDirectory);
    });
  }

  ///changes added by dhanashree
  getGITDetails() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Git/GetDetailsByID?Id=" +
      this.GitSelectionForm.get("GITID").value 
      + "&user_Token=" +
      this.GitSelectionForm.get("User_Token").value
      + "&CreatedBy=" +
      this.GitSelectionForm.get("CreatedBy").value;

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (!data) return;

      const maskedValue = "*********";

      const gitUserValue = data.git_user ? maskedValue : "";
      const repoUrlValue = data.repoUrl ? maskedValue : "";
      const tokenValue = data.token ? maskedValue : "";

      this.GitSelectionForm.patchValue({
        git_user: gitUserValue,
        repoUrl: repoUrlValue,
        token: tokenValue,
        repository: data.repository,
        remoteDirectory: data.remoteDirectory,
        Scheduler: data.Scheduler,
        SchedulerFrequency: data.SchedulerFrequency,
        DailyTime: data.DailyTime,
        WeeklyDay: data.WeeklyDay,
        WeeklyTime: data.WeeklyTime,
        MonthlyDate: data.MonthlyDate,
        MonthlyTime: data.MonthlyTime,
        isActivate: data.isActivate,
      });

      const isMasked = (value: string) => value === maskedValue;
      const allMasked = isMasked(gitUserValue) && isMasked(repoUrlValue) && isMasked(tokenValue);
      const allEmpty = !data.git_user && !data.repoUrl && !data.token;

      if (allMasked) {
        this.isReadonly = true;
        this.GitSelectionForm.controls["git_user"].disable();
        this.GitSelectionForm.controls["repoUrl"].disable();
        this.GitSelectionForm.controls["token"].disable();
      } else if (allEmpty) {
        this.isReadonly = false;
        this.GitSelectionForm.controls["git_user"].enable();
        this.GitSelectionForm.controls["repoUrl"].enable();
        this.GitSelectionForm.controls["token"].enable();
      }

      this.activationBtn = (this.GitSelectionForm.controls['isActivate'].value === "N" || this.GitSelectionForm.controls['isActivate'].value === null);

      this.scheduleractivity = (this.GitSelectionForm.controls['Scheduler'].value === "Y");

      const schedulerFreq = this.GitSelectionForm.controls['SchedulerFrequency'].value;
      this.schedulerType = ["Daily", "Weekly", "Monthly"].includes(schedulerFreq) ? schedulerFreq : "";
    });

    this.isReadonly = true;
  }

  verifyInput($event){
    const target = $event.target as HTMLInputElement;
    const rawValue = target.value;
  
    const cleanValue = DOMPurify.sanitize(rawValue, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  
    if (rawValue !== cleanValue) {
      alert('Invalid input: HTML or script content is not allowed.');
      target.value = ''; 
      return;
    }
  }

  OnBack() {
    localStorage.removeItem('_PID');
    localStorage.removeItem('_ProjectName');
    localStorage.removeItem('_Config_TypeId');
    this.router.navigate(['/master/Project']);
  }

  onSubmit() {
    this.submitted = true;

    this.GitSelectionForm.patchValue({
      CreatedBy: localStorage.getItem('UserID'),
      User_Token: localStorage.getItem('User_Token'),
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/Create';
    this._onlineExamService.postData(this.GitSelectionForm.value, apiUrl)
      .subscribe(data => {
        this.ShowMessage(data);
      });
    this.activationBtn = true;
    this.isReadonly = true;
  }

  onActivateBtn() {
    this.activated = true;

    this.GitSelectionForm.patchValue({
      CreatedBy: localStorage.getItem('UserID'),
      User_Token: localStorage.getItem('User_Token'),
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/GitActivation';
    this._onlineExamService.postData(this.GitSelectionForm.value, apiUrl)
      .subscribe({
        next: (data) => {
          this.ShowMessage(data);
          this.router.navigate(['/master/Project']).then(() => {
            window.location.reload();
          });
      },
      error: (errorResponse) => {
        const errorMessage = errorResponse.error.Message;
        this.ShowErrormessage(errorMessage);
      }
    });
    localStorage.removeItem('_PID');
    localStorage.removeItem('_ProjectName');
    localStorage.removeItem('_Config_TypeId');
  }

  Scheduler(value: any) {
    if (value === "Y") {
      this.scheduleractivity = true;
      this.GitSelectionForm.patchValue({
        SchedulerFrequency: 0
      });
    } else {
      this.scheduleractivity = false;
      this.schedulerType = '',
        this.GitSelectionForm.patchValue({
          SchedulerFrequency: 0,
          DailyTime: '',
          WeeklyDay: '',
          WeeklyTime: '',
          MonthlyDate: '',
          MonthlyTime: ''
        });
    }
  }

  SchedulerFrequency() {
    this.schedulerType = this.GitSelectionForm.get('SchedulerFrequency')?.value;
    this.GitSelectionForm.patchValue({
      DailyTime: '',
      WeeklyDay: 0,
      WeeklyTime: '',
      MonthlyDate: '',
      MonthlyTime: ''
    });
  }

  OnReset(): void {
    this.GitSelectionForm.controls['git_user'].setValue("");
    this.GitSelectionForm.controls['repoUrl'].setValue("");
    this.GitSelectionForm.controls['token'].setValue("");
    this.GitSelectionForm.controls['repository'].setValue("");
    this.GitSelectionForm.controls['DailyTime'].setValue("");
    this.GitSelectionForm.controls['WeeklyDay'].setValue("");
    this.GitSelectionForm.controls['WeeklyTime'].setValue("");
    this.GitSelectionForm.controls['MonthlyDate'].setValue("");
    this.GitSelectionForm.controls['MonthlyTime'].setValue("");
    this.GitSelectionForm.controls['Scheduler'].setValue(0);
    this.GitSelectionForm.controls['SchedulerFrequency'].setValue(0);
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
      severity: "success", summary: "Success", detail: data,
    });
  }

  showmessage(data: any) {
    this.messageService.add({
      severity: "success", summary: "Success", detail: data,
    });
  }
}
