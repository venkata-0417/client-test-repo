import { Component, OnInit,TemplateRef } from "@angular/core";

import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import { DxiConstantLineModule } from "devextreme-angular/ui/nested";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  providers: [BsModalService,MessageService]
})
export class ConfigurationComponent implements OnInit {
  SFTPform: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router) { 
  }

  ngOnInit(): void {
    this.SFTPform = this.formBuilder.group(
    {
      _PID: ["", Validators.required],
      _ProjectName: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      user_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID")
    }
  )
    let _PID = localStorage.getItem('_PID');

    if (Number(_PID) > 0) {
      this.SFTPform.controls['_PID'].setValue(localStorage.getItem('_PID'));
      this.SFTPform.controls['_ProjectName'].setValue(localStorage.getItem('_ProjectName'));
    }
  }

  NavigateToGitSelection(){
    this.router.navigate(['/master/git-selection']);
  }

  NavigateToGitLabSelection(){
    this.router.navigate(['/master/git-lab-selection'])
  }

  NavigateToSFTPSelection(){
    this.router.navigate(['/master/sftp-selection'])
  }

  OnBack(){
    localStorage.removeItem('_PID');
    localStorage.removeItem('_ProjectName');
    this.router.navigate(['/master/Project']);
  }
}
