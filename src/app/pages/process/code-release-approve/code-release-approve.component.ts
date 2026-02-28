import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LoadingService } from './../../../Services/loading.service'
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService, TreeNode } from "primeng/api";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { CommonService } from "src/app/Services/common.service";

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-code-release-approve',
  templateUrl: './code-release-approve.component.html',
  styleUrls: ['./code-release-approve.component.scss']
})
export class CodeReleaseApproveComponent implements OnInit {

  temp = [];
  activeRow: any;
  modalRef: BsModalRef;
  _FilteredList: any;
  _FilteredListFolder: any;
  _RoleList: any;
  _UsertypeList: any;
  CodeReleaseForm: FormGroup;
  submitted = false;
  Reset = false;
  _SingleUser: any = [];
  User: any;
  first = 0;
  rows = 10;
  firstFolder = 0;
  rowsFolder = 10;
  events: any
  Approval: any
  files: any[] = [];
  selectionMode: string;
  entries: number = 10;
  _RList = []
  _IndexList: any;
  sMsg: string = "";


  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private loadingService: LoadingService,
    public _commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.CodeReleaseForm = this.formBuilder.group({
      PID: [''],
      project_id: [''],
      ProjectName: [''],
      Version: [''],
      Status: [''],
      Comment: ['', Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.CodeReleaseForm.controls['PID'].setValue(localStorage.getItem("_PID"));

    this.Getpagerights();
    this.GetProjectDetailsForReleaseApprovalByAdmin();
    this.User = "code-release";
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

  get f() {
    return this.CodeReleaseForm.controls;
  }
    
  GetProjectDetailsForReleaseApprovalByAdmin() {
    const apiUrl = this._global.baseAPIUrl + "Master/GetProjectDetailsForReleaseApprovalByAdmin?user_Token=" + localStorage.getItem("User_Token") + "&UserID=" + localStorage.getItem("UserID") + "&PID=" + this.CodeReleaseForm.controls['PID'].value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.events = data && data.length > 0 ? data : null;
      this._FilteredList = data;
      this.CodeReleaseForm.patchValue({
        project_id: this.events[0].PID,
        ProjectName: this.events[0].ProjectName,
        Version: this.events[0].Version
      });
    });
  }

  onBack() {
    localStorage.removeItem('_PID');
    this.router.navigate(['/process/code-release']);
  }

  onCodeApproval(DepositorStatus: string, item: any){
    this.CodeReleaseForm.patchValue({
      Comment: this.CodeReleaseForm.controls['Comment'].value,
      PID: item.PID,
      project_id: item.PID,
      ProjectName: item.ProjectName,
      Version: item.Version,
      Status: DepositorStatus
    });

    if (this.CodeReleaseForm.valid) {
      const apiUrl = this._global.baseAPIUrl + "Master/AdminCodeApproval";
      this._onlineExamService.postData(this.CodeReleaseForm.value, apiUrl).subscribe((data) => {
          this.onVerifyReset();
          this.onBack();
          this.ShowMessage(data);
          this._onlineExamService.triggerReload();
          this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Admin '+ DepositorStatus +' Request', item.ProjectName).subscribe(
            (Res: any) => { });
        });
    } else {
      console.error("Form is invalid");
    }
  }

  onVerifyReset() {
    this.CodeReleaseForm.patchValue({
      Comment: '',
    });
  }

  onActivate(event) {
    this.activeRow = event.row;
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
