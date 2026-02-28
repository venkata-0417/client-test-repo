import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "primeng/api";
import { saveAs } from 'file-saver';
import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { CommonService } from "src/app/Services/common.service";

@Component({
  selector: 'app-code-download',
  templateUrl: './code-download.component.html',
  styleUrls: ['./code-download.component.scss']
})
export class CodeDownloadComponent implements OnInit, OnDestroy {
  downloadForm: FormGroup;
  versionList: any[] = [];
  projectDetails: any = null;
  isLoading: boolean = false;
  selectedVersion: any = null;
  LatestVersion: any
  LatestFileUploadId: any
  selectedFilePathID: any;
  _VersionL: any;
  events: any;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this.downloadForm = this.formBuilder.group({
      PID: ["", Validators.required],
      project_id: ["", Validators.required],
      Version: ["", Validators.required],
      FilePathID: [""],
      User_Token: [localStorage.getItem("User_Token")],
      CreatedBy: [localStorage.getItem("UserID")]
    });

    let _PID = localStorage.getItem('_PID');

    if (Number(_PID) > 0) {
      this.downloadForm.controls['project_id'].setValue(localStorage.getItem('_PID'));
      this.downloadForm.controls['PID'].setValue(localStorage.getItem('_PID'));
    }

    this.loadProjectDetails();
    this.loadVersionList();
  }

  loadProjectDetails() {
    const projectId = this.downloadForm.get('project_id')?.value;
    if (!projectId) {
      this.showError("Project ID not found");
      return;
    }

    const apiUrl = this._global.baseAPIUrl + "Master/GetProjectListForCodeRelease?user_Token=" + this.downloadForm.controls["User_Token"].value + "&UserID=" + this.downloadForm.controls["CreatedBy"].value + "&PID=" + projectId;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.projectDetails = data?.[0] ?? null;
    });
  }

  loadVersionList() {
    localStorage.setItem('loadingOff', 'false')
    const apiUrl = this._global.baseAPIUrl + "Git/GetAuditLogByProjectID?User_Token=" + this.downloadForm.controls["User_Token"].value + "&project_id=" + this.downloadForm.controls['project_id'].value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.events = data && data.length > 0 ? data : null;
      this.versionList = data;
      this.downloadForm.controls['Version'].setValue("");
      localStorage.setItem('loadingOff', '')
    });
  }

  onVersionChange(event: any) {
    const versionId = event.target.value;
    this.selectedVersion = this.versionList.find(v => v.Id == versionId);
    this.downloadForm.patchValue({ FilePathID: versionId });
  }

  downloadSourceCode() {
    if (this.downloadForm.invalid) {
      this.showError("Please select a version to download");
      return;
    }

    this.isLoading = true;
    const apiUrl = this._global.baseAPIUrl + 'Git/DownloadSCode';

    this._onlineExamService.BulkDownload(this.downloadForm.value, apiUrl).subscribe({
      next: (res) => {
        if (res) {
          const fileName = this.selectedVersion
            ? `SourceCode_${this.selectedVersion.Version}.zip`
            : "SourceCode.zip";
            
          saveAs(res, fileName);
          this.showSuccess("Source code downloaded successfully");
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.showError("Failed to download source code");
        this.isLoading = false;
      }
    });
  }

  onBack() {
    localStorage.removeItem('_PID');
    this.router.navigate(['/process/code-release']);
  }

  showSuccess(message: string) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: message
    });
  }

  showError(message: string) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: message
    });
  }

  get f() {
    return this.downloadForm.controls;
  }

  ngOnDestroy() {
    this._onlineExamService.cleanup();
    localStorage.removeItem('_PID');
  }
}