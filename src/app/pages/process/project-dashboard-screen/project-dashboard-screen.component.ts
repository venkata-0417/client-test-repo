import { Component, OnInit } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import dataviz from "@amcharts/amcharts4/themes/dataviz";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
am4core.useTheme(am4themes_animated);
import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Router } from '@angular/router';
am4core.useTheme(dataviz);
am4core.useTheme(am4themes_animated);
import * as XLSX from "xlsx";
import { Chart } from 'chart.js';
import { CommonService } from 'src/app/Services/common.service';


@Component({
  selector: 'app-project-dashboard-screen',
  templateUrl: './project-dashboard-screen.component.html',
  styleUrls: ['./project-dashboard-screen.component.scss']
})

export class ProjectDashboardScreenComponent implements OnInit {
  ProjectDashboardForm: FormGroup;
  private _FilteredList: any;
  selected: any;
  activeRow: any;
  RoleForm: any;
  first: any = 0;
  totalSpaceInGB: any;
  //-----------------------------------------------------
  _RList = []
  _DownloadBtn: any = false;
  //-----------------------------------------------------
  rows: any;
  chartData: any;
  data: any;
  chartOptions: any;
  ProjectName: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  Beneficiary: any;
  Depository: any;
  CrownUser: any;
  RemainingSpaceInGB: any;
  UsedSizeInGB: any;
  _FilteredList_FU: any;

  constructor(private fb: FormBuilder,
    private router: Router,
    private _onlineExamService: OnlineExamServiceService,
    private _commonService: CommonService,
    private _global: Globalconstants,

  ) { }
  ngOnInit(): void {
    this.ProjectDashboardForm = this.fb.group({
      PID: [''],
      project_id: [''],
      ProjectName: [''],

      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CodePull_by: localStorage.getItem("UserID"),
      CreatedBy: localStorage.getItem("UserID"),
      Status: ['']
    });

    let _PID = localStorage.getItem('_PID');

    if (Number(_PID) > 0) {
      this.ProjectDashboardForm.controls['PID'].setValue(localStorage.getItem('_PID'));
      this.ProjectDashboardForm.controls['project_id'].setValue(localStorage.getItem('_PID'));
    }

    this.GetProjectDetails();
    this.GetProjectUserDetails();
    this.getProjectFileUploadDetails();
    this.getRightList();
  }


  getRightList() {
    const apiUrl =
      this._global.baseAPIUrl + "Role/PermissionListForTabs?UserID=" + localStorage.getItem('UserID') + "&ProjectID=" + this.ProjectDashboardForm.controls['PID'].value + "&user_Token=" + localStorage.getItem('User_Token')
    this._onlineExamService.getAllData(apiUrl).subscribe((data: []) => {
      this._RList = data;
      this._commonService.setRightList(this._RList);
      this.PermissionListForTabs();
    });
  }

  PermissionListForTabs() {
    if (localStorage.getItem("sysRoleID") === "1") {
      this._DownloadBtn = true;
    }
    else {
      this._commonService.hasRightListChanged.subscribe(res => {
        if (res) {
          this._DownloadBtn = res.filter(el => el.page_right === 'Download Details')[0].isChecked ? true : false;
        }
      });
    }
  }

  GetProjectDetails() {
    const apiUrl = this._global.baseAPIUrl + 'Master/getProjectDetails?ProjectID=' + this.ProjectDashboardForm.controls['project_id'].value + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      let PStatus = data[0].ISACTIVE == "Y" ? "Active" : "In-Active";
      this.ProjectDashboardForm.controls['ProjectName'].setValue(data[0].ProjectName);
      this.ProjectName = data[0].ProjectName;
      this.StartDate = data[0].StartDate;
      this.EndDate = data[0].EndDate;
      this.Status = PStatus;
      this.UsedSizeInGB = data[0].UsedSizeInGB;
      this.RemainingSpaceInGB = data[0].RemainingSpaceInGB;
      this.LoadChart();
    });
  }

  GetProjectUserDetails() {
    let beneficiaryCount = 0;
    let depositoryCount = 0;
    let crownUserCount = 0;

    const apiUrl = this._global.baseAPIUrl + 'Master/getProjectUserDetails?ProjectID=' + this.ProjectDashboardForm.controls['project_id'].value + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._FilteredList = data;

      this._FilteredList.forEach((item: any) => {
        if (item.Usertype === 'Beneficiary') {
          beneficiaryCount++;
        } else if (item.Usertype === 'Depository') {
          depositoryCount++;
        } else if (item.Usertype === 'CrownUser') {
          crownUserCount++;
        }
      });

      this.Beneficiary = beneficiaryCount;
      this.Depository = depositoryCount;
      this.CrownUser = crownUserCount;
      this.prepareTableData(this._FilteredList, this._FilteredList);
    });
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'Username', header: 'User Name', index: 3 },
      { field: 'ROLENAME', header: 'Role', index: 2 },
      { field: 'Usertype', header: 'User Type', index: 2 },
      { field: 'PERMISSIONNAME', header: 'Permission', index: 2 },
      { field: 'CREATIONDATE', header: 'Created Date', index: 2 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        'Username': el.Username,
        'ROLENAME': el.ROLENAME,
        'PERMISSIONNAME': el.PERMISSIONNAME,
        'CREATIONDATE': this._commonService.formatLocalTime(el.CREATIONDATE),
        'Usertype': el.Usertype,
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

  getProjectFileUploadDetails() {
    const apiUrl = this._global.baseAPIUrl + 'Master/getProjectFileUploadDetails?ProjectID=' + this.ProjectDashboardForm.controls['project_id'].value + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._FilteredList_FU = data;
      this.prepareTableDataForPermissions(this._FilteredList_FU, this._FilteredList_FU);
    });
  }

  formattedDataForPermissions: any = [];
  headerListForPermissions: any;
  immutableFormattedDataForPermissions: any;
  prepareTableDataForPermissions(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      // { field: 'srNo', header: "Sr No", index: 1 },
      { field: 'File_Name', header: 'File Name', index: 3 },
      { field: 'FileSize', header: 'File Size', index: 2 },
      { field: 'Version', header: 'Version', index: 2 },
      { field: 'UploadType', header: 'Upload Type', index: 2 },
      { field: 'Upload_By', header: 'Upload By', index: 2 },
      { field: 'Upload_Date', header: 'Upload Date', index: 2 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        // 'srNo': parseInt(index + 1),
        'Upload_Date': this._commonService.formatLocalTime(el.Upload_Date),
        'File_Name': el.File_Name,
        'Version': el.Version,
        'Upload_By': el.Upload_By,
        'UploadType': el.UploadType,
        'project_id': el.project_id,
        'ID': el.ID,
        'FileSize': `${parseFloat(Number(el.FileSize).toFixed(3))} MB`,
      });

    });
    this.headerListForPermissions = tableHeader;
    this.immutableFormattedDataForPermissions = JSON.parse(JSON.stringify(formattedData));
    this.formattedDataForPermissions = formattedData;
    this.loading = false;
  }


  SourceValidator(_projectfileL: any) {
    this.router.navigate(["/process/code-browse"]);
    localStorage.setItem('_PID', _projectfileL.project_id);
    localStorage.setItem('_FileID', _projectfileL.ID);
    localStorage.setItem('_Version', _projectfileL.Version);
  }

  searchTableForPermissions($event) {

    let val = $event.target.value.trim();

    if (!val) {
      this.formattedDataForPermissions = this.immutableFormattedDataForPermissions;
      return;
    }

    const keywords = val.split(",").map(x => x.trim().toLowerCase());

    this.formattedDataForPermissions = this.immutableFormattedDataForPermissions.filter((row: any) =>
      Object.values(row).some((field: any) =>
        keywords.some(k =>
          field && field.toString().toLowerCase().includes(k)
        )
      )
    );
  }


  LoadChart() {

    this.UsedSizeInGB = parseFloat(this.UsedSizeInGB.toFixed(3));
    this.RemainingSpaceInGB = parseFloat(this.RemainingSpaceInGB.toFixed(3));
    const totalSpaceInGB = this.UsedSizeInGB + this.RemainingSpaceInGB;

    this.chartData = {
      labels: ['Used Space', 'Available Space'],
      datasets: [
        {
          data: [this.UsedSizeInGB, this.RemainingSpaceInGB],
          backgroundColor: ['#0A424A', '#00d480'],
          hoverBackgroundColor: ['#B3BCC4', '#B3BCC4']
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom', // Position the legend below the chart
          labels: {
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels && data.datasets[0].data) {
                return data.labels.map((label, index) => {
                  const value = data.datasets[0].data[index];
                  return {
                    text: `${label}: ${value} GB`, // Combine label and value
                    fillStyle: data.datasets[0].backgroundColor[index], // Use the background color
                    hidden: false, // Set to true if you want to hide
                    index: index // Required to handle click events
                  };
                });
              }
              return [];
            },
            font: {
              size: 14 // Customize font size
            },
            color: '#000' // Customize font color
          }
        },
        tooltip: {
          enabled: true,
          callbacks: {
            // Custom callback to show percentage in tooltips
            label: (context) => {
              const value = context.raw; // Get the data value
              const percentage = ((value / totalSpaceInGB) * 100).toFixed(2); // Calculate percentage
              return `${context.label}: ${percentage}% (${value} GB)`;
            }
          }
        }
      }
    };
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) {
    this.activeRow = event.row;
  }

  onDownloadExcelFile(_filename: string) {
    if (_filename === "Project User List") {
      this.exportToExcel(this.formattedData, _filename);

      this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Downloaded Project User List', this.ProjectName).subscribe(
        (Res: any) => { });
    }
    else if (_filename === "Project File List") {
      this.exportToExcel(this.formattedDataForPermissions, _filename);

      this._onlineExamService.Log_Report(localStorage.getItem('UserID'), 'Downloaded Project File List', this.ProjectName).subscribe(
        (Res: any) => { });
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

  onBack() {
    localStorage.removeItem('_PID');
    this.router.navigate(['/process/code-verification']);
  }

}
