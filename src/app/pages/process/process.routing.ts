import { Routes } from "@angular/router";
import { DataEntryComponent } from './data-entry/data-entry.component';
import { FileTaggingComponent } from './file-tagging/file-tagging.component';
import { EditIndexingComponent } from './EditIndexing/EditIndexing.component';
import { CheckerComponent } from './checker/checker.component';
import { CodeVerificationComponent } from "./code-verification/code-verification.component";
import { ProjectDashboardScreenComponent } from "./project-dashboard-screen/project-dashboard-screen.component";
import { CodeBrowseComponent } from "./code-browse/code-browse.component";
import { PullCodeComponent } from "./pull-code/pull-code.component";
import { CodeReleaseComponent } from "./code-release/code-release.component";
import { CodeReleaseRequestComponent } from "./code-release-request/code-release-request.component";
import { CodeReleaseApproveComponent } from "./code-release-approve/code-release-approve.component";
import { CodeDownloadComponent } from "./code-download/code-download.component";




export const DepartmentRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "Maker",
        component: DataEntryComponent
      },
      {
        path: "tagging",
        component: FileTaggingComponent
      },
      {
        path: "EditIndexing",
        component: EditIndexingComponent
      },
      {
        path: "Checker",
        component: CheckerComponent
      },
      {
        path: "code-verification",
        component: CodeVerificationComponent
      },
      {
        path: "project-dashboard-screen",
        component: ProjectDashboardScreenComponent
      },
      {
        path: "code-browse",
        component: CodeBrowseComponent
      },
      {
        path: "pull-code",
        component: PullCodeComponent
      },
      {
        path: "code-release",
        component: CodeReleaseComponent
      },
      {
        path: "code-release-request",
        component: CodeReleaseRequestComponent
      },
      {
        path: "code-release-approve",
        component: CodeReleaseApproveComponent
      },
      {
        path: "code-download",
        component: CodeDownloadComponent
      }
    ]
  }
];
