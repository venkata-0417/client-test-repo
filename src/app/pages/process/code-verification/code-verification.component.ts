import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LoadingService } from './../../../Services/loading.service'
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "primeng/api";
import swal from "sweetalert2";
import * as XLSX from "xlsx";
import { CommonService } from "src/app/Services/common.service";
import DOMPurify from 'dompurify';

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: 'app-code-verification',
  templateUrl: './code-verification.component.html',
  styleUrls: ['./code-verification.component.scss']
})
export class CodeVerificationComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  modalRef: BsModalRef;
  UserList: any;
  _UserL: any;
  _FilteredList: any;
  _FilteredListFolder: any;
  _RoleList: any;
  checkingActivation = false
  _UsertypeList: any;
  ProjectCodePullForm: FormGroup;
  submitted = false;
  Reset = false;
  _SingleUser: any = [];
  User: any;
  first = 0;
  rows = 10;
  firstFolder = 0;
  rowsFolder = 10;
  initilizerLoaderOn: any
  IntegrationType: any
  projectName: any
  projectInfo: any
  events: any
  rawInput = ''
  cleanInput = ''

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private _commonService: CommonService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.ProjectCodePullForm = this.formBuilder.group(
      {
        PID: [''],
        project_id: [''],
        ProjectName: [''],

        //FOR GIT 
        repoUrl: [''],
        git_user: [''],
        token: [''],

        //FOR SFTP
        host_name: [''],
        port: [''],
        user_password: [''],
        user_name: [''],
        remoteDirectory: [''],

        Comment: ['', Validators.required],
        User_Token: localStorage.getItem("User_Token"),
        user_Token: localStorage.getItem("User_Token"),
        CodePull_by: localStorage.getItem("UserID"),
        CreatedBy: localStorage.getItem("UserID"),
        Status: ['']
      }
    );

    this.Getpagerights();
    this.GetProjectListForProcessModule();
    // this.getUserType();
    this.User = "code-verification";
  }

  ViewRepo(projectdetails: any) {
    this.projectInfo = projectdetails
    this.projectName = projectdetails.ProjectName
    this.IntegrationType = projectdetails.UploadType

    if (projectdetails.Project_Status === "Activation Pending" || projectdetails.Project_Status === "Configuration Pending"
      || projectdetails.Project_Status === "Release Request Raised" || projectdetails.Project_Status === "Approved By LEVEL-1 Depositor"
      || projectdetails.Project_Status === "Approved By LEVEL-2 Depositor") {
      this.ShowErrormessage(projectdetails.Project_Status);
      return;
    }

    else if (this.IntegrationType === "GIT") {
      // this.getGITDetails(projectdetails.Config_TypeId);
      localStorage.setItem('_PID', projectdetails.PID);
      localStorage.setItem('_project_id', projectdetails.PID);
      localStorage.setItem('_ProjectName', projectdetails.ProjectName);
      localStorage.setItem('_IntegrationType', this.IntegrationType);
      localStorage.setItem('_Config_TypeId', projectdetails.Config_TypeId);
      // localStorage.setItem('_Project_Status', projectdetails.Project_Status);
      this.router.navigateByUrl("/process/pull-code");
    }
    else if (this.IntegrationType === "SFTP") {
      // this.getSFTPDetails(projectdetails.Config_TypeId);
      localStorage.setItem('_PID', projectdetails.PID);
      localStorage.setItem('_project_id', projectdetails.PID);
      localStorage.setItem('_ProjectName', projectdetails.ProjectName);
      localStorage.setItem('_IntegrationType', this.IntegrationType);
      localStorage.setItem('_Config_TypeId', projectdetails.Config_TypeId);
      // localStorage.setItem('_Project_Status', projectdetails.Project_Status);
      this.router.navigateByUrl("/process/pull-code");
    }
    else if (this.IntegrationType === "Manual Upload") {
      // this.router.navigate(["/upload/file-upload"]);
      localStorage.setItem('_PID', projectdetails.PID);
      localStorage.setItem('_project_id', projectdetails.PID);
      localStorage.setItem('_ProjectName', projectdetails.ProjectName);
      localStorage.setItem('_IntegrationType', this.IntegrationType);
      localStorage.setItem('_Config_TypeId', projectdetails.Config_TypeId);
      // localStorage.setItem('_Project_Status', projectdetails.Project_Status);
      this.router.navigateByUrl("/process/pull-code");
    }
  }

  get f() {
    return this.ProjectCodePullForm.controls;
  }

  ProjectDetails(row: any) {
    localStorage.setItem('_PID', row.PID);
    this.router.navigateByUrl("/process/project-dashboard-screen");

    this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Viewed Project Dashboard', row.ProjectName).subscribe(
      (Res: any) => { });
  }

  SourceValidator(_projectL: any) {
    this.router.navigate(["/process/code-browse"]);
    localStorage.setItem('_PID', _projectL.PID);
  }

  GetProjectListForProcessModule() {
    this.formattedData = [];
    this.headerList = [];
    const apiUrl = this._global.baseAPIUrl + "Master/GetProjectListForProcessModule?user_Token=" + localStorage.getItem("User_Token") + "&UserID=" + localStorage.getItem("UserID");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RoleList = data;
      this._FilteredList = data;
      this.prepareTableData(this._RoleList, this._FilteredList);
    });
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      // // { field: "srNo", header: "SR NO", index: 1 },
      { field: "ProjectName", header: "Project", index: 2 },
      { field: "BeneficiaryName", header: "Beneficiary", index: 4 },
      { field: "DepositorName", header: "Depositor", index: 3 },
      { field: "UploadType", header: "Deposit Method", index: 5 },
      { field: "CodeLastPullAt", header: "Recent Pull Date", index: 5 },
      { field: "VerificationLevel", header: "Verification Level", index: 8 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        // // srNo: parseInt(index + 1),
        PID: el.PID,
        ProjectName: el.ProjectName,
        DepositorName: el.DepositorName,
        BeneficiaryName: el.BeneficiaryName,
        UploadType: el.UploadType,
        // StartDate: el.StartDate,
        // EndDate: el.EndDate,
        VerificationLevel: el.VerificationLevel,
        CreatedBy: el.CreatedBy,
        CreatedAt: el.CreatedAt,
        // DepositorID: el.DepositorID,
        // BeneficiaryID: el.BeneficiaryID,
        // UploadTypeID: el.UploadTypeID,
        // VerificationID: el.VerificationID,
        Config_Status: el.Config_Status,
        Config_TypeId: el.Config_TypeId,
        // SizeAllocation: el.SizeAllocation,
        CodeLastPullAt: this._commonService.formatLocalTime(el.CodeLastPullAt),
        Project_Status: el.Project_Status
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  paginateFolder(e) {
    this.firstFolder = e.first;
    this.rowsFolder = e.rows;
  }

  searchTable($event) {
    let val = $event.target.value.trim();

    if (!val) {
      this.formattedData = this.immutableFormattedData;
      return;
    }

    const keywords = val.split(",").map(x => x.trim().toLowerCase());

    this.formattedData = this.immutableFormattedData.filter((row: any) =>
      Object.values(row).some((field: any) =>
        keywords.some(k =>
          field && field.toString().toLowerCase().includes(k)
        )
      )
    );
  }

  // isHoveredSFTP: boolean = false;
  // isHoveredGIT: boolean = false;
  // isHoverManual: boolean = false;

  // onHoverSFTP(state: boolean,): void {
  //   this.isHoveredSFTP = state;
  // }

  // onHoverGIT(state: boolean): void {
  //   this.isHoveredGIT = state;
  // }

  // onHoverManual(state: boolean): void {
  //   this.isHoverManual = state;
  // }

  OnClose() {
    this.modalService.hide(1);
  }

  OnReset() {
    this.Reset = true;
    this.ProjectCodePullForm.reset();
    this.User = "code-verification";
  }

  // getUserType() {
  //   const apiUrl = this._global.baseAPIUrl + 'Department/GetList?user_Token=' + localStorage.getItem('User_Token');
  //   this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
  //     this._UsertypeList = data;
  //     this.ProjectCodePullForm.controls['usetType'].setValue(0);
  //   });
  // }

  modal1: any

  Getpagerights() {
    var pagename = "code-verification";
    const apiUrl =
      this._global.baseAPIUrl + "Admin/Getpagerights?userid=" + localStorage.getItem("UserID") + " &pagename=" + pagename + "&user_Token=" + localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data) => {
      if (data <= 0) {
        localStorage.clear();
        this.router.navigate(["/Login"]);
      }
    });
  }

  geRoleList() {
    const userToken =
      this.ProjectCodePullForm.get("User_Token").value ||
      localStorage.getItem("User_Token");
    const apiUrl = this._global.baseAPIUrl + "Role/GetList?user_Token=" + userToken;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RoleList = data;
    });
    this.ProjectCodePullForm.controls['roleName'].setValue(0);
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
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

  onDownloadExcelFile(_filename: string) {
    this.exportToExcel(this.formattedData, _filename);

    this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Downloaded', 'Downloaded Project List').subscribe(
      (Res: any) => { });
  }

  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "csv",
      type: "array",
    });
    this.saveExcelFile(excelBuffer, fileName);
  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: "application/vnd.ms-excel" });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = url;
    a.download = fileName + ".csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  verifyInput($event) {
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
}
