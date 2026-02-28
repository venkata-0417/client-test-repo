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
import DOMPurify from 'dompurify';

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-users",
  templateUrl: "users.component.html",
  styleUrls: ["users.component.css"],
})
export class UsersComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _CSVData: any;
  UserList: any;
  _UserList: any;
  _UserL: any;
  _FilteredList: any;
  _FilteredListFolder: any;
  _RoleList: any;
  _UsertypeList: any;
  AddUserForm: FormGroup;
  UploadCSVForm: FormGroup;
  AddpasswordReset: FormGroup;
  _EntityList: any;
  submitted = false;
  Reset = false;
  showAlert = false;
  sMsg: string = "";
  _SingleUser: any = [];
  _UserID: any;
  User: any;
  first = 0;
  rows = 10;
  firstFolder = 0;
  rowsFolder = 10;
  records: any;
  _ColNameList: any;
  checked = true;
  showPassword: boolean = false;
  showCnfPassword: boolean = false;

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
    this.AddUserForm = this.formBuilder.group(
      {
        id: [""],
        name: [
          "",
          [Validators.required, Validators.pattern(/^[a-zA-Z\-\s]+$/)],
        ],
        userid: ["", Validators.required],
        UserIDS: [""],
        UserID: [""],
        pwd: [
          "",
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
            ),
          ],
        ],
        confirmPass: ["", Validators.required],
        email: [
          "",
          [
            Validators.required,
            Validators.pattern(
              /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ),
          ],
        ],
        mobile: ["", Validators.required],
        usetType: ["", Validators.required],
        roleName: ["", Validators.required],
        User_Token: localStorage.getItem("User_Token"),
        CreatedBy: localStorage.getItem("UserID"),        
        usetLevel:['0'],
      },
      {
        validator: this.ConfirmedValidator("pwd", "confirmPass"),
      }
    );
    this.AddpasswordReset = this.formBuilder.group(
      {
        Users: ["", Validators.required],
        Rpwd: [
          "",
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
            ),
          ],
        ],
        RconfirmPass: ["", Validators.required],

        //Added by Komal
        usetLevel: [{ value: '', disabled: false },Validators.required],

        User_Token: localStorage.getItem("User_Token"),
        CreatedBy: localStorage.getItem("UserID"),
      },
      {
        validator: this.ConfirmedValidator("Rpwd", "RconfirmPass"),
      }
    );

    this.Getpagerights();
    this.geRoleList();
    this.geUserList();
    this.getUserType();
    this.User = "Add User";
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleCnfPasswordVisibility() {
    this.showCnfPassword = !this.showCnfPassword;
  }

  geUserList() {
    const userToken =
      this.AddUserForm.get("User_Token").value || localStorage.getItem("User_Token");
    const apiUrl = this._global.baseAPIUrl + "Admin/GetList?user_Token=" + userToken;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.UserList = data;
      this._UserL = data;
      this.AddUserForm.controls["UserID"].setValue(0);
      this.AddUserForm.controls["UserIDS"].setValue(0);
      this._FilteredList = data;
      this.prepareTableData(this.UserList, this._FilteredList);
    });
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      // { field: "srNo", header: "SR NO", index: 1 },
      { field: "name", header: "Name", index: 3 },
      { field: "userid", header: "User Id", index: 2 },
      { field: "email", header: "Email Id", index: 3 },
      { field: "mobile", header: "Mobile", index: 3 },
      // { field: "Organization", header: "ORGANIZATION", index: 3 },
      { field: "Role", header: "Role", index: 3 },
      { field: "creationDate", header: "Created Date", index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        // srNo: parseInt(index + 1),
        id: el.id,
        name: el.name,
        userid: el.userid,
        email: el.email,
        mobile: el.mobile,
        Organization: el.Organization,
        Role: el.Role,
        creationDate: this._commonService.formatLocalTime(el.creationDate),
        ISACTIVE: el.ISACTIVE == "Y" ? "Active" : "In-Active",
        checked: el.ISACTIVE === "Y" ? false : true,
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

  onDownloadExcelFile(_filename: string) {
    this.exportToExcel(this.formattedData, _filename);

    this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Downloaded', 'Downloaded User List').subscribe(
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

  OnClose() {
    this.modalService.hide(1);
  }

  OnReset() {
    this.Reset = true;
    this.AddUserForm.reset();
    this.User = "Add User";
  }

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors.confirmedValidator
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  getUserType() {
    const apiUrl = this._global.baseAPIUrl + 'Admin/getUserType?user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._UsertypeList = data;
      this.AddUserForm.controls['usetType'].setValue(0); 
      //Added by Komal
      this.AddUserForm.controls['usetLevel'].setValue(0);
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.AddUserForm.value.usetType <= 0) {
      this.ShowErrormessage("Select UserType");
      return;
    }

    //Added by Komal
    if (this.AddUserForm.value.usetType == "2" && this.AddUserForm.value.roleName == "1026" && this.AddUserForm.value.usetLevel <= 0) {
      this.ShowErrormessage("Select UserLevel");
      return;
    }

    if (this.AddUserForm.value.userid.trim() == "") {
      this.ShowErrormessage("Please enter user ID");
      return;
    }
    if (this.AddUserForm.value.name.trim() == "") {
      this.ShowErrormessage("Please enter user");
      return;
    }

    this.AddUserForm.value.UserID = this.AddUserForm.value.userid;

    if (this.AddUserForm.value.User_Token == null) {
      this.AddUserForm.value.User_Token = localStorage.getItem("User_Token");
    }

    this.AddUserForm.patchValue({
      confirmPass: this._commonService.encryptData(this.AddUserForm.controls['confirmPass'].value),
      pwd: this._commonService.encryptData(this.AddUserForm.controls['pwd'].value),
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    if (this.AddUserForm.get("id").value) {
      const apiUrl = this._global.baseAPIUrl + "Admin/Update";
      this._onlineExamService
        .postData(this.AddUserForm.value, apiUrl)
        .subscribe((data) => {
          if (data === 'User Updated Successfully.') {
            this.ShowMessage(data);
            this.modalService.hide(1);
            this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Updated User', this.AddUserForm.controls['name'].value).subscribe(
              (Res: any) => { });
            this.OnReset();
            this.geUserList();
          } else {
            this.ShowErrormessage(data);
          }
        });
    } else {
      const apiUrl = this._global.baseAPIUrl + "Admin/Create";
      this._onlineExamService
        .postData(this.AddUserForm.value, apiUrl)
        .subscribe((data) => {
          if (data === 'User Created Successfully.') {
            this.ShowMessage(data);
            this.modalService.hide(1);
            this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Created New User', this.AddUserForm.controls['name'].value).subscribe(
              (Res: any) => { });
            this.OnReset();
            this.geUserList();
          } else {
            this.ShowErrormessage(data);
          }
        });
    }
  }


  deleteEmployee(id: any) {
    var temp: any;
    if (id.ISACTIVE === "Active") {
      temp = "In-Active"
    }
    else {
      temp = "Active"
    }

    if (id.roleName == "Admin") {
      this.ShowErrormessage("You can not delete admin role account");
      return;
    }

    if (id != localStorage.getItem("UserID")) {
      swal
        .fire({
          title: "Are you sure?",
          text: "You want to " + temp + " the User ?",
          type: "warning",
          showCancelButton: true,
          buttonsStyling: false,
          confirmButtonClass: "btn dangerbtn",
          confirmButtonText: "Yes " + temp + " it !",
          cancelButtonClass: "btn successbtn",
        })
        .then((result) => {
          if (result.value) {
            this.AddUserForm.patchValue({
              id: id.id,
              User_Token: localStorage.getItem("User_Token"),
            });

            const apiUrl = this._global.baseAPIUrl + "Admin/Delete";
            this._onlineExamService
              .postData(this.AddUserForm.value, apiUrl)
              .subscribe((data) => {
                swal.fire({
                  title: temp + "d !",
                  text: "User has been " + temp + "d !",
                  type: "success",
                  buttonsStyling: false,
                  confirmButtonClass: "btn successbtn",
                });
                this.geUserList();
                this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'User ' + temp + 'd', id.name).subscribe(
                  (Res: any) => { });
              });
          }
        });
    } else {
      this.ShowErrormessage("Your already log in so you can not delete!");
    }

    this.geUserList();
  }

  Getpagerights() {
    var pagename = "Add User";
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
      this.AddUserForm.get("User_Token").value ||
      localStorage.getItem("User_Token");
    const apiUrl =
      this._global.baseAPIUrl + "Role/GetList?user_Token=" + userToken;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RoleList = data;
    });
    this.AddUserForm.controls['roleName'].setValue(0);
  }

  editEmployee(template: TemplateRef<any>, value: any) {
    this.User = "Edit User Details";
    const apiUrl =
      this._global.baseAPIUrl +
      "Admin/GetDetails?ID=" +
      value.id +
      "&user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      var that = this;
      that._SingleUser = data;
      this.AddUserForm.patchValue({
        id: that._SingleUser.id,
        name: that._SingleUser.name,
        userid: that._SingleUser.userid,
        pwd: that._SingleUser.pwd,
        confirmPass: that._SingleUser.pwd,
        email: that._SingleUser.email,
        mobile: that._SingleUser.mobile,
        usetType: that._SingleUser.UsertypeID,
        roleName: that._SingleUser.sysRoleID ,
        //Added by komal
        usetLevel: that._SingleUser.UserLevel ?? '0'
      });
    });
    this.modalRef = this.modalService.show(template);
  }

  addUser(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    this.AddUserForm.patchValue({
      name: "",
      userid: "",
      pwd: "",
      confirmPass: "",
      email: "",
      userType: 0,
      roleName: 0,
      mobile: "",
      Remarks: "",  
      //Added by Komal
      usetLevel:0,
      id: "",
    });
    this.User = "Add User";
  }
  geEntityListByUserID(userid: number) {
    this.AddpasswordReset.get("id").setValue(userid);
  }

  get f() {
    return this.AddUserForm.controls;
  }

  entriesChange($event) {
    this.entries = $event.target.value;
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

  closePopup() {

  }

  showSuccessmessage(data: any) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: data,
    });
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
