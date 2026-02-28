import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService, TreeNode } from "primeng/api";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';
import { CommonService } from "src/app/Services/common.service";

// import { Listboxclass } from '../../../Helper/Listboxclass';
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-code-browse",
  templateUrl: "code-browse.component.html",
  styleUrls: ["code-browse.component.css"],
})
export class CodeBrowseComponent implements OnInit {
  files: any[] = []; // This will hold the tree data
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  isReadonly = true;
  _IndexList: any;
  CodeBrowseForm: FormGroup;
  submitted = false;
  BranchList: any;
  Reset = false;
  sMsg: string = "";
  first = 0;
  rows = 10;
  selectedFilePath: any;
  _VersionL: any;
  events: any;
  LatestVersion: any
  LatestFileUploadId: any
  selectedFilePathID: any;
  // files!: TreeNode[];

  selectedFile!: TreeNode;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private _commonService: CommonService
  ) { }
  ngOnInit() {

    this.CodeBrowseForm = this.formBuilder.group({
      PID: ["", Validators.required],
      project_id: ["", Validators.required],
      FileNo: ["", Validators.required],
      Version: [""],
      Filepath: ["", Validators.required],
      FilePathID: [""],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    let _PID = localStorage.getItem('_PID');

    if (Number(_PID) > 0) {
      this.CodeBrowseForm.controls['project_id'].setValue(localStorage.getItem('_PID'));
      this.CodeBrowseForm.controls['PID'].setValue(localStorage.getItem('_PID'));
    }

    this.loadHTML();
    this.getBranchList(0);
    this.GetLastProjectFile();
    this.ViewPullDetails();
    
    this._onlineExamService.preventScreenshots();
  }

  safeHtmlContent: string = '';
  contentLines: string[] = [];
  loadHTML(): void {
    this.http.get('assets/sample.js', { responseType: 'text' }).subscribe({
      next: (data: string) => {
      },
      error: (error) => {
        console.error('Error fetching the file:', error);
      },
    });
  }

  getBranchList(FilePathID: any) {
    this.CodeBrowseForm.patchValue({
      FilePathID: FilePathID,
      project_id: this.CodeBrowseForm.controls['project_id'].value,
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID')
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/GetSourceCodeDetails'
    this._onlineExamService.postData(this.CodeBrowseForm.value, apiUrl).subscribe((response) => {
      // this.files = this.transformToTreeNodes(data);
      
      const decrypted = this._commonService.decrypt(response.data); // Make sure 'data' matches backend
      this.files = this.transformToTreeNodes(decrypted);
      // this.ViewSourceCode = true;
    });

    this.selectedFilePathID = FilePathID;
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

  OnReset() {
    this.Reset = true;
    this.CodeBrowseForm.reset();
    this.isReadonly = false;
  }

  getFile(event) {
    //   const selectedNode = event.node;  
    //   // Check if it is a file and display its file path
    //   // if (selectedNode.data && selectedNode.data.filePath) {
    //   //   this.selectedFilePath = selectedNode.data.filePath;
    //   // }
    //  // alert(this.selectedFilePath );
    //  const file: File = this.selectedFilePath.files[0];
    //  console.log('Selected File:', file.name);
    //  console.log('File Path:', file.webkitRelativePath || file.name);
    // this.GetFileFomServer(this.selectedFilePath);

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

  GetFileFomServer(filepath: string) {
    this.CodeBrowseForm.patchValue({
      Filepath: filepath,
      User_Token: localStorage.getItem('User_Token'),
    });
    const that = this;
    const apiUrl = this._global.baseAPIUrl + 'Git/GetFileFomServer';
    this._onlineExamService.postData(this.CodeBrowseForm.value, apiUrl)
      .subscribe(data => {
        this.contentLines = data.replace(/\t/g, '\\t').split('\n');
      });
  }

  get f() {
    return this.CodeBrowseForm.controls;
  }

  validateFile(file: string) {
    const validExtensions = ['.txt', '.html', '.cs', '.css', '.ts', '.vb', '.js', '.scss', '.json', '.md', '.xml', '.yml'];
    const validMimeTypes = [
      'text/plain', 'text/html', 'text/css', 'application/javascript',
      'application/json', 'text/markdown', 'text/xml', 'application/x-yaml',
      'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
      'application/octet-stream', 'text/x-scss', 'text/x-vbscript'
    ];
    const fileExt = file.substring(file.lastIndexOf('.'), file.length);
    const fileExtension = fileExt; // fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : null;

    if (validExtensions.includes(fileExtension!)) {
      this.GetFileFomServer(this.selectedFilePath);
      console.log('Valid file type:', file);
    } else {
      console.log('Invalid file type.');
    }
  }

  expandAll() {
    this.toggleNodes(this.files, true);
  }

  collapseAll() {
    this.toggleNodes(this.files, false);
  }

  toggleNodes(nodes: any[], expand: boolean) {
    nodes.forEach((node) => {
      node.expanded = expand;
      if (node.children) {
        this.toggleNodes(node.children, expand);
      }
    });
  }

  ViewPullDetails() {
    localStorage.setItem('loadingOff', 'false')
    const apiUrl = this._global.baseAPIUrl + "Git/GetAuditLogByProjectID?User_Token=" + localStorage.getItem("User_Token") + "&project_id=" + this.CodeBrowseForm.controls['project_id'].value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.events = data && data.length > 0 ? data : null;
      this._VersionL = data;
      this.CodeBrowseForm.controls['Version'].setValue(0);
      localStorage.setItem('loadingOff', '')
    });
  }

  GetLastProjectFile() {
    const apiUrl = this._global.baseAPIUrl + 'Master/GetLastProjectFile?PID=' + this.CodeBrowseForm.controls['project_id'].value + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this.LatestVersion = data[0].Version;
      this.LatestFileUploadId = data[0].Id;
    });
  }

  onBack() {
    localStorage.removeItem('_PID');
    this.router.navigate(['/process/code-release']);
  }

  hidepopup() {
    this.modalRef.hide();
  }

  ngOnDestroy() {
    document.body.classList.remove("data-entry");
    this._onlineExamService.cleanup();
  }


  ErrorMessage(msg: any) {
    this.messageService.add({ severity: "error", summary: "error", detail: msg, });
  }

  Message(msg: any) {
    this.messageService.add({ severity: "success", summary: "Success", detail: msg, });
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  blockCopy(event: ClipboardEvent): void {
    event.preventDefault();
    console.log('Copy action blocked.');
  }

  blockContextMenu(event: MouseEvent): void {
    event.preventDefault();
    console.log('Context menu action blocked.');
  }

  downloadSCFile() {
    this.CodeBrowseForm.patchValue({
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
      FilePathID: this.selectedFilePathID
    });

    const apiUrl = this._global.baseAPIUrl + 'Git/DownloadSCode';
    this._onlineExamService.BulkDownload(this.CodeBrowseForm.value, apiUrl).subscribe(res => {
      if (res) {
        saveAs(res, "Source Code" + '.zip');
      }
    });
  }

  
  //--------------------------------------------------------------------------------------------------------------------------------------------------------------//

  preventScreenshots() {
    window.addEventListener('keyup', (event) => {
      if (event.key === 'PrintScreen') {
        this.hideSensitiveContentForBlur();
      }
      else if (event.metaKey && event.shiftKey && event.key === 'S') {
        this.hideSensitiveContent();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.warn('Screen recording or screenshot attempt detected!');
        this.hideSensitiveContentForBlur();
      } else {
        console.warn('Window is visible again');
        this.showSensitiveContent();
      }
    });

    window.addEventListener('blur', () => {
      this.hideSensitiveContentForBlur();
    });

    window.addEventListener('click', () => {
      this.showSensitiveContent();
    });
  }

  hideSensitiveContent() {
    document.body.classList.add('blur-contentForScreenShot');
    
    setTimeout(() => {
      document.body.classList.remove('blur-contentForScreenShot');
    }, 3000);
  }

  hideSensitiveContentForBlur() {
    document.body.classList.add('blur-content');

    let message = document.createElement('div');
    message.id = 'return-message';
    message.textContent = 'Screen blurred for your privacy. Click anywhere to return to the application.';
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '9999';
    message.style.textAlign = 'center';
    message.style.pointerEvents = 'none';

    if (!document.getElementById('return-message')) {
      document.body.appendChild(message);
    }
  }

  showSensitiveContent() {
    document.body.classList.remove('blur-content');

    let message = document.getElementById('return-message');
    if (message) {
      message.remove();
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------//


}
