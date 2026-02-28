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
import { DomSanitizer, SafeHtml, SafeResourceUrl } from "@angular/platform-browser";
import { CommonService } from "src/app/Services/common.service";
import { elasticIn } from "@amcharts/amcharts4/.internal/core/utils/Ease";

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-code-release',
  templateUrl: './code-release.component.html',
  styleUrls: ['./code-release.component.scss']
})

export class CodeReleaseComponent implements OnInit {

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
  Depositor = false;
  LEVEL1 = false;
  LEVEL2 = false;
  Beneficiary = false;
  Admin = false;
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
  leveltitle: any;
  showPdf: boolean = false;
  pdfUrl!: SafeResourceUrl;


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
    private _commonService: CommonService
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
      LevelType: localStorage.getItem("LevelType"),
    });

    if (localStorage.getItem('UsertypeID') === '1' || localStorage.getItem("UsertypeID") === '4') {
      this.Beneficiary = true;
    }
    else if (localStorage.getItem('UsertypeID') === '2') {
      this.Depositor = true;
    }
    if (localStorage.getItem("LevelType") === "LEVEL1") {
      this.LEVEL1 = true;
      this.leveltitle = "Depositor Level-1 ";
    } else if (localStorage.getItem("LevelType") === "LEVEL2") {
      this.LEVEL2 = true;
      this.leveltitle = "Depositor Level-2 ";
    }

    if (localStorage.getItem('UsertypeID') === '4') {
      this.Admin = true;
    }

    this.Getpagerights();
    this.GetProjectListForCodeRelease();
    this.GetProjectListForReleaseApproval();
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

  GetProjectListForCodeRelease() {
    const apiUrl = this._global.baseAPIUrl + "Master/GetProjectListForCodeRelease?user_Token=" + localStorage.getItem("User_Token") + "&UserID=" + localStorage.getItem("UserID") + "&PID=" + null;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.events = data && data.length > 0 ? data : null;
      this._FilteredList = data;
    });
  }

  GetProjectListForReleaseApproval() {
    const apiUrl = this._global.baseAPIUrl + "Master/GetProjectListForReleaseApproval?user_Token=" + localStorage.getItem("User_Token") + "&UserID=" + localStorage.getItem("UserID") + "&LevelType=" +
      localStorage.getItem("LevelType");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.Approval = data && data.length > 0 ? data : null;
      this._FilteredList = data;
    });
  }

  CodeReleaseRequest(ProjectD: any) {
    this.router.navigate(["/process/code-release-request"]);
    localStorage.setItem('_PID', ProjectD.PID);
  }

  AdminRequestApprove(ProjectD: any) {
    this.router.navigate(["/process/code-release-approve"]);
    localStorage.setItem('_PID', ProjectD.PID);
  }

  onCodeApproval(DepositorStatus: string, item: any) {
    this.CodeReleaseForm.patchValue({
      Comment: this.CodeReleaseForm.controls['Comment'].value,
      PID: item.PID,
      project_id: item.PID,
      ProjectName: item.ProjectName,
      Version: item.Version,
      Status: DepositorStatus,
      LevelType: localStorage.getItem("LevelType"),
    });

    if (this.CodeReleaseForm.valid) {
      const apiUrl = this._global.baseAPIUrl + "Master/DepositorCodeApproval";
      this._onlineExamService.postData(this.CodeReleaseForm.value, apiUrl).subscribe((data) => {
        this.onVerifyReset();
        this.GetProjectListForReleaseApproval();
        if (data == "Depositor LEVEL-1 Status cannot be NULL or Empty.") {
          this.ShowErrormessage(data);
          DepositorStatus = "LEVEL-1 Status cannot be NULL or Empty";
        } else {
          this.ShowMessage(data);
        }
        this._onlineExamService.triggerReload();
        this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Depositor ' + DepositorStatus + ' Request', item.ProjectName).subscribe(
          (Res: any) => { });
      });
    } else {
      console.error("Form is invalid");
    }
  }

  SourceCodeDownload(_projectL: any) {
    if (_projectL.VerificationLevel == 'Level-1 (Unreviewed Upload)') {
      this.router.navigate(["/process/code-download"]);
    }
    else {
      this.router.navigate(["/process/code-browse"]);
    }
    localStorage.setItem('_PID', _projectL.PID);
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

  // openPdf(item: any) {
  //   if (!item.PdfFilePath) {
  //     this.ShowErrormessage('PDF not available');
  //     return;
  //   }
  //   const ProjectName = item.ProjectName;
  //   // Extract only filename if backend stored full path
  //   const fileName = item.PdfFilePath.split('\\').pop();
  //   this._onlineExamService.getPdfapiUrl(ProjectName, fileName).subscribe({
  //     next: (blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //       this.showPdf = true;
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       alert('Unable to load PDF');
  //     }
  //   });
  // }

  openPdf(item: any) {
    debugger;
    if (!item.PdfFilePath) {
      this.ShowErrormessage('PDF not available');
      return;
    }

    const ProjectName = item.ProjectName;
    const fileName = item.PdfFilePath.split('\\').pop();

    this._onlineExamService.getPdfapiUrl(ProjectName, fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 10000);
      },
      error: (err) => {
        console.error(err);
        alert('Unable to load PDF');
      }
    });
  }


  closePdf() {
    this.showPdf = false;
  }

  downloadPdf(item: any) {
    if (!item.PdfFilePath || !item.ProjectName) {
      alert('PDF not available');
      return;
    }

    const fileName = item.PdfFilePath.split('\\').pop();
    const projectName = item.ProjectName;

    this._onlineExamService.getPdfapiUrl(projectName, fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err);
        alert('Unable to download PDF');
      }
    });
  }

  getRemainingDays(adminApprovalAt: string): number {
    debugger
    if (!adminApprovalAt) {
      return 0;
    } else {
      adminApprovalAt = this._commonService.formatLocalTime(adminApprovalAt);
    }

    let approvalDate: Date;

    if (typeof adminApprovalAt === 'string') {
      // Expected format: dd-MM-yyyy HH:mm:ss
      const [datePart, timePart] = adminApprovalAt.split(' ');
      const [day, month, year] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);

      approvalDate = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes
      );
    } else {
      approvalDate = new Date(adminApprovalAt);
    }

    const today = new Date();

    // Normalize time
    approvalDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const releaseDate = new Date(approvalDate);
    releaseDate.setDate(releaseDate.getDate() + 7);

    const diffTime = releaseDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return remainingDays;
  }
}
