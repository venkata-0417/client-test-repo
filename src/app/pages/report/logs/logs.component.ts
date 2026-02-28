import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpEventType, HttpClient } from '@angular/common/http';
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from '@angular/router';
import noUiSlider from "nouislider";
import { MessageService } from 'primeng/api';
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;
import Selectr from "mobius1-selectr";
import * as XLSX from 'xlsx';
import swal from "sweetalert2";
import { CommonService } from "src/app/Services/common.service";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-logs",
  templateUrl: "logs.component.html",
  styleUrls: ["logs.component.css"]
})
export class LogsComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  LogReportForm: FormGroup;
  _SingleDepartment: any;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _FilteredList: any;
  _StatusList: any;
  _HeaderList: any;
  _ColNameList = ["UserId", "Activity", "LogDate"];
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  first = 0;
  rows = 10;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private http: HttpClient,
    private httpService: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private _commonService: CommonService

  ) { }
  ngOnInit() {
    this.LogReportForm = this.formBuilder.group({
      DATEFROM: [""],
      DATETO: [""],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
      UserId: localStorage.getItem('UserID'),
    });

    this.getLogList();
  }

  entriesChange($event) {
    this.entries = $event.target.value;
  }

  onActivate(event) {
    this.activeRow = event.row;
  }

  OnReset() {
    this.Reset = true;
    this.LogReportForm.reset();
  }

  onSearch() {
    this.getLogList();
  }

  onDownload() {
    if (this.LogReportForm.controls['DATEFROM'].value === '' || this.LogReportForm.controls['DATEFROM'].value === null ||
      this.LogReportForm.controls['DATETO'].value === '' || this.LogReportForm.controls['DATETO'].value === null) {
      this.ShowErrormessage("Select a Date Range !!!");
    }
    else {
      this.exportToExcel(this.formattedData, 'UserLogReport');
      this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Downloaded', 'Activity Log Report').subscribe(
        (Res: any) => { });
      this.getLogList();
    }
  }


  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xls', type: 'array' });
    this.saveExcelFile(excelBuffer, fileName);
  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const excelFile: File = new File([data], `${fileName}.xlsx`, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = fileName + '.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }


  isValid() {
    return this.LogReportForm.valid
  }

  getLogList() {
    const apiUrl = this._global.baseAPIUrl + 'Report/GetLogDetails';
    this._onlineExamService.postData(this.LogReportForm.value, apiUrl)
      .subscribe(data => {
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._FilteredList, this._FilteredList);
      });
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      // { field: 'srNo', header: "Sr No", index: 1 },
      { field: 'UserName', header: 'User Name', index: 3 },
      { field: 'Action', header: 'Action', index: 2 },
      { field: 'Activity_Details', header: 'Action Details', index: 3 },
      { field: 'LogDate', header: 'Log Date', index: 3 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        // 'srNo': parseInt(index + 1),
        'UserName': el.UserId,
        'Action': el.Activity,
        'LogDate': this._commonService.formatLocalTime(el.LogDate),
        'Activity_Details': el.Activity_Details
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

