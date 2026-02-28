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
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "primeng/api";
import swal from "sweetalert2";
import * as XLSX from "xlsx";
import { CommonService } from "src/app/Services/common.service";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: 'app-project-mapping',
  templateUrl: './project-mapping.component.html',
  styleUrls: ['./project-mapping.component.scss']
})
export class ProjectMappingComponent implements OnInit {

  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  UserList: any;
  _UserList: any;
  _UserL: any;
  _BeneficiaryL: any;
  _DepositorL: any;
  _PermissionL: any;
  _UploadTypeL: any;
  _VerificationLevelL: any;
  _FilteredList: any;
  _FilteredListFolder: any;
  _RoleList: any;
  AddProjectForm: FormGroup;
  submitted = false;
  Reset = false;
  forusercheking = false;
  showAlert = false;
  sMsg: string = "";
  _SingleUser: any = [];
  _UserID: any;
  User: any;
  first = 0;
  rows = 10;
  firstFolder = 0;
  isReadonly: boolean = true;
  rowsFolder = 10;
  records: any;
  _ColNameList: any;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private _commonService: CommonService
  ) { }
  ngOnInit() {
    this.AddProjectForm = this.formBuilder.group(
      {
        PID: [""],
        ProjectName: ["", [Validators.required, Validators.pattern(/^[a-zA-Z\-\s]+$/),],],
        UserIDS: [""],
        UserID: [0, [Validators.required, Validators.pattern(/^(?!0$)/)]],
        UsertypeID: [0, [Validators.required, Validators.pattern(/^(?!0$)/)]],
        StartDate: [{ value: "", disabled: true }, Validators.required],
        EndDate: [{ value: "", disabled: true }, Validators.required],
        User_Token: localStorage.getItem("User_Token"),
        user_Token: localStorage.getItem("User_Token"),
        CreatedBy: localStorage.getItem("UserID"),
        BeneficiaryID: [{ value: "", disabled: true }, [Validators.required, Validators.pattern(/^(?!0$)/)]],
        DepositorID: [{ value: "", disabled: true }, [Validators.required, Validators.pattern(/^(?!0$)/)]],
        UploadTypeID: [{ value: "", disabled: true }, [Validators.required, Validators.pattern(/^(?!0$)/)]],
        VerificationID: [{ value: "", disabled: true }, [Validators.required, Validators.pattern(/^(?!0$)/)]],
        SizeAllocation: ["", [Validators.required]],
        PermissionID: ["", [Validators.required, Validators.pattern(/^(?!0$)/)]],
      }
    );

    let _PID = localStorage.getItem('_PID');

    if (Number(_PID) > 0) {
      this.getValues();
      this.User = "Project";
    }
    else {
      this.AddProjectForm.controls["VerificationID"].setValue(0);
      this.AddProjectForm.controls["BeneficiaryID"].setValue(0);
      this.AddProjectForm.controls["DepositorID"].setValue(0);
      this.AddProjectForm.controls["UploadTypeID"].setValue(0);
    }

    this.Getpagerights();
    this.geRoleList();
    this.getPermissionList();
    this.GetProjectMappingList();
    this.VerificationLevelDetails();
    this.GetUploadTypes();
    this.getOrganizationList();
    this.User = "Project";
  }

  getValues() {
    const storedEndDate = localStorage.getItem('_EndDate');
    const storedStartDate = localStorage.getItem('_StartDate');
    if (storedEndDate) {
      const [day, month, year] = storedEndDate.split('-').map(Number);
      const _EndDate = new Date(year, month - 1, day);
      this.AddProjectForm.controls['EndDate'].setValue(_EndDate);
    }
    if (storedStartDate) {
      const [day, month, year] = storedStartDate.split('-').map(Number);
      const _StartDate = new Date(year, month - 1, day);
      this.AddProjectForm.controls['StartDate'].setValue(_StartDate);
    }
    this.AddProjectForm.controls['PID'].setValue(localStorage.getItem('_PID'));
    this.AddProjectForm.controls['ProjectName'].setValue(localStorage.getItem('_ProjectName'));
    this.AddProjectForm.controls['SizeAllocation'].setValue(localStorage.getItem('_SizeAllocation'));
    this.AddProjectForm.controls['BeneficiaryID'].setValue(localStorage.getItem('_BeneficiaryID'));
    this.AddProjectForm.controls['DepositorID'].setValue(localStorage.getItem('_DepositorID'));
    this.AddProjectForm.controls['UploadTypeID'].setValue(localStorage.getItem('_UploadTypeID'));
    this.AddProjectForm.controls['VerificationID'].setValue(localStorage.getItem('_VerificationID'));
  }

  getUserList(UsertypeID: any) {
    const apiUrl = this._global.baseAPIUrl + "Master/GetOrgUserList?UsertypeID=" + UsertypeID + "&BeneficiaryID=" + this.AddProjectForm.get("BeneficiaryID").value + "&DepositorID=" + this.AddProjectForm.get("DepositorID").value + "&user_Token=" + this.AddProjectForm.get("User_Token").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._UserL = data;
      console.log(this._UserL, 'kapil')
    });
  }

  GetUploadTypes() {
    const apiUrl = this._global.baseAPIUrl + "Master/GetUploadTypes?user_Token=" + this.AddProjectForm.get('User_Token').value
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._UploadTypeL = data;
    });
  }

  VerificationLevelDetails() {
    const apiUrl = this._global.baseAPIUrl + "Master/VerificationLevelDetails?user_Token=" + this.AddProjectForm.get('User_Token').value
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._VerificationLevelL = data;
    });
  }


  getOrganizationList() {
    const apiUrl = this._global.baseAPIUrl + "Master/GetOrganizationList?user_Token=" + this.AddProjectForm.get('User_Token').value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
      const Beneficiary = data.filter(item => item.OrganizationTypeID === "1");
      const Depositor = data.filter(item => item.OrganizationTypeID === "2");
      this._BeneficiaryL = Beneficiary;
      this._DepositorL = Depositor;
    });
  }

  getPermissionList() {
    const apiUrl = this._global.baseAPIUrl + "Role/GetPermissions?user_Token=" + this.AddProjectForm.get('User_Token').value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._PermissionL = data;
      this.AddProjectForm.controls["PermissionID"].setValue(0);
    });
  }

  Getpagerights() {
    var pagename = "Project";
    const apiUrl = this._global.baseAPIUrl + "Admin/Getpagerights?userid=" + localStorage.getItem("UserID") + " &pagename=" + pagename + "&user_Token=" + localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data) => {
      if (data <= 0) {
        localStorage.clear();
        this.router.navigate(["/Login"]);
      }
    });
  }

  onBack() {
    localStorage.removeItem('_PID');
    localStorage.removeItem('_ProjectName');
    localStorage.removeItem('_StartDate');
    localStorage.removeItem('_EndDate');
    localStorage.removeItem('_BeneficiaryID');
    localStorage.removeItem('_SizeAllocation');
    localStorage.removeItem('_DepositorID');
    localStorage.removeItem('_UploadTypeID');
    localStorage.removeItem('_VerificationID');
    this.router.navigateByUrl('/master/Project');
  }

  get f() {
    return this.AddProjectForm.controls;
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) {
    this.activeRow = event.row;
  }

  geRoleList() {
    const userToken =
      this.AddProjectForm.get("User_Token").value ||
      localStorage.getItem("User_Token");
    const apiUrl = this._global.baseAPIUrl + "Role/GetList?user_Token=" + userToken;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RoleList = data;
    });
  }

  GetProjectMappingList() {
    this.formattedData = [];
    this.headerList = [];
    const apiUrl = this._global.baseAPIUrl + "Master/GetProjectMappingList?PID=" + this.AddProjectForm.get('PID').value + "&user_Token=" + this.AddProjectForm.get('User_Token').value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RoleList = data;
      this._FilteredList = data;
      this.prepareTableData(this._RoleList, this._FilteredList);
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
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      // { field: "srNo", header: "SR NO", index: 1 },
      { field: "ProjectName", header: "Project Name", index: 3 },
      { field: "Username", header: "User Name", index: 2 },
      { field: "Permission", header: "Permission", index: 3 },
      { field: "Usertype", header: "User Type", index: 3 },
      { field: "MappedBy", header: "Added By", index: 3 },
      { field: "MappedDate", header: "Added On", index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        // srNo: parseInt(index + 1),
        ProjectName: el.ProjectName,
        PID: el.PID,
        UserID: el.UserID,
        Username: el.Username,
        PermissionID: el.PermissionID,
        Usertype: el.Usertype,
        Permission: el.Permission,
        MappedBy: el.MappedBy,
        MappedDate: this._commonService.formatLocalTime(el.MappedDate),
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  searchTable($event) {
    let val = $event.target.value;
    if (val == "") {
      this.formattedData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(",");
      this.formattedData = this.immutableFormattedData.filter(function (d) {
        for (var key in d) {
          strArr.forEach((el) => {
            if (
              d[key] &&
              el !== "" &&
              (d[key] + "").toLowerCase().indexOf(el.toLowerCase()) !== -1
            ) {
              if (filteredArr.filter((el) => el.srNo === d.srNo).length === 0) {
                filteredArr.push(d);
              }
            }
          });
        }
      });
      this.formattedData = filteredArr;
    }
  }

  OnReset() {
    this.Reset = true;
    this.AddProjectForm.controls['UserID'].setValue(0);
    this.AddProjectForm.controls['UsertypeID'].setValue(0);
    this.AddProjectForm.controls['PermissionID'].setValue(0);
    this.User = "Project";
  }

  onEditPermission(EditL) {
    this.AddProjectForm.controls['UserID'].setValue(EditL.UserID);
    this.AddProjectForm.controls['PermissionID'].setValue(EditL.PermissionID);
  }

  onProjectMapping() {
    this.submitted = true;

    this.AddProjectForm.patchValue({
      CreatedBy: localStorage.getItem('UserID'),
      User_Token: localStorage.getItem('User_Token'),
    });

    const apiUrl = this._global.baseAPIUrl + 'Master/ProjectMapping';
    this._onlineExamService.postData(this.AddProjectForm.value, apiUrl)
      .subscribe(data => {
        this.ShowMessage(data);
        this.GetProjectMappingList();
        this.AddProjectForm.markAsPristine();
        this.AddProjectForm.markAsUntouched();
        this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Added/Edited Project User Mapping', this.AddProjectForm.controls['ProjectName'].value).subscribe(
          (Res: any) => { });
      });
    this.OnReset();
  }

  onDeletePermission(DeleteL: any) {
    this.submitted = true;

    // const apiUrl = this._global.baseAPIUrl + 'Master/DeleteProjectMapping';
    // this._onlineExamService.postData(this.AddProjectForm.value, apiUrl)
    //   .subscribe(data => {
    //     this.ShowMessage(data);
    //     this.GetProjectMappingList();
    //   });
    if (DeleteL.UserID !== null && DeleteL !== "") {
      swal
        .fire({
          title: "Are you sure?",
          text: "You want to Delete the User Mapping ?",
          type: "warning",
          showCancelButton: true,
          buttonsStyling: false,
          confirmButtonClass: "btn dangerbtn",
          confirmButtonText: "Yes Delete it !",
          cancelButtonClass: "btn successbtn",
        })
        .then((result) => {
          if (result.value) {
            this.AddProjectForm.patchValue({
              UserID: DeleteL.UserID,
              PID: DeleteL.PID,
              User_Token: localStorage.getItem('User_Token'),
            });

            const apiUrl = this._global.baseAPIUrl + 'Master/DeleteProjectMapping';
            this._onlineExamService.postData(this.AddProjectForm.value, apiUrl)
              .subscribe(data => {
                swal.fire({
                  title: "Deleted !",
                  text: "User Mapping has been Deleted !",
                  type: "success",
                  buttonsStyling: false,
                  confirmButtonClass: "btn successbtn",
                });
                this.GetProjectMappingList();
                this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Deleted Project User Mapping', this.AddProjectForm.controls['ProjectName'].value + ' - ' + DeleteL.Username).subscribe(
                  (Res: any) => { });
              });
          }
        });
    } else {
      this.ShowErrormessage("Your already log in so you can not delete!");
    }
    this.OnReset();
  }

  ShowErrormessage(data: any) {
    this.messageService.add({ severity: "error", summary: "Error", detail: data, });
  }

  ShowMessage(data: any) {
    this.messageService.add({ severity: "success", summary: "Success", detail: data, });
  }

  onDownloadExcelFile(_filename: string) {
    if (_filename == "User List") {
      this.exportToExcel(this.formattedData, _filename);
    } else {
      this.exportToExcel(this.formattedData, "Folder Access Details");
    }
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

  showSuccessmessage(data: any) {
    this.messageService.add({ severity: "success", summary: "Success", detail: data, });
  }

  showmessage(data: any) {
    this.messageService.add({ severity: "success", summary: "Success", detail: data, });
  }
}
