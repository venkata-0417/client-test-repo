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
  selector: 'app-code-release-request',
  templateUrl: './code-release-request.component.html',
  styleUrls: ['./code-release-request.component.scss']
})
export class CodeReleaseRequestComponent implements OnInit {

  pdfFile: File | null = null;
  selectedFile: File | null = null;
  maxFileSize: number = 10 * 1024 * 1024; // 10MB in bytes
  allowedFileTypes: string[] = ['application/pdf']
  temp: any
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
      Comment: ['', Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.CodeReleaseForm.controls['PID'].setValue(localStorage.getItem("_PID"));

    this.Getpagerights();
    this.GetProjectListForCodeRelease();
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
    const apiUrl = this._global.baseAPIUrl + "Master/GetProjectListForCodeRelease?user_Token=" + localStorage.getItem("User_Token") + "&UserID=" + localStorage.getItem("UserID") + "&PID=" + this.CodeReleaseForm.controls['PID'].value;
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

  // onCodeRelease(){
  //   if (this.CodeReleaseForm.valid) {
  //     const apiUrl = this._global.baseAPIUrl + "Master/CodeReleaseRequest";
  //     this._onlineExamService.postData(this.CodeReleaseForm.value, apiUrl).subscribe((data) => {
  //         this.onVerifyReset();
  //         this.onBack();
  //         this.ShowMessage(data);
  //         this._onlineExamService.triggerReload();
  //         this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Code Release Request Raised', this.CodeReleaseForm.controls['ProjectName'].value).subscribe(
  //           (Res: any) => { });
  //       });
  //   } else {
  //     console.error("Form is invalid");
  //   }
  // }
   onCodeRelease() {
  if (!this.CodeReleaseForm.valid) {
    this.ShowErrormessage("Please fill all required fields");
    return;
  }

  // 🔴 File mandatory check
  if (!this.selectedFile) {
    this.ShowErrormessage("Please upload Supporting Document");
    return;
  }

  const formData = new FormData();
  formData.append('PID', this.CodeReleaseForm.get('PID')?.value);
  formData.append('project_id', this.CodeReleaseForm.get('project_id')?.value);
  formData.append('ProjectName', this.CodeReleaseForm.get('ProjectName')?.value);
  formData.append('Version', this.CodeReleaseForm.get('Version')?.value);
  formData.append('Comment', this.CodeReleaseForm.get('Comment')?.value);
  formData.append('User_Token', localStorage.getItem("User_Token") || '');
  // formData.append('user_Token', localStorage.getItem("User_Token") || '');
  formData.append('CreatedBy', localStorage.getItem("UserID") || '');
  formData.append('PdfDocument', this.selectedFile, this.selectedFile.name);

  const apiUrl = this._global.baseAPIUrl + "Master/CodeReleaseRequestWithFile";

  this.http.post(apiUrl, formData).subscribe(
    (data: any) => {
      this.onVerifyReset();
      this.onBack();
      this.ShowMessage(data);
      this._onlineExamService.triggerReload();
      this._onlineExamService.Log_Report(
        localStorage.getItem('UserID'),
        'Code Release Request Raised with Document',
        this.CodeReleaseForm.controls['ProjectName'].value
      ).subscribe();
    },
    (error) => {
      this.ShowErrormessage(error.error?.message || 'Failed to submit request');
    }
  );
}

  onVerifyReset() {
    this.CodeReleaseForm.patchValue({
      Comment: '',
      PdfUpload: null
    });
    this.selectedFile = null;
    this.pdfFile = null;
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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

  onPdfUpload(event: any) { 
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') { 
      this.pdfFile = file; 
      console.log('PDF uploaded:', file.name);
    } else {
      this.pdfFile = null;
      alert('Please upload a valid PDF file.'); 
    } 
  }

  /**
   * NEW METHOD: Handle file selection with validation
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!this.allowedFileTypes.includes(file.type)) {
        this.ShowErrormessage('Please upload a PDF file only');
        input.value = ''; 
        return;
      }
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.ShowErrormessage(`File size must be less than ${this.formatFileSize(this.maxFileSize)}`);
        input.value = ''; 
        return;
      }
      
      // File is valid
      this.selectedFile = file;
      this.pdfFile = file;
      this.CodeReleaseForm.patchValue({
        PdfUpload: file
      });
      
      this.showSuccessmessage(`${file.name} selected successfully`);
    }
  }

  /**
   * NEW METHOD: Remove selected file
   */
  removeFile(): void {
    this.selectedFile = null;
    this.pdfFile = null;
    this.CodeReleaseForm.patchValue({
      PdfUpload: null
    });
    
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    this.messageService.add({
      severity: 'info',
      summary: 'File Removed',
      detail: 'File has been removed',
      life: 2000
    });
  }

  /**
   * NEW METHOD: Format file size to human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * NEW METHOD: Drag and drop handlers (optional)
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create a mock event for the onFileSelected method
      const mockEvent = {
        target: {
          files: [file]
        }
      } as any;
      
      this.onFileSelected(mockEvent);
    }
  }
}
