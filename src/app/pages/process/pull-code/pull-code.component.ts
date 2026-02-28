import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LoadingService } from './../../../Services/loading.service'
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService, TreeNode } from "primeng/api";
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';
import { HttpClient } from "@angular/common/http";
import { CommonService } from "src/app/Services/common.service";
import DOMPurify from 'dompurify';
import jsPDF from 'jspdf';

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-pull-code',
  templateUrl: './pull-code.component.html',
  styleUrls: ['./pull-code.component.scss']
})

export class PullCodeComponent implements OnInit {
  @ViewChild('DepositorSignatureInput') DepositorSignatureInput: ElementRef;
  @ViewChild('BeneficiarySignatureInput') BeneficiarySignatureInput: ElementRef;

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
  AddpasswordReset: FormGroup;
  submitted = false;
  Reset = false;
  _SingleUser: any = [];
  User: any;
  first = 0;
  rows = 10;
  firstFolder = 0;
  rowsFolder = 10;
  initilizerLoaderOn: any
  finalMessage = false
  back = false
  backtomain = false
  projectName: any
  IntegrationType: any
  projectInfo: any
  selectedFilePath: any;
  events: any
  files: any[] = [];
  selectionMode: string;
  entries: number = 10;
  SelectionType = SelectionType;
  isReadonly = true;
  actionbutton = false;
  _VersionL: any;

  // -------------------------------------------------------
  UploadPending = false;
  VerificationCompleted = false;
  Level1Rejected = false;
  Level2Rejected = false;
  Level1Pending = false;
  Level2Pending = false;
  Beneficiary = false;
  Depositor = false;
  admin = false;
  // -------------------------------------------------------

  //-----------------------------------------------------
  _RList = []
  _DepositMethodTab: any = false;
  _VerificationTab: any = false;
  _ViewSourceCodeTab: any = false;
  //-----------------------------------------------------

  LatestVersion: any
  LatestFileUploadId: any
  IsSourceCodeChecksumGenerated: any
  IsSourceCodeChecksumVerified: any
  IsSourceCodeChecksumMatch: any
  _IndexList: any;
  CodeBrowseForm: FormGroup;
  BranchList: any;
  sMsg: string = "";
  activeTabIndex: number = 0;
  selectedFile!: TreeNode;
  records: any;
  downloadReport = false;
  commentMessage = false;
  commentMessageForAckCopy = false;
  commentMessageforUnverified = false;
  pullButtonDisable = false;

  // These properties are for checksum verification
  showChecksumModal = false;
  checksumGenerating = false;
  checksumGenerated = false;
  checksumComparing = false;
  checksumCompared = false;
  checksumsMatch = false;
  ChecksumBtn = '';
  escrowChecksum = '';

  // New Depositor acknowledgement properties
  ShowDepositorAckModal: boolean = false;
  IsDepositorAcknowledged: boolean = false;
  IsGitCodePulled: boolean = false;
  DepositorSignatureFile: File | null = null;
  DepositorSignaturePreview: string | null = null;
  DepositorName: string;
  DepositorEmail: string;
  DepositorAcknowledgementDate: string;

  GitCodePullBtnTxt: string = "Pull Source Code";

  // New Beneficiary acknowledgement properties
  ShowBeneficiaryAckModal: boolean = false;
  BeneficiarySignatureFile: File | null = null;
  BeneficiarySignaturePreview: string | null = null;
  BeneficiaryName: string;
  BeneficiaryEmail: string;
  BeneficiaryAcknowledgementDate: string;

  displayAckPopup: boolean = false;
  selectedRecord: any = null;

  DepositorAcknowledgementText: string = `DEPOSITOR ACKNOWLEDGEMENT

  I, the undersigned depositor, hereby acknowledge and confirm the following:
  
  1. SOURCE CODE RESPONSIBILITY
     I confirm that I am authorized to deposit the source code and have verified its completeness and accuracy.
  
  2. SECURITY COMPLIANCE
     I certify that the source code has been scanned for security vulnerabilities and does not contain any malicious code, unauthorized dependencies, or sensitive information such as passwords, API keys, or confidential data.
  
  3. VERSION VERIFICATION
     I have verified that this is the correct version of the source code intended for deposit and have reviewed all changes included in this submission.
  
  4. INTELLECTUAL PROPERTY
     I confirm that this source code does not violate any intellectual property rights and that all necessary permissions and licenses are in place.
  
  5. CHECKSUM VERIFICATION
     I understand that the deposited code will undergo checksum verification and integrity checks. I acknowledge that any discrepancies must be resolved before proceeding.
  
  6. DOCUMENTATION
     I confirm that all required documentation, including README files, configuration guides, and dependency lists, are included and up to date.
  
  By signing below, I accept full responsibility for the accuracy and integrity of the deposited source code.`;

  BeneficiaryAcknowledgementText: string = `BENEFICIARY VERIFICATION ACKNOWLEDGEMENT

  I, the undersigned verifier, hereby acknowledge and confirm the following:

  1. VERIFICATION AUTHORITY
     I confirm that I am authorized to perform verification and possess the necessary technical expertise to assess source code integrity and file structure completeness.

  2. FILE STRUCTURE ASSESSMENT
     I have thoroughly examined the deposited source code and verified the complete file structure hierarchy, presence of all required project files and directories.

  3. INTEGRITY VERIFICATION
     I certify that I have conducted comprehensive integrity checks including checksum verification for GIT integrations, file hash validation, archive integrity assessment, and detection of any file tampering or modification.

  4. SECURITY PRELIMINARY REVIEW
     I have performed an initial security assessment to identify obvious malicious code patterns, suspicious file types or executables and potential security vulnerabilities in file structure.

  5. DOCUMENTATION VERIFICATION
     I confirm that I have reviewed the presence and basic completeness of project documentation files, configuration files and environment specifications.

  6. PROFESSIONAL RESPONSIBILITY
     I understand that my verification decision at Level 1 enables progression to Level 2 compilation and build verification.
     
  By signing below, I accept full responsibility for this Level 1 verification decision and confirm that I have exercised due diligence in my preliminary assessment of the deposited source code.`;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this.ProjectCodePullForm = this.formBuilder.group({
      PID: [''],
      project_id: [''],
      ProjectName: [''],
      SubmitStatus: [''],

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
      FilePathID: [''],
      LogFilepath: [""],
      Version: ["", [Validators.required]],
      Project_Status: [""],
      FileNo: [""],
      Filepath: [""],
      Comment: ['', Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]*$/)],
      Config_TypeId: [''],
      IntegrationType: [''],
      VerificationLevel: [''],
      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CodePull_by: localStorage.getItem("UserID"),
      CreatedBy: localStorage.getItem("UserID"),
      Status: [''],
      ...this.categories.reduce((controls, category) => {
        controls[category.name] = [false]; // Default value for checkboxes
        return controls;
      }, {}),
    });

    let _PID = localStorage.getItem('_PID');

    if (Number(_PID) > 0) {
      this.ProjectCodePullForm.controls['PID'].setValue(localStorage.getItem('_PID'));
      this.ProjectCodePullForm.controls['project_id'].setValue(localStorage.getItem('_project_id'));
      this.ProjectCodePullForm.controls['ProjectName'].setValue(localStorage.getItem('_ProjectName'));
      this.ProjectCodePullForm.controls['IntegrationType'].setValue(localStorage.getItem('_IntegrationType'));
      this.ProjectCodePullForm.controls['Config_TypeId'].setValue(localStorage.getItem('_Config_TypeId'));
      this.projectName = this.ProjectCodePullForm.controls['ProjectName'].value
    }

    if (this.ProjectCodePullForm.controls['IntegrationType'].value === "GIT") {
      this.getGITDetails(this.ProjectCodePullForm.controls['Config_TypeId'].value);
      this.IntegrationType = this.ProjectCodePullForm.controls['IntegrationType'].value;
    }

    else if (this.ProjectCodePullForm.controls['IntegrationType'].value === "SFTP") {
      this.getSFTPDetails(this.ProjectCodePullForm.controls['Config_TypeId'].value);
      this.IntegrationType = this.ProjectCodePullForm.controls['IntegrationType'].value;
    }

    else if (this.ProjectCodePullForm.controls['IntegrationType'].value === "Manual Upload") {
      this.IntegrationType = this.ProjectCodePullForm.controls['IntegrationType'].value;
    }

    if (localStorage.getItem('UsertypeID') === '1') {
      this.Beneficiary = true;
      this.goToTab('Verification');
    }
    else if (localStorage.getItem('UsertypeID') === '2') {
      this.Depositor = true;
    }

    this.loadHTML();
    this.getBranchList(0);
    this.GetProjectDetailsByProjectId();
    this.ViewPullDetails();
    this.getRightList();
    this.GetUserDetails(localStorage.getItem('UserID'));

    // this._onlineExamService.preventScreenshots();
    this.User = "Add User";
  }

  GetUserDetails(value: any) {
    const apiUrl = this._global.baseAPIUrl + "Admin/GetDetails?ID=" + value + "&user_Token=" + localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      var that = this;
      that._SingleUser = data;

      this.DepositorName = that._SingleUser.name,
        this.DepositorEmail = that._SingleUser.email

      this.BeneficiaryName = that._SingleUser.name,
        this.BeneficiaryEmail = that._SingleUser.email
    });
  }

  getRightList() {
    const apiUrl =
      this._global.baseAPIUrl + "Role/PermissionListForTabs?UserID=" + localStorage.getItem('UserID') + "&ProjectID=" + this.ProjectCodePullForm.controls['PID'].value + "&user_Token=" + localStorage.getItem('User_Token')
    this._onlineExamService.getAllData(apiUrl).subscribe((data: []) => {
      this._RList = data;
      this._commonService.setRightList(this._RList);
      this.PermissionListForTabs();
    });
  }

  PermissionListForTabs() {
    this._commonService.hasRightListChanged.subscribe(res => {
      if (res) {
        this._DepositMethodTab = res.filter(el => el.page_right === 'Deposit Method Tab')[0].isChecked ? true : false;
        this._VerificationTab = res.filter(el => el.page_right === 'Verification Tab')[0].isChecked ? true : false;
        this._ViewSourceCodeTab = res.filter(el => el.page_right === 'View Source Code Tab')[0].isChecked ? true : false;
      }
    });
  }

  GetProjectDetailsByProjectId() {
    const apiUrl = this._global.baseAPIUrl + "Master/GetProjectDetailsByProjectId?user_Token=" + this.ProjectCodePullForm.get('User_Token').value + "&PID=" + this.ProjectCodePullForm.controls['PID'].value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      this.ProjectCodePullForm.controls['Project_Status'].setValue(data[0].Project_Status);
      this.ProjectCodePullForm.controls['VerificationLevel'].setValue(data[0].VerificationLevel);

      this.GetLastProjectFile();
      this.GetProjectList();
    });
  }

verifyInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  const rawValue = target.value;

  const cleanValue = DOMPurify.sanitize(rawValue, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  const control = this.ProjectCodePullForm.get('Comment');

  if (rawValue !== cleanValue) {
    control?.setErrors({ htmlNotAllowed: true });
    return;
  }

  const alphaNumericRegex = /^[a-zA-Z0-9 ]*$/;

  if (!alphaNumericRegex.test(rawValue)) {
    control?.setErrors({ pattern: true });
  } else {
    if (control?.hasError('pattern')) {
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
  }
}


  ScreenManagement() {
    if (this.ProjectCodePullForm.controls['Project_Status'].value === 'Repository Sync Pending' ||
      this.ProjectCodePullForm.controls['Project_Status'].value === 'Manual Upload Pending') {
      this.UploadPending = true;

      this.Level1Pending = false;
      this.Level2Pending = false;
      this.VerificationCompleted = false;
      this.Level1Rejected = false;
      this.Level2Rejected = false;
      this.pullButtonDisable = false;
      this.commentMessage = false;
      this.commentMessageforUnverified = false;
    }

    //NEW Logic starts Here
    else if (
      this.ProjectCodePullForm.controls['Project_Status'].value === 'Verification Level-1 Pending' ||
      this.ProjectCodePullForm.controls['Project_Status'].value === 'Manual Upload Completed'
    ) {

      const projectStatus = this.ProjectCodePullForm.controls['Project_Status'].value;
      const submitStatus = this.ProjectCodePullForm.controls['SubmitStatus'].value;
      const isManual = localStorage.getItem('Manual') === "Manual";
      const isSubmitPending = submitStatus === "Pending";
      const isSubmitSubmitted = submitStatus === "Submitted";
      const isGit = this.ProjectCodePullForm.controls['IntegrationType'].value;

      // Reset all flags first (common for all branches)
      this.Level1Pending = false;
      this.Level2Pending = false;
      this.UploadPending = false;
      this.VerificationCompleted = false;
      this.Level1Rejected = false;
      this.Level2Rejected = false;
      this.commentMessage = false;
      this.commentMessageforUnverified = false;
      this.pullButtonDisable = false;

      if (projectStatus === 'Manual Upload Completed' && isSubmitPending) {
        this.UploadPending = true;
        this.commentMessageforUnverified = true;
        this.pullButtonDisable = true;
      }
      else if (
        (isManual || isSubmitPending) && projectStatus !== 'Manual Upload Completed') {
        this.UploadPending = true;
        this.commentMessage = true;
        this.pullButtonDisable = true;

        if (isGit === "GIT" && (localStorage.getItem('Submit') === "Pedning" || isSubmitPending)) {
          this.UploadPending = true;

          if (this.IsDepositorAcknowledged == false && this.IsGitCodePulled == true) {
            this.commentMessage = false;
            this.commentMessageForAckCopy = true;
            this.pullButtonDisable = false;
          } else {
            this.commentMessageForAckCopy = false;
            this.commentMessage = true;
            this.pullButtonDisable = true;
          }
        }
      }
      else if (localStorage.getItem('Submit') === "Pedning" || isSubmitPending) {
        this.UploadPending = true;
        this.commentMessage = true;
        this.pullButtonDisable = true;
      }
      else if (
        projectStatus === 'Manual Upload Completed' &&
        isSubmitSubmitted
      ) {
        this.pullButtonDisable = false;
      }
      else {
        this.Level1Pending = true;
        this.pullButtonDisable = false;
      }
    }

    else if (this.ProjectCodePullForm.controls['Project_Status'].value === 'Verification Level-1 Rejected') {
      this.Level1Rejected = true;

      this.Level1Pending = false;
      this.Level2Pending = false;
      this.UploadPending = false;
      this.commentMessage = false;
      this.commentMessageforUnverified = false;
      this.pullButtonDisable = false;
      this.VerificationCompleted = false;
    }
    else if (this.ProjectCodePullForm.controls['Project_Status'].value === 'Verification Level-2 Pending') {
      this.Level2Pending = true;
      this.downloadReport = false;

      this.Level1Pending = false;
      this.UploadPending = false;
      this.commentMessage = false;
      this.commentMessageforUnverified = false;
      this.Level1Rejected = false;
      this.pullButtonDisable = false;
      this.VerificationCompleted = false;
    }
    else if (
      this.ProjectCodePullForm.controls['Project_Status'].value === 'Verification Level-2 Rejected') {
      this.Level2Rejected = true;
      this.downloadReport = false;

      this.Level1Pending = false;
      this.Level2Pending = false;
      this.Level1Rejected = false;
      this.commentMessage = false;
      this.commentMessageforUnverified = false;
      this.UploadPending = false;
      this.pullButtonDisable = false;
      this.VerificationCompleted = false;
    }
    else if (this.ProjectCodePullForm.controls['Project_Status'].value === 'Verification Completed') {
      this.VerificationCompleted = true;

      this.Level2Pending = false;
      this.Level1Pending = false;
      this.Level1Rejected = false;
      this.commentMessage = false;
      this.commentMessageforUnverified = false;
      this.pullButtonDisable = false;
      this.UploadPending = false;
    }
  }

  convertToGB(fileSizeInMB: any) {
    return (parseFloat(fileSizeInMB.toFixed(3)) + ' GB');
  }

  categories: any[] = [
    { name: 'AllRequiredFilesPresent', key: 'All required files are present' },
    { name: 'NoCorruptedFiles', key: 'No corrupted files were found during verification' },
    { name: 'CorrectDirectoryStructure', key: 'All files are in the correct directory structure' },
  ];

  ViewPullDetails() {
    localStorage.setItem('loadingOff', 'false')
    const apiUrl = this._global.baseAPIUrl + "Git/GetAuditLogByProjectID?User_Token=" + localStorage.getItem("User_Token") + "&project_id=" + this.ProjectCodePullForm.controls['PID'].value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.UserList = data;
      this.events = data && data.length > 0 ? data : null;
      this._VersionL = data;
      this.ProjectCodePullForm.controls['Version'].setValue(0);
      localStorage.setItem('loadingOff', '')
    });
  }


  getGITDetails(Config_TypeId: any) {
    const apiUrl = this._global.baseAPIUrl + "Git/GetDetailsByIDForCodePull?Id=" + Config_TypeId + "&user_Token=" + this.ProjectCodePullForm.get('User_Token').value + "&CreatedBy=" + this.ProjectCodePullForm.get("CreatedBy").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      this.ProjectCodePullForm.patchValue({
        PID: data[0].project_id,
        project_id: data[0].project_id,
        ProjectName: data[0].ProjectName,
        repoUrl: data[0].repoUrl,
        git_user: data[0].git_user,
        token: data[0].token,
      });
    });
  }

  getSFTPDetails(Config_TypeId: any) {
    const apiUrl = this._global.baseAPIUrl + "SFTP/GetDetailsBySFTPID?Id=" + Config_TypeId + "&user_Token=" + this.ProjectCodePullForm.get('User_Token').value
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      this.ProjectCodePullForm.patchValue({
        PID: data[0].project_id,
        project_id: data[0].project_id,
        ProjectName: data[0].ProjectName,
        host_name: data[0].host_name,
        port: data[0].port,
        user_password: data[0].user_password,
        user_name: data[0].user_name,
        remoteDirectory: data[0].remoteDirectory
      });
    });
  }

  pullGitCode() {
    this.initilizerLoaderOn = true
    this.submitted = true;
    localStorage.setItem('loadingOff', 'false')

    this.ProjectCodePullForm.patchValue({
      CreatedBy: localStorage.getItem('UserID'),
      User_Token: localStorage.getItem('User_Token'),
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/GitCloneRequest';
    this._onlineExamService.postData(this.ProjectCodePullForm.value, apiUrl)
      .subscribe({
        next: (data) => {
          this.showSuccessmessage(data);
          this.GetProjectList();
          // this.GetLastProjectFile();
          this.GetProjectDetailsByProjectId();
          this.initilizerLoaderOn = false;
          this.finalMessage = true;
          this.commentMessage = true;
          localStorage.setItem('Submit', 'Pedning');
        },
        error: (errorResponse) => {
          const errorMessage = errorResponse.error.Message;
          this.ShowErrormessage(errorMessage);
        }
      });
    localStorage.setItem('loadingOff', '')
  }


  DownloadSFTPCode() {
    this.initilizerLoaderOn = true
    this.submitted = true;
    localStorage.setItem('loadingOff', 'false')

    this.ProjectCodePullForm.patchValue({
      CreatedBy: localStorage.getItem('UserID'),
      User_Token: localStorage.getItem('User_Token'),
    });

    const apiUrl = this._global.baseAPIUrl + 'FileUpload/SFTPConnect';
    this._onlineExamService.postData(this.ProjectCodePullForm.value, apiUrl)
      .subscribe(data => {
        this.downloadStatusFile(data);
        this.GetLastProjectFile();
        this.GetProjectList();
        this.initilizerLoaderOn = false;
        this.finalMessage = true;
        this.commentMessage = true;
      });
    localStorage.setItem('loadingOff', '')
  }

  downloadStatusFile(strmsg: any) {
    const filename = 'SFTP File Download Status';
    let blob = new Blob(['\ufeff' + strmsg], {
      type: 'text/csv;charset=utf-8;'
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = -1;

    if (isSafariBrowser) {
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ManualUpload() {
    this.router.navigate(["/upload/file-upload"]);
    localStorage.setItem('_PID', this.ProjectCodePullForm.controls['PID'].value);
    localStorage.setItem('_project_id', this.ProjectCodePullForm.controls['project_id'].value);
    localStorage.setItem('_ProjectName', this.ProjectCodePullForm.controls['ProjectName'].value);
  }

  OnReset() {
    this.ProjectCodePullForm.controls['Comment'].setValue('');
  }

  goToTab(header: string): void {
    const visibleTabs = [
      { header: 'Deposit Method', condition: this._DepositMethodTab },
      { header: 'Verification', condition: this._VerificationTab },
      { header: 'View Source Code', condition: this._ViewSourceCodeTab },
      { header: 'Process Log', condition: true }
    ].filter(tab => tab.condition);

    const index = visibleTabs.findIndex(tab => tab.header === header);

    if (index !== -1) {
      this.activeTabIndex = index;

      if (header === 'View Source Code') {
        this.back = true;
      } else if (header === 'Process Log') {
        this.backtomain = true;
      } else {
        this.back = false;
        this.backtomain = false;
      }
    } else {
      console.error('Tab not found:', header);
    }
  }

  onBack() {
    if (this.back) {
      this.goToTab('Verification');
      this.back = false;
    }
    else if (this.backtomain) {
      this.goToTab('Deposit Method');
      this.backtomain = false;
    }
    else {
      localStorage.removeItem('_PID');
      localStorage.removeItem('_project_id');
      localStorage.removeItem('_ProjectName');
      localStorage.removeItem('_IntegrationType');
      localStorage.removeItem('_Config_TypeId');
      this.router.navigate(['/process/code-verification']);
    }
  }

  safeHtmlContent: string = '';
  contentLines: string[] = [];
  downloadSCFile() {
    this.ProjectCodePullForm.patchValue({
      User_Token: localStorage.getItem('User_Token'),
      userID: localStorage.getItem('UserID')
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/DownloadSCode';
    this._onlineExamService.BulkDownload(this.ProjectCodePullForm.value, apiUrl).subscribe(res => {
      if (res) {
        saveAs(res, "Source Code" + '.zip');
      }
    });
  }

  onNodeSelect(event: any) {
    const selectedNode = event.node;
    // Check if it is a file and display its file path
    if (selectedNode.data && selectedNode.data.filePath) {
      this.selectedFilePath = selectedNode.data.filePath;
    }
    //this.GetFileFomServer(this.selectedFilePath); 
    this.validateFile(this.selectedFilePath);
  }

  validateFile(file: string) {
    const validExtensions = ['.txt', '.html', '.cs', '.css', '.ts', '.vb', '.js', '.scss', '.json', '.md', '.xml', '.yml'];
    const validMimeTypes = [
      'text/plain', 'text/html', 'text/css', 'application/javascript',
      'application/json', 'text/markdown', 'text/xml', 'application/x-yaml',
      'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
      'application/octet-stream', 'text/x-scss', 'text/x-vbscript'
    ];
    // const fileExtension = file.name.split('.').pop()?.toLowerCase();

    const fileExt = file.substring(file.lastIndexOf('.'), file.length);

    //  const fileType = file.type;
    // const fileName = file.name.trim(); // Ensure no leading/trailing spaces
    const fileExtension = fileExt; // fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : null;

    if (validExtensions.includes(fileExtension!)) {
      this.GetFileFomServer(this.selectedFilePath);
      console.log('Valid file type:', file);
    } else {
      console.log('Invalid file type.');
    }
  }

  // Expand all nodes
  expandAll() {
    this.toggleNodes(this.files, true);
  }

  // Collapse all nodes
  collapseAll() {
    this.toggleNodes(this.files, false);
  }
  // Toggle node expansion
  toggleNodes(nodes: any[], expand: boolean) {
    nodes.forEach((node) => {
      node.expanded = expand;
      if (node.children) {
        this.toggleNodes(node.children, expand);
      }
    });
  }

  GetFileFomServer(filepath: string) {
    this.ProjectCodePullForm.patchValue({
      Filepath: filepath,
      User_Token: localStorage.getItem('User_Token'),
    });
    const that = this;
    const apiUrl = this._global.baseAPIUrl + 'Git/GetFileFomServer';
    this._onlineExamService.postData(this.ProjectCodePullForm.value, apiUrl)
      .subscribe((response: any) => {
        const decryptedContent = this._commonService.decrypt(response.data);
        this.contentLines = decryptedContent.replace(/\t/g, '\\t').split('\n');
      });
  }

  loadHTML(): void {
    this.http.get('assets/sample.js', { responseType: 'text' }).subscribe({
      next: (data: string) => {
        // Split the content by '\n' into an array of lines
        //  this.contentLines = data.replace(/\t/g, '\\t').split('\n');
      },
      error: (error) => {
        console.error('Error fetching the file:', error);
      },
    });
  }

  editorOptions = {
    theme: "vs-dark",
    language: "javascript", // Set the language mode
    readOnly: true,
  };
  code: string = `
  // Sample JavaScript code
  function greet() {
    console.log('Hello, Monaco Editor!');
  }
`;

  getBranchList(FilePathID: any) {
    this.ProjectCodePullForm.patchValue({
      FilePathID: FilePathID,
      project_id: this.ProjectCodePullForm.controls['project_id'].value,
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID')
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/GetSourceCodeDetails'
    this._onlineExamService.postData(this.ProjectCodePullForm.value, apiUrl).subscribe((response) => {
      // this.files = this.transformToTreeNodes(data);

      const decrypted = this._commonService.decrypt(response.data); // Make sure 'data' matches backend
      this.files = this.transformToTreeNodes(decrypted);
      // this.ViewSourceCode = true;
    });
  }

  hidepopup() {
    this.modalRef.hide();
  }

  ngOnDestroy() {
    document.body.classList.remove("data-entry");
    this._onlineExamService.cleanup();
  }

  transformToTreeNodes(node: any): any[] {
    const children: any[] = [];

    // Process SubFolders
    if (node.SubFolders) {
      for (const subFolder of node.SubFolders) {
        children.push(...this.transformToTreeNodes(subFolder));
      }
    }

    // Process Files
    if (node.Files) {
      for (const file of node.Files) {
        children.push({
          label: file.FileName,
          icon: "pi pi-file",
          data: { filePath: file.FilePath } // Store file path in data
        });
      }
    }

    // Return the current node in PrimeNG format
    return [
      {
        label: node.FolderName || "Root",
        expandedIcon: "pi pi-folder-open",
        collapsedIcon: "pi pi-folder",
        children: children,
      }
    ];
  }

  SourceValidator(event: any): void {

    if (event.index === 1) {
      this.loadHTML();
      this.getBranchList(0);
    }
  }

  onSubmit() {
    this.submitted = true;

    this.ProjectCodePullForm.value.User_Token = localStorage.getItem("User_Token");

    this.ProjectCodePullForm.patchValue({
      project_id: this.ProjectCodePullForm.controls['PID'].value,
      CreatedBy: this.ProjectCodePullForm.controls['CreatedBy'].value,
      Status: ""
    })
    const apiUrl = this._global.baseAPIUrl + "Git/SubmitGitClone";
    this._onlineExamService
      .postData(this.ProjectCodePullForm.value, apiUrl)
      .subscribe((data) => {
        this.showSuccessmessage(data);
        this.modalService.hide(1);
        this.OnReset();
        this.ViewPullDetails();
        this.modal1 = "modal"
        this.loadHTML();
        this.getBranchList(0);
        this.GetProjectDetailsByProjectId();
        this.GetProjectList();
        this._onlineExamService.triggerReload();
        localStorage.removeItem('Manual');
        localStorage.removeItem('Submit');
      });
    this.finalMessage = false;
    this.initilizerLoaderOn = false;
  }


  onVerifyOne(status: any) {
    const apiPayload = {
      ...this.ProjectCodePullForm.value,
      AllRequiredFilesPresent: this.ProjectCodePullForm.value["AllRequiredFilesPresent"],
      NoCorruptedFiles: this.ProjectCodePullForm.value["NoCorruptedFiles"],
      CorrectDirectoryStructure: this.ProjectCodePullForm.value["CorrectDirectoryStructure"],
      verified_by: localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"],
      ProjectName: this.ProjectCodePullForm.value["ProjectName"],
      project_id: this.ProjectCodePullForm.value["project_id"],
      Status: status,
      Comment: this.ProjectCodePullForm.value["Comment"],
      Version: this.LatestVersion,
      FileUploadId: this.LatestFileUploadId
    };

    if (this.ProjectCodePullForm.valid) {
      const apiUrl = this._global.baseAPIUrl + "Git/SubmitVerifyLevelOne";
      this._onlineExamService
        .postData(apiPayload, apiUrl)
        .subscribe((data) => {
          this.onVerifyReset();
          this.showSuccessmessage(data);
          this.GetProjectDetailsByProjectId();
          this.GetProjectList();
          this._onlineExamService.triggerReload();
        });
    } else {
      console.error("Form is invalid");
    }
  }

  onVerifyReset() {
    const resetValues = this.categories.reduce((controls, category) => {
      controls[category.name] = false;
      return controls;
    }, {});
    this.ProjectCodePullForm.patchValue(resetValues);
    this.ProjectCodePullForm.patchValue({
      Comment: '',
      Status: '',
    });
  }

  getUserType() {
    const apiUrl = this._global.baseAPIUrl + 'Department/GetList?user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._UsertypeList = data;
      this.ProjectCodePullForm.controls['usetType'].setValue(0);
    });
  }

  GetLastProjectFile() {
    const apiUrl = this._global.baseAPIUrl + 'Master/GetLastProjectFile?PID=' + this.ProjectCodePullForm.controls['PID'].value + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this.ProjectCodePullForm.patchValue({
        SubmitStatus: data[0].SubmitStatus
      });
      this.LatestVersion = data[0].Version;
      this.LatestFileUploadId = data[0].Id;
      this.IsSourceCodeChecksumGenerated = data[0].IsSourceCodeChecksumGenerated;
      this.IsSourceCodeChecksumVerified = data[0].IsSourceCodeChecksumVerified;
      this.IsSourceCodeChecksumMatch = data[0].IsSourceCodeChecksumMatch;
      this.IsDepositorAcknowledged = data[0].IsDepositorAcknowledged;
      this.IsGitCodePulled = data[0].IsGitCodePulled;
      this.DepositorAcknowledgementDate = this._commonService.formatLocalTime(data[0].Depositor_Ack_At);

      if (data[0].LogFilepath === null) {
        this.downloadReport = false;
      } else {
        this.downloadReport = true;
      }

      if (this.IsDepositorAcknowledged == false && this.IsGitCodePulled == true) {
        this.GitCodePullBtnTxt = "Depositor ACK";
      } else {
        this.GitCodePullBtnTxt = "Pull Source Code";
      }
      this.ChecksumVerificationManagement();
      this.ScreenManagement();
    });

  }

  GetProjectList() {
    this.formattedData = [];
    this.headerList = [];
    const apiUrl = this._global.baseAPIUrl + 'Master/GetProjectHistory?PID=' + this.ProjectCodePullForm.controls['PID'].value + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RoleList = data;
      this._FilteredList = data;
      if (this.ProjectCodePullForm.controls['VerificationLevel'].value === 'Level-1 (Unreviewed Upload)') {
        this.prepareTableForUnreviewedUpload(this._RoleList, this._FilteredList);
      } else if (this.ProjectCodePullForm.controls['IntegrationType'].value === "GIT") {
        this.prepareTableDataForGit(this._RoleList, this._FilteredList);
      }
      else {
        this.prepareTableData(this._RoleList, this._FilteredList);
      }
    });
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  paginateFolder(e) {
    this.firstFolder = e.first;
    this.rowsFolder = e.rows;
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;

  prepareTableForUnreviewedUpload(tableData, headerList) {
    this.actionbutton = true;
    let formattedData = [];
    let tableHeader: any = [
      // { field: 'srNo', header: "Sr No", index: 1 },
      { field: "FileName", header: "File Name", index: 8 },
      { field: "Version", header: "Version", index: 7 },
      { field: "FileSize", header: "File Size(MB)", index: 9 },
      { field: "Project_Status", header: "Project Status", index: 7 },
      { field: "Upload_By", header: "Code Deposit By", index: 10 },
      { field: "Upload_Date", header: "Code Deposit Date", index: 11 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        // srNo: parseInt(index + 1),
        // ProjectName: el.ProjectName,
        FileName: el.FileName,
        Version: el.Version,
        FileSize: `${parseFloat(Number(el.FileSize).toFixed(3))} MB`,
        Project_Status: el.Project_Status,
        Upload_By: el.Upload_By,
        Upload_Date: this._commonService.formatLocalTime(el.Upload_Date),
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  prepareTableDataForGit(tableData, headerList) {
    this.actionbutton = false;
    let formattedData = [];
    let tableHeader: any = [
      // { field: 'srNo', header: "Sr No", index: 1 },
      { field: "FileName", header: "File Name", index: 8 },
      { field: "Version", header: "Version", index: 7 },
      { field: "FileSize", header: "File Size(MB)", index: 9 },
      { field: "Project_Status", header: "Project Status", index: 7 },
      { field: "Upload_By", header: "Code Deposit By", index: 10 },
      { field: "Upload_Date", header: "Code Deposit Date", index: 11 },
      { field: "Level1Status", header: "Verfication Level 1 Status", index: 12 },
      { field: "Level1DoneBy", header: "Verfication Level 1 Done By", index: 13 },
      { field: "Level1DoneAt", header: "Verfication Level 1 Done Date", index: 14 },
      { field: "Level1Comment", header: "Verfication Level 1 Comment", index: 15 },
      { field: "Level2Status", header: "Verfication Level 2 Status", index: 12 },
      { field: "Level2DoneBy", header: "Verfication Level 2 Done By", index: 13 },
      { field: "Level2DoneAt", header: "Verfication Level 2 Done Date", index: 14 },
      { field: "Level2Comment", header: "Verfication Level 2 Comment", index: 15 }
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        // srNo: parseInt(index + 1),
        // ProjectName: el.ProjectName,
        FileName: el.FileName,
        Version: el.Version,
        FileSize: `${parseFloat(Number(el.FileSize).toFixed(3))} MB`,
        Project_Status: el.Project_Status,
        Upload_By: el.Upload_By,
        Upload_Date: this._commonService.formatLocalTime(el.Upload_Date),
        Level1Status: el.Level1Status,
        Level1DoneBy: el.Level1DoneBy,
        Level1DoneAt: this._commonService.formatLocalTime(el.Level1DoneAt),
        Level1Comment: el.Level1Comment,
        Level2Status: el.Level2Status,
        Level2DoneAt: this._commonService.formatLocalTime(el.Level2DoneAt),
        Level2DoneBy: el.Level2DoneBy,
        Level2Comment: el.Level2Comment,
        LogFilepath: el.LogFilepath,
        Beneficiary_Ack_FilePath: el.Beneficiary_Ack_FilePath,
        Depositor_Ack_FilePath: el.Depositor_Ack_FilePath,
        ID: el.ID
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  prepareTableData(tableData, headerList) {
    this.actionbutton = false;
    let formattedData = [];
    let tableHeader: any = [
      // { field: 'srNo', header: "Sr No", index: 1 },
      { field: "FileName", header: "File Name", index: 8 },
      { field: "Version", header: "Version", index: 7 },
      { field: "FileSize", header: "File Size(MB)", index: 9 },
      { field: "Project_Status", header: "Project Status", index: 7 },
      { field: "Upload_By", header: "Code Deposit By", index: 10 },
      { field: "Upload_Date", header: "Code Deposit Date", index: 11 },
      { field: "Level1Status", header: "Verfication Level 1 Status", index: 12 },
      { field: "Level1DoneBy", header: "Verfication Level 1 Done By", index: 13 },
      { field: "Level1DoneAt", header: "Verfication Level 1 Done Date", index: 14 },
      { field: "Level1Comment", header: "Verfication Level 1 Comment", index: 15 },
      { field: "Level2Status", header: "Verfication Level 2 Status", index: 12 },
      { field: "Level2DoneBy", header: "Verfication Level 2 Done By", index: 13 },
      { field: "Level2DoneAt", header: "Verfication Level 2 Done Date", index: 14 },
      { field: "Level2Comment", header: "Verfication Level 2 Comment", index: 15 }
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        // srNo: parseInt(index + 1),
        // ProjectName: el.ProjectName,
        FileName: el.FileName,
        Version: el.Version,
        FileSize: `${parseFloat(Number(el.FileSize).toFixed(3))} MB`,
        Project_Status: el.Project_Status,
        Upload_By: el.Upload_By,
        Upload_Date: this._commonService.formatLocalTime(el.Upload_Date),
        Level1Status: el.Level1Status,
        Level1DoneBy: el.Level1DoneBy,
        Level1DoneAt: this._commonService.formatLocalTime(el.Level1DoneAt),
        Level1Comment: el.Level1Comment,
        Level2Status: el.Level2Status,
        Level2DoneAt: this._commonService.formatLocalTime(el.Level2DoneAt),
        Level2DoneBy: el.Level2DoneBy,
        Level2Comment: el.Level2Comment,
        LogFilepath: el.LogFilepath
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
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

  onDownloadExcelFile(_filename: string) {
    this.exportToExcel(this.formattedData, _filename);
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

  CompileCode() {
    const apiUrl = this._global.baseAPIUrl + "Git/CompileCode?UserID=" + localStorage.getItem('UserID') + "&ProjectID=" + this.ProjectCodePullForm.controls['Config_TypeId'].value + "&user_Token=" + localStorage.getItem('User_Token')
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      this.showSuccessmessage(data);
    });
  }

  BuildApplication() {
    const apiUrl = this._global.baseAPIUrl + "Git/BuildCode?UserID=" + localStorage.getItem('UserID') + "&ProjectID=" + this.ProjectCodePullForm.controls['Config_TypeId'].value + "&user_Token=" + localStorage.getItem('User_Token')
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data === 'Build triggered successfully!') {
        this.showSuccessmessage(data);
        this.downloadReport = true;
      }
    });
  }

  DownloadReport() {
    this.ProjectCodePullForm.patchValue({
      User_Token: localStorage.getItem('User_Token'),
      userID: localStorage.getItem('UserID')
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/DownloadReport';
    this._onlineExamService.BulkDownload(this.ProjectCodePullForm.value, apiUrl).subscribe(res => {
      if (res) {
        saveAs(res, "CompileReport" + ".txt");
      }
    });
  }

  onVerifyTwo(status: any) {
    const apiPayload = {
      ...this.ProjectCodePullForm.value, // Spread the existing form values
      verified_by: localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"],
      ProjectName: this.ProjectCodePullForm.value["ProjectName"],
      project_id: this.ProjectCodePullForm.value["project_id"],
      Status: status,
      Comment: this.ProjectCodePullForm.value["Comment"],
      Version: this.LatestVersion,
      FileUploadId: this.LatestFileUploadId
    };

    if (this.ProjectCodePullForm.valid) {
      const apiUrl = this._global.baseAPIUrl + "Git/SubmitVerifyLevelTwo";
      this._onlineExamService
        .postData(apiPayload, apiUrl)
        .subscribe((data) => {
          this.onVerifyReset();
          this.showSuccessmessage(data);
          this.GetProjectDetailsByProjectId();
          this.GetProjectList();
          this._onlineExamService.triggerReload();
        });
    } else {
      console.error("Form is invalid");
    }
  }

  DownloadLogReport(LogFile: any) {
    this.ProjectCodePullForm.patchValue({
      User_Token: localStorage.getItem('User_Token'),
      userID: localStorage.getItem('UserID'),
      LogFilepath: LogFile
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/LogFileDownload';
    this._onlineExamService.BulkDownload(this.ProjectCodePullForm.value, apiUrl).subscribe(res => {
      if (res) {
        saveAs(res, "CompileReport" + ".txt");
      }
    });
  }

  blockCopy(event: ClipboardEvent): void {
    event.preventDefault();
    console.log('Copy action blocked.');
  }

  blockContextMenu(event: MouseEvent): void {
    event.preventDefault();
    console.log('Context menu action blocked.');
  }


  // Add these new methods
  openChecksumVerificationModal() {
    this.showChecksumModal = true;
    this.GetLastProjectFile();
  }

  ChecksumModelCloseFunctionality() {
    this.GetLastProjectFile();
  }

  ChecksumVerificationManagement() {
    this.checksumGenerating = false;
    this.checksumGenerated = false;
    this.checksumComparing = false;
    this.checksumCompared = false;
    this.checksumsMatch = false;
    this.finalMessage = false;
    this.ChecksumBtn = 'Generate SourceCode Checksum';
    this.escrowChecksum = '';

    if (this.IsSourceCodeChecksumGenerated == true) {
      this.escrowChecksum = 'Escrow SourceCode Checksum generated successfully';
      this.checksumGenerated = true;
      this.ChecksumBtn = 'Compare SourceCode Checksum';

      if (this.IsSourceCodeChecksumVerified == true && this.IsSourceCodeChecksumMatch == true) {
        this.checksumCompared = true;
        this.checksumsMatch = true;
        this.ChecksumBtn = 'SourceCode Checksum Verified - Match';
      }
      else if (this.IsSourceCodeChecksumVerified == true && this.IsSourceCodeChecksumMatch == false) {
        this.checksumCompared = true;
        this.checksumsMatch = false;
        this.ChecksumBtn = 'SourceCode Checksum Verified - Mismatch';
      }
      else {
        this.checksumComparing = false;
        this.checksumCompared = false;
        this.checksumsMatch = false;
        this.ChecksumBtn = 'Compare SourceCode Checksum';
      }
    }
  }

  generateChecksums() {
    this.checksumGenerating = true;
    const apiPayload = {
      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"],
      ProjectName: this.ProjectCodePullForm.value["ProjectName"],
      project_id: this.ProjectCodePullForm.value["project_id"],
      Version: this.LatestVersion,
      FileUploadId: this.LatestFileUploadId
    };

    const apiUrl = this._global.baseAPIUrl + 'Git/GenerateChecksum';
    this._onlineExamService.postData(apiPayload, apiUrl)
      .subscribe({
        next: (data: any) => {
          this.escrowChecksum = 'Escrow SourceCode Checksum generated successfully';
          this.checksumGenerating = false;
          this.checksumGenerated = true;
          this.showSuccessmessage('Checksum generated successfully');
        },
        error: (errorResponse) => {
          const errorMessage = errorResponse.error.Message;
          this.checksumGenerating = false;
          this.ShowErrormessage('Failed to generate checksum');
        }
      });
  }

  compareChecksums() {
    this.checksumComparing = true;
    const apiPayload = {
      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"],
      ProjectName: this.ProjectCodePullForm.value["ProjectName"],
      project_id: this.ProjectCodePullForm.value["project_id"],
      Version: this.LatestVersion,
      FileUploadId: this.LatestFileUploadId
    };

    const apiUrl = this._global.baseAPIUrl + 'Git/CompareChecksum';
    this._onlineExamService.postData(apiPayload, apiUrl)
      .subscribe({
        next: (data: any) => {
          this.checksumsMatch = data.IsMatch;
          this.checksumComparing = false;
          this.checksumCompared = true;

          if (this.checksumsMatch === true) {
            this.showSuccessmessage('Checksum verification successful');
          } else {
            this.ShowErrormessage('Checksum verification failed - checksums do not match');
          }
        },
        error: (errorResponse) => {
          const errorMessage = errorResponse.error.Message;
          this.checksumGenerating = false;
          this.ShowErrormessage('Failed to generate checksum');
        }
      });
  }

  downloadChecksumReport() {
    const apiPayload = {
      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"],
      ProjectName: this.ProjectCodePullForm.value["ProjectName"],
      project_id: this.ProjectCodePullForm.value["project_id"],
      Version: this.LatestVersion,
    };

    const projectNameRaw = this.ProjectCodePullForm.value["ProjectName"];

    const projectName = projectNameRaw.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_');
    const version = this.LatestVersion;

    const apiUrl = this._global.baseAPIUrl + 'Git/DownloadChecksumReport';
    this._onlineExamService.BulkDownload(apiPayload, apiUrl)
      .subscribe(blob => {

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${projectName}_${version}_Checksum_Report_${timestamp}.pdf`;

        saveAs(blob, fileName);
      });
  }

  downloadChecksumReportVersionWise(item: any) {
    const apiPayload = {
      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"],
      ProjectName: this.ProjectCodePullForm.value["ProjectName"],
      project_id: this.ProjectCodePullForm.value["project_id"],
      Version: item.Version,
    };

    const projectNameRaw = this.ProjectCodePullForm.value["ProjectName"];

    const projectName = projectNameRaw.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_');
    const version = item.Version;

    const apiUrl = this._global.baseAPIUrl + 'Git/DownloadChecksumReport';
    this._onlineExamService.DownloadPDF(apiPayload, apiUrl)
      .subscribe(blob => {

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${projectName}_${version}_Checksum_Report_${timestamp}.pdf`;

        saveAs(blob, fileName);
      });
  }

  closeChecksumModal() {
    this.showChecksumModal = false;
  }

  // Utility to sanitize filename parts
  private makeSafeFileName(value: string): string {
    return value.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').trim();
  }

  // Helper method to add footer
  private addFooter(pdf: any, pageNumber: number): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const footerY = pageHeight - 18;

    pdf.setFillColor(10, 66, 74);
    pdf.rect(0, footerY - 3, pageWidth, 21, 'F');

    pdf.setFillColor(0, 212, 128);
    pdf.rect(0, footerY - 3, pageWidth, 1, 'F');

    pdf.setTextColor(201, 245, 217);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('CROWN - Information Management | Secure Code Storage System', pageWidth / 2, footerY + 4, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Document generated on: ${new Date().toLocaleString()} | Digitally signed and verified`, pageWidth / 2, footerY + 8, { align: 'center' });

    pdf.setFontSize(6);
    pdf.text('This is an electronically generated document and is valid without physical signature.', pageWidth / 2, footerY + 12, { align: 'center' });

    // Page number
    pdf.setTextColor(201, 245, 217);
    pdf.setFontSize(9);
    pdf.text(`Page ${pageNumber}`, pageWidth - 20, footerY + 5, { align: 'right' });
  }

  // Helper method to load image
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // downloadAcknowledgementPDF(): void {
  //   this.generateDepositorPDF().then(blob => {
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `acknowledgement_${Date.now()}.pdf`;
  //     link.click();
  //     window.URL.revokeObjectURL(url);
  //   });
  // }

  //   viewDepositorAcknowledgementPDF(): void {
  //   this.generateDepositorPDF().then(blob => {
  //     const url = window.URL.createObjectURL(blob);
  //     window.open(url, '_blank');
  //     // optional: revoke later (not immediately, or tab may break)
  //     setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  //   });
  // }


  ////////////////////////////////////////////////////////======Depositor Acknowledgement Start=====////////////////////////////////////////////////////////

  openDepositorAcknowledgement(): void {
    if (this.IsDepositorAcknowledged == false && this.IsGitCodePulled == true) {
      this.ShowDepositorAckModal = true;
    } else {
      this.pullGitCode();
    }
  }

  closeDepositorAckModal(): void {
    this.ShowDepositorAckModal = false;
  }

  onDepositorSignatureUpload(event: any): void {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.ShowErrormessage('File size should not exceed 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.ShowErrormessage('Please upload a valid image file (PNG, JPG, JPEG)');
      return;
    }

    this.DepositorSignatureFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.DepositorSignaturePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeDepositorSignature(): void {
    this.DepositorSignatureFile = null;
    this.DepositorSignaturePreview = null;
    if (this.DepositorSignatureInput) {
      this.DepositorSignatureInput.nativeElement.value = '';
    }
  }

  async handleDepositorAcknowledge(): Promise<void> {
    this.loading = true;
    if (!this.DepositorSignatureFile) {
      this.ShowErrormessage('Please upload your signature before acknowledging');
      return;
    }

    try {
      // Generate PDF
      const pdfBlob = await this.generateDepositorPDF();

      const projectName = this.makeSafeFileName(this.ProjectCodePullForm.value["ProjectName"]);

      const version = this.makeSafeFileName(this.LatestVersion);

      // Send to backend
      let DepositorACKCopyFileName = `${projectName}_${version}_DepositorACK_${Date.now()}.pdf`;

      const formData = new FormData();
      formData.append('AcknowledgementPdf', pdfBlob, DepositorACKCopyFileName);
      formData.append('User_Token', localStorage.getItem("User_Token"));
      formData.append('CreatedBy', localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"]);
      formData.append('ProjectName', this.ProjectCodePullForm.value["ProjectName"]);
      formData.append('project_id', this.ProjectCodePullForm.value["project_id"]);
      formData.append('Version', this.LatestVersion);
      formData.append('FileUploadId', this.LatestFileUploadId);

      const apiUrl = this._global.baseAPIUrl + 'Git/SaveDepositorAcknowledgement';
      this._onlineExamService.postDataForPDFs(formData, apiUrl)
        .subscribe({
          next: (data: any) => {
            this.IsDepositorAcknowledged = true;
            this.ShowDepositorAckModal = false;
            this.loading = false;
            this.showSuccessmessage('Acknowledgement submitted successfully');
            this.GetLastProjectFile();
          },
          error: (errorResponse) => {
            console.error(errorResponse);
            this.ShowErrormessage('Failed to submit acknowledgement. Please try again.');
          }
        });
    } catch (error) {
      console.error('Error submitting acknowledgement:', error);
      this.ShowErrormessage('Failed to submit acknowledgement. Please try again.');
    }
  }

  async generateDepositorPDF(): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (2 * margin);

    // Load company logo
    let logoImg: HTMLImageElement | null = null;
    try {
      logoImg = await this.loadImage('assets/img/Logo3.png');
    } catch (error) {
      console.warn('Logo could not be loaded:', error);
    }

    // ==================== PAGE 1 - HEADER SECTION ====================
    // Header background
    pdf.setFillColor(10, 66, 74); // #0A424A
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Accent strip
    pdf.setFillColor(0, 212, 128); // #00d480
    pdf.rect(0, 39, pageWidth, 2, 'F');

    // ===== LOGO =====
    let startX = 8;
    const baseY = 17;

    if (logoImg) {
      const logoHeight = 22;
      const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
      pdf.addImage(logoImg, 'PNG', startX, 10, logoWidth, logoHeight);
      startX += logoWidth + 8; // spacing after logo
    }

    // ===== CROWN (next to logo) =====
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.text('CROWN', startX, baseY);

    // ===== INFORMATION MANAGEMENT (next to CROWN) =====
    const crownTextWidth = pdf.getTextWidth('CROWN');
    pdf.setFontSize(15);
    pdf.text('- INFORMATION MANAGEMENT', startX + crownTextWidth + 2, baseY);

    const titleX = startX;

    // ===== CENTER TITLE =====
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DEPOSITOR ACKNOWLEDGEMENT', titleX, 27, { align: 'left' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Official Document', titleX, 32, { align: 'left' });

    // ===== BODY START POSITION =====
    let currentY = 46;

    // ==================== DEPOSITOR INFORMATION SECTION ====================

    const drawField = (
      label: string,
      value: string,
      x: number,
      y: number,
      labelWidth: number,
      maxWidth: number
    ): number => {
      // Label
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(90, 90, 90);
      pdf.text(label, x, y);

      // Value (wrapped)
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 41, 46);

      const wrapped = pdf.splitTextToSize(value || 'N/A', maxWidth);
      pdf.text(wrapped, x + labelWidth, y);

      return wrapped.length * 7; // height used
    };

    // Column setup
    const col1X = margin + 8;
    const col2X = pageWidth / 2 + 5;
    const shortlabelWidth = 16;
    const longlabelWidth = 32;
    const longmaxValueWidth = contentWidth / 2 - longlabelWidth - 15;
    const shortmaxValueWidth = contentWidth / 2 - shortlabelWidth - 15;


    // ---- Calculate dynamic heights ----
    const nameH = pdf.splitTextToSize(this.DepositorName || 'N/A', shortmaxValueWidth).length * 7;
    const emailH = pdf.splitTextToSize(this.DepositorEmail || 'N/A', shortmaxValueWidth).length * 7;
    const dateH = pdf.splitTextToSize(this.projectName || 'N/A', longmaxValueWidth).length * 7;
    const intH = pdf.splitTextToSize(this.IntegrationType || 'N/A', longmaxValueWidth).length * 7;

    const row1H = Math.max(nameH, emailH);
    const row2H = Math.max(dateH, intH);

    const boxHeight = row1H + row2H + 35;

    // ---- Draw background box ----
    pdf.setFillColor(237, 250, 237);
    pdf.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'F');

    pdf.setDrawColor(0, 212, 128);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'S');

    // ---- Section title ----
    currentY += 8;
    pdf.setFillColor(10, 66, 74);
    pdf.roundedRect(margin + 5, currentY - 1, 53, 9, 2, 2, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DEPOSITOR INFO', margin + 8, currentY + 5);

    currentY += 15;

    // ---- Row 1 ----
    let used1 = drawField('NAME:', this.DepositorName, col1X, currentY, shortlabelWidth, shortmaxValueWidth);
    let used2 = drawField('EMAIL:', this.DepositorEmail, col2X, currentY, shortlabelWidth, shortmaxValueWidth);

    currentY += Math.max(used1, used2) + 5;

    // ---- Row 2 ----
    used1 = drawField('PROJECT NAME:', this.projectName, col1X, currentY, longlabelWidth + 5, longmaxValueWidth);
    used2 = drawField('INTEGRATION:', this.IntegrationType, col2X, currentY, longlabelWidth, longmaxValueWidth);

    currentY += Math.max(used1, used2) + 15;

    // ==================== ACKNOWLEDGEMENT TEXT SECTION ====================
    // Section heading
    pdf.setFillColor(10, 66, 74);
    pdf.roundedRect(margin + 5, currentY - 3, 66, 9, 2, 2, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACKNOWLEDGEMENT', margin + 8, currentY + 3.5);

    currentY += 15;

    // Acknowledgement text content
    pdf.setTextColor(15, 41, 46);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);

    const splitText = pdf.splitTextToSize(this.DepositorAcknowledgementText || 'No acknowledgement text provided.', contentWidth - 16);

    // Calculate available space on page 1
    const availableSpace = pageHeight - currentY - 30; // Reserve space for footer
    const lineHeight = 4.5;
    const linesPerPage = Math.floor(availableSpace / lineHeight);

    // Split text between pages
    const page1Text = splitText.slice(0, linesPerPage);
    const page2Text = splitText.slice(linesPerPage);

    // Draw content box for page 1
    const page1TextHeight = page1Text.length * lineHeight + 16;
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(201, 245, 217);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, currentY - 4, contentWidth, page1TextHeight, 3, 3, 'FD');

    pdf.text(page1Text, margin + 8, currentY + 2);

    // ==================== PAGE 1 FOOTER ====================
    this.addFooter(pdf, 1);

    // ==================== PAGE 2 ====================
    if (page2Text.length > 0 || this.DepositorSignaturePreview) {
      pdf.addPage();

      // PAGE - 2 Header
      // Header background
      pdf.setFillColor(10, 66, 74); // #0A424A
      pdf.rect(0, 0, pageWidth, 40, 'F');

      // Accent strip
      pdf.setFillColor(0, 212, 128); // #00d480
      pdf.rect(0, 39, pageWidth, 2, 'F');

      // ===== LOGO =====
      let startX = 8;
      const baseY = 17;

      if (logoImg) {
        const logoHeight = 22;
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
        pdf.addImage(logoImg, 'PNG', startX, 10, logoWidth, logoHeight);
        startX += logoWidth + 8; // spacing after logo
      }

      // ===== CROWN (next to logo) =====
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.text('CROWN', startX, baseY);

      // ===== INFORMATION MANAGEMENT (next to CROWN) =====
      const crownTextWidth = pdf.getTextWidth('CROWN');
      pdf.setFontSize(15);
      pdf.text('- INFORMATION MANAGEMENT', startX + crownTextWidth + 2, baseY);

      const titleX = startX;

      // ===== CENTER TITLE =====
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DEPOSITOR ACKNOWLEDGEMENT', titleX, 27, { align: 'left' });

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Official Document - (Continued)', titleX, 32, { align: 'left' });

      // // ===== BODY START POSITION =====
      currentY = 38;

      // Continue acknowledgement text if needed
      if (page2Text.length > 0) {
        const page2TextHeight = page2Text.length * lineHeight + 10;
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(201, 245, 217);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, currentY - 3, contentWidth, page2TextHeight, 3, 3, 'FD');

        pdf.setTextColor(15, 41, 46);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(page2Text, margin + 8, currentY + 2);

        currentY += page2TextHeight + 8;
      }

      // ==================== SIGNATURE SECTION ====================
      currentY += 10;

      // Signature box
      pdf.setFillColor(237, 250, 237);
      pdf.roundedRect(margin, currentY, contentWidth, 65, 3, 3, 'F');

      pdf.setDrawColor(0, 212, 128);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(margin, currentY, contentWidth, 65, 3, 3, 'S');

      currentY += 8;

      // Signature heading
      pdf.setFillColor(10, 66, 74);
      pdf.roundedRect(margin + 5, currentY - 3, 39, 9, 2, 2, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SIGNATURE', margin + 8, currentY + 3.5);

      currentY += 12;

      // Add signature image
      if (this.DepositorSignaturePreview) {
        try {
          // Signature background box
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(margin + 8, currentY, 65, 38, 2, 2, 'F');

          pdf.setDrawColor(201, 245, 217);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(margin + 8, currentY, 65, 38, 2, 2, 'S');

          // Add signature image
          pdf.addImage(this.DepositorSignaturePreview, 'PNG', margin + 10, currentY + 2, 61, 24);

          // Signature line
          pdf.setDrawColor(10, 66, 74);
          pdf.setLineWidth(0.5);
          pdf.line(margin + 10, currentY + 30, margin + 70, currentY + 30);

          pdf.setTextColor(90, 90, 90);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Digitally Signed', margin + 40, currentY + 35, { align: 'center' });
        } catch (error) {
          console.error('Error adding signature to PDF:', error);
          pdf.setTextColor(204, 0, 0);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Error loading signature image', margin + 8, currentY + 14);
        }
      } else {
        pdf.setTextColor(90, 90, 90);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[No signature provided]', margin + 8, currentY + 14);
      }

      currentY += 38;

      // ==================== IMPORTANT NOTICE ====================
      currentY += 10;

      pdf.setFillColor(250, 222, 181);
      pdf.setDrawColor(255, 204, 0);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

      pdf.setTextColor(15, 41, 46);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IMPORTANT:', margin + 5, currentY + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      const noticeText = 'This document constitutes a legally binding agreement. By providing your digital signature above, you confirm that you have read, understood, and agree to all terms stated in this acknowledgement.';
      const splitNotice = pdf.splitTextToSize(noticeText, contentWidth - 30);
      pdf.text(splitNotice, margin + 32, currentY + 6);

      // Page 2 Footer
      this.addFooter(pdf, 2);
    }

    return pdf.output('blob');
  }

  viewDepositorAcknowledgementPDF(): void {
    let user_Token = localStorage.getItem("User_Token");
    let CreatedBy = localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"];
    let project_id = this.ProjectCodePullForm.value["project_id"];
    let Version = this.LatestVersion;
    let fileUploadId = this.LatestFileUploadId;

    const apiUrl = this._global.baseAPIUrl + `Git/ViewDepositorAcknowledgement` +
      `?projectId=${project_id}&version=${Version}&fileUploadId=${fileUploadId}&CreatedBy=${CreatedBy}&user_Token=${user_Token}`;

    this._onlineExamService.viewPDF(apiUrl)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        },
        error: (err) => {
          console.error(err);
          this.ShowErrormessage('Unable to open acknowledgement PDF');
        }
      });
  }

  viewDepositorAcknowledgementPDFVersionWise(selectedRecord: any): void {
    console.log('Selected Record:', selectedRecord);
    let user_Token = localStorage.getItem("User_Token");
    let CreatedBy = localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"];
    let project_id = this.ProjectCodePullForm.value["project_id"];
    let Version = selectedRecord.Version;
    let fileUploadId = selectedRecord.ID;

    const apiUrl = this._global.baseAPIUrl + `Git/ViewDepositorAcknowledgement` +
      `?projectId=${project_id}&version=${Version}&fileUploadId=${fileUploadId}&CreatedBy=${CreatedBy}&user_Token=${user_Token}`;

    this._onlineExamService.viewPDF(apiUrl)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        },
        error: (err) => {
          console.error(err);
          this.ShowErrormessage('Unable to open acknowledgement PDF');
        }
      });
  }

  ////////////////////////////////////////////////////////======Depositor Acknowledgement End=====////////////////////////////////////////////////////////

  // ---------------------------------------------------------===========================================--------------------------------------------------------

  ////////////////////////////////////////////////////////======Beneficiary Acknowledgement Start=====//////////////////////////////////////////////////////

  openBeneficiaryAcknowledgement(): void {
    this.ShowBeneficiaryAckModal = true;
  }

  closeBeneficiaryAckModal(): void {
    this.ShowBeneficiaryAckModal = false;
  }

  onBeneficiarySignatureUpload(event: any): void {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.ShowErrormessage('File size should not exceed 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.ShowErrormessage('Please upload a valid image file (PNG, JPG, JPEG)');
      return;
    }

    this.BeneficiarySignatureFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.BeneficiarySignaturePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeBeneficiarySignature(): void {
    this.BeneficiarySignatureFile = null;
    this.BeneficiarySignaturePreview = null;
    if (this.BeneficiarySignatureInput) {
      this.BeneficiarySignatureInput.nativeElement.value = '';
    }
  }

  async handleBeneficiaryAcknowledge(): Promise<void> {
    this.loading = true;
    if (!this.BeneficiarySignatureFile) {
      this.ShowErrormessage('Please upload your signature before acknowledging');
      return;
    }

    try {
      // Generate PDF
      const pdfBlob = await this.generateBeneficiaryPDF();

      const projectName = this.makeSafeFileName(this.ProjectCodePullForm.value["ProjectName"]);

      const version = this.makeSafeFileName(this.LatestVersion);

      // Send to backend
      let BeneficiaryACKCopyFileName = `${projectName}_${version}_BeneficiaryACK_${Date.now()}.pdf`;

      const formData = new FormData();
      formData.append('AcknowledgementPdf', pdfBlob, BeneficiaryACKCopyFileName);
      formData.append('User_Token', localStorage.getItem("User_Token"));
      formData.append('CreatedBy', localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"]);
      formData.append('ProjectName', this.ProjectCodePullForm.value["ProjectName"]);
      formData.append('project_id', this.ProjectCodePullForm.value["project_id"]);
      formData.append('Version', this.LatestVersion);
      formData.append('FileUploadId', this.LatestFileUploadId);

      const apiUrl = this._global.baseAPIUrl + 'Git/SaveBeneficiaryAcknowledgement';
      this._onlineExamService.postDataForPDFs(formData, apiUrl)
        .subscribe({
          next: (data: any) => {
            this.ShowBeneficiaryAckModal = false;
            this.loading = false;
            // this.showSuccessmessage('Acknowledgement submitted successfully');
            this.onVerifyOne('Verification completed');
            this.GetLastProjectFile();
          },
          error: (errorResponse) => {
            console.error(errorResponse);
            this.ShowErrormessage('Failed to submit acknowledgement. Please try again.');
          }
        });
    } catch (error) {
      console.error('Error submitting acknowledgement:', error);
      this.ShowErrormessage('Failed to submit acknowledgement. Please try again.');
    }
  }

  async generateBeneficiaryPDF(): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (2 * margin);

    // Load company logo
    let logoImg: HTMLImageElement | null = null;
    try {
      logoImg = await this.loadImage('assets/img/Logo3.png');
    } catch (error) {
      console.warn('Logo could not be loaded:', error);
    }

    // ==================== PAGE 1 - HEADER SECTION ====================
    // Header background
    pdf.setFillColor(10, 66, 74); // #0A424A
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Accent strip
    pdf.setFillColor(0, 212, 128); // #00d480
    pdf.rect(0, 39, pageWidth, 2, 'F');

    // ===== LOGO =====
    let startX = 8;
    const baseY = 17;

    if (logoImg) {
      const logoHeight = 22;
      const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
      pdf.addImage(logoImg, 'PNG', startX, 10, logoWidth, logoHeight);
      startX += logoWidth + 8; // spacing after logo
    }

    // ===== CROWN (next to logo) =====
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.text('CROWN', startX, baseY);

    // ===== INFORMATION MANAGEMENT (next to CROWN) =====
    const crownTextWidth = pdf.getTextWidth('CROWN');
    pdf.setFontSize(15);
    pdf.text('- INFORMATION MANAGEMENT', startX + crownTextWidth + 2, baseY);

    const titleX = startX;

    // ===== CENTER TITLE =====
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BENEFICIARY ACKNOWLEDGEMENT', titleX, 27, { align: 'left' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Official Document', titleX, 32, { align: 'left' });

    // ===== BODY START POSITION =====
    let currentY = 46;

    // ==================== BENEFICIARY INFORMATION SECTION ====================

    const drawField = (
      label: string,
      value: string,
      x: number,
      y: number,
      labelWidth: number,
      maxWidth: number
    ): number => {
      // Label
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(90, 90, 90);
      pdf.text(label, x, y);

      // Value (wrapped)
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 41, 46);

      const wrapped = pdf.splitTextToSize(value || 'N/A', maxWidth);
      pdf.text(wrapped, x + labelWidth, y);

      return wrapped.length * 7; // height used
    };

    // Column setup
    const col1X = margin + 8;
    const col2X = pageWidth / 2 + 5;
    const shortlabelWidth = 16;
    const longlabelWidth = 32;
    const longmaxValueWidth = contentWidth / 2 - longlabelWidth - 15;
    const shortmaxValueWidth = contentWidth / 2 - shortlabelWidth - 15;


    // ---- Calculate dynamic heights ----
    const nameH = pdf.splitTextToSize(this.BeneficiaryName || 'N/A', shortmaxValueWidth).length * 7;
    const emailH = pdf.splitTextToSize(this.BeneficiaryEmail || 'N/A', shortmaxValueWidth).length * 7;
    const dateH = pdf.splitTextToSize(this.projectName || 'N/A', longmaxValueWidth).length * 7;
    const intH = pdf.splitTextToSize(this.IntegrationType || 'N/A', longmaxValueWidth).length * 7;

    const row1H = Math.max(nameH, emailH);
    const row2H = Math.max(dateH, intH);

    const boxHeight = row1H + row2H + 35;

    // ---- Draw background box ----
    pdf.setFillColor(237, 250, 237);
    pdf.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'F');

    pdf.setDrawColor(0, 212, 128);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'S');

    // ---- Section title ----
    currentY += 8;
    pdf.setFillColor(10, 66, 74);
    pdf.roundedRect(margin + 5, currentY - 1, 53, 9, 2, 2, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BENEFICIARY INFO', margin + 8, currentY + 5);

    currentY += 15;

    // ---- Row 1 ----
    let used1 = drawField('NAME:', this.BeneficiaryName, col1X, currentY, shortlabelWidth, shortmaxValueWidth);
    let used2 = drawField('EMAIL:', this.BeneficiaryEmail, col2X, currentY, shortlabelWidth, shortmaxValueWidth);

    currentY += Math.max(used1, used2) + 5;

    // ---- Row 2 ----
    used1 = drawField('PROJECT NAME:', this.projectName, col1X, currentY, longlabelWidth + 5, longmaxValueWidth);
    used2 = drawField('INTEGRATION:', this.IntegrationType, col2X, currentY, longlabelWidth, longmaxValueWidth);

    currentY += Math.max(used1, used2) + 15;

    // ==================== ACKNOWLEDGEMENT TEXT SECTION ====================
    // Section heading
    pdf.setFillColor(10, 66, 74);
    pdf.roundedRect(margin + 5, currentY - 3, 66, 9, 2, 2, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACKNOWLEDGEMENT', margin + 8, currentY + 3.5);

    currentY += 15;

    // Acknowledgement text content
    pdf.setTextColor(15, 41, 46);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);

    const splitText = pdf.splitTextToSize(this.BeneficiaryAcknowledgementText || 'No acknowledgement text provided.', contentWidth - 16);

    // Calculate available space on page 1
    const availableSpace = pageHeight - currentY - 30; // Reserve space for footer
    const lineHeight = 4.5;
    const linesPerPage = Math.floor(availableSpace / lineHeight);

    // Split text between pages
    const page1Text = splitText.slice(0, linesPerPage);
    const page2Text = splitText.slice(linesPerPage);

    // Draw content box for page 1
    const page1TextHeight = page1Text.length * lineHeight + 16;
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(201, 245, 217);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, currentY - 4, contentWidth, page1TextHeight, 3, 3, 'FD');

    pdf.text(page1Text, margin + 8, currentY + 2);

    // ==================== PAGE 1 FOOTER ====================
    this.addFooter(pdf, 1);

    // ==================== PAGE 2 ====================
    if (page2Text.length > 0 || this.BeneficiarySignaturePreview) {
      pdf.addPage();

      // PAGE - 2 Header
      // Header background
      pdf.setFillColor(10, 66, 74); // #0A424A
      pdf.rect(0, 0, pageWidth, 40, 'F');

      // Accent strip
      pdf.setFillColor(0, 212, 128); // #00d480
      pdf.rect(0, 39, pageWidth, 2, 'F');

      // ===== LOGO =====
      let startX = 8;
      const baseY = 17;

      if (logoImg) {
        const logoHeight = 22;
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
        pdf.addImage(logoImg, 'PNG', startX, 10, logoWidth, logoHeight);
        startX += logoWidth + 8; // spacing after logo
      }

      // ===== CROWN (next to logo) =====
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.text('CROWN', startX, baseY);

      // ===== INFORMATION MANAGEMENT (next to CROWN) =====
      const crownTextWidth = pdf.getTextWidth('CROWN');
      pdf.setFontSize(15);
      pdf.text('- INFORMATION MANAGEMENT', startX + crownTextWidth + 2, baseY);

      const titleX = startX;

      // ===== CENTER TITLE =====
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BENEFICIARY ACKNOWLEDGEMENT', titleX, 27, { align: 'left' });

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Official Document - (Continued)', titleX, 32, { align: 'left' });

      // // ===== BODY START POSITION =====
      currentY = 38;

      // Continue acknowledgement text if needed
      if (page2Text.length > 0) {
        const page2TextHeight = page2Text.length * lineHeight + 10;
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(201, 245, 217);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, currentY - 3, contentWidth, page2TextHeight, 3, 3, 'FD');

        pdf.setTextColor(15, 41, 46);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(page2Text, margin + 8, currentY + 2);

        currentY += page2TextHeight + 8;
      }

      // ==================== SIGNATURE SECTION ====================
      currentY += 10;

      // Signature box
      pdf.setFillColor(237, 250, 237);
      pdf.roundedRect(margin, currentY, contentWidth, 65, 3, 3, 'F');

      pdf.setDrawColor(0, 212, 128);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(margin, currentY, contentWidth, 65, 3, 3, 'S');

      currentY += 8;

      // Signature heading
      pdf.setFillColor(10, 66, 74);
      pdf.roundedRect(margin + 5, currentY - 3, 39, 9, 2, 2, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SIGNATURE', margin + 8, currentY + 3.5);

      currentY += 12;

      // Add signature image
      if (this.BeneficiarySignaturePreview) {
        try {
          // Signature background box
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(margin + 8, currentY, 65, 38, 2, 2, 'F');

          pdf.setDrawColor(201, 245, 217);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(margin + 8, currentY, 65, 38, 2, 2, 'S');

          // Add signature image
          pdf.addImage(this.BeneficiarySignaturePreview, 'PNG', margin + 10, currentY + 2, 61, 24);

          // Signature line
          pdf.setDrawColor(10, 66, 74);
          pdf.setLineWidth(0.5);
          pdf.line(margin + 10, currentY + 30, margin + 70, currentY + 30);

          pdf.setTextColor(90, 90, 90);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Digitally Signed', margin + 40, currentY + 35, { align: 'center' });
        } catch (error) {
          console.error('Error adding signature to PDF:', error);
          pdf.setTextColor(204, 0, 0);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Error loading signature image', margin + 8, currentY + 14);
        }
      } else {
        pdf.setTextColor(90, 90, 90);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[No signature provided]', margin + 8, currentY + 14);
      }

      currentY += 38;

      // ==================== IMPORTANT NOTICE ====================
      currentY += 10;

      pdf.setFillColor(250, 222, 181);
      pdf.setDrawColor(255, 204, 0);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

      pdf.setTextColor(15, 41, 46);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IMPORTANT:', margin + 5, currentY + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      const noticeText = 'This document constitutes a legally binding agreement. By providing your digital signature above, you confirm that you have read, understood, and agree to all terms stated in this acknowledgement.';
      const splitNotice = pdf.splitTextToSize(noticeText, contentWidth - 30);
      pdf.text(splitNotice, margin + 32, currentY + 6);

      // Page 2 Footer
      this.addFooter(pdf, 2);
    }

    return pdf.output('blob');
  }

  viewBeneficiaryAcknowledgementPDFVersionWise(selectedRecord: any): void {
    let user_Token = localStorage.getItem("User_Token");
    let CreatedBy = localStorage.getItem("UserID") || this.ProjectCodePullForm.value["CreatedBy"];
    let project_id = this.ProjectCodePullForm.value["project_id"];
    let Version = selectedRecord.Version;
    let fileUploadId = selectedRecord.ID;

    const apiUrl = this._global.baseAPIUrl + `Git/ViewBeneficiaryAcknowledgement` +
      `?projectId=${project_id}&version=${Version}&fileUploadId=${fileUploadId}&CreatedBy=${CreatedBy}&user_Token=${user_Token}`;

    this._onlineExamService.viewPDF(apiUrl)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        },
        error: (err) => {
          console.error(err);
          this.ShowErrormessage('Unable to open acknowledgement PDF');
        }
      });
  }

  ////////////////////////////////////////////////////////======Beneficiary Acknowledgement End=====////////////////////////////////////////////////////////

  openAckPopup(record: any) {
    this.selectedRecord = record;
    this.displayAckPopup = true;
  }

  closeAckPopup() {
    this.displayAckPopup = false;
    this.selectedRecord = null;
  }

  modal1: any

  resetForm(form: NgForm) {
    form.reset();
  }

  get f() {
    return this.ProjectCodePullForm.controls;
  }

  ShowErrormessage(data: any) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
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