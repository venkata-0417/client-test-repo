import { Injectable } from '@angular/core';
// import { IGame } from '../Interface/drop-down-list';
import { Listboxclass } from '../Helper/listboxclass';
import { Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, tap, map, filter } from 'rxjs/operators';
import { Globalconstants } from '../Helper/globalconstants';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })//,

};
@Injectable({
  providedIn: 'root'
})
export class OnlineExamServiceService {
  urlWeb = this._Url.baseAPIUrl + '';
  allNotifications: Notification[];
  private rolesChanged = new BehaviorSubject(new Date().getTime());
  isRoleChanged = this.rolesChanged.asObservable();

  private eventSource: EventSource | null = null;
  private reloadNavbarSource = new Subject<void>();
  reloadNavbar$ = this.reloadNavbarSource.asObservable();


  constructor(private http: HttpClient,
    private _global: Listboxclass,
    private _Url: Globalconstants,
    private router: Router

  ) {
    // Initialize inactivity/time-out service
    // this.setupInactivityService();
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }

    return throwError(error);
  }


  getAllData(apiUrl: string): Observable<any> {
    ``
    return this.http.get(apiUrl).pipe(
      map(this.extractData));
  }

  DLoadFile(apiUrl: string): Observable<any> {
    return this.http.get(apiUrl, httpOptions).pipe(
      map(this.extractData));
  }

  public DownloadFile(): string {
    let ObjectRef: Object = {};
    return 'http://localhost:50819/Temp/';
  }

  getAllDataWithFormValue(data, apiUrl): Observable<any> {
    return this.http.post(apiUrl, data, httpOptions).pipe(
      map(this.extractData));
  }

  getDropDownData(apiUrl: string): Observable<Listboxclass> {
    return this.http.get<Listboxclass>(apiUrl).pipe(map(res => this._global = res));

    //(this.notificationsUrl).pipe(map(res => this.allNotifications = res))
  }

  public getProducts(apiUrl: string): Observable<Listboxclass[]> {
    return this.http.get<Listboxclass[]>(apiUrl);
  }

  private extractData(res: Response) {
    let body = res;
    //console.log(res);

    return body || {};
  }

  getDataById(apiUrl: string): Observable<any> {
    return this.http.get(apiUrl).pipe(
      map(this.extractData));
  }

  postData(data, apiUrl): Observable<any> {
    return this.http.post(apiUrl, data, httpOptions)
      .pipe(
        catchError(this.handleError),
        map(this.extractData)
      );
  }

  postDataForPDFs(data: any, apiUrl: string): Observable<any> {
    // If FormData, do NOT pass httpOptions
    return this.http.post(apiUrl, data).pipe(
      catchError(this.handleError),
      map(this.extractData)
    );
  }

  roleChanged() {
    this.rolesChanged.next(new Date().getTime());
  }

  updateData(data, apiUrl): Observable<any> {
    return this.http.post(apiUrl, data, httpOptions)
      .pipe(
        catchError(this.handleError),
        map(this.extractData)
      );
  }
  deleteData(apiUrl: string): Observable<any> {
    return this.http.get(apiUrl).pipe(
      map(this.extractData));
  }

  public download_test(data, apiUrl: string): Observable<Blob> {

    const headers = new HttpHeaders().set('content-type', 'multipart/form-data');

    return this.http.post(apiUrl, data, { headers, responseType: 'blob' });
  }

  public downloadDoc(apiUrl: string): Observable<any> {
    return this.http.get(apiUrl, { responseType: "blob" });
  }

  DownloadpostData(data, apiUrl): Observable<any> {
    return this.http.get(apiUrl, { responseType: "blob" });
  }

  public BulkDownload(data, apiUrl): Observable<any> {
    return this.http.post(apiUrl, data, { responseType: "blob" })
  }

  public DownloadPDF(data, apiUrl): Observable<any> {
    return this.http.post(apiUrl, data, { responseType: "blob" })
  }

  public viewPDF(apiUrl: string): Observable<Blob> {
    return this.http.get(apiUrl, { responseType: 'blob' });
  }

  Log_Report(UserID: any, Activity: any, Activity_Details: any) {

    let data = {
      UserID: UserID,
      Activity: Activity,
      Activity_Details: Activity_Details
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    headers.set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    return this.http.post(this.urlWeb + 'UserLogin/LogReport', data, { headers: headers });
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------//

  private keyupListener: EventListener;
  private keydownListener: EventListener;
  private visibilityChangeListener: EventListener;
  private blurListener: EventListener;
  private clickListener: EventListener;
  private isShiftPressed: boolean = false;
  private isWinPressed: boolean = false;

  preventScreenshots() {
    this.keyupListener = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        this.isShiftPressed = true;
      }

      if (event.key === 'Meta' || event.code === "MetaLeft" || event.code === "MetaRight") {
        this.isWinPressed = true;
        this.hideSensitiveContent();
      }

      if (event.code === 'PrintScreen' || event.key === 'F14' || event.keyCode === 44 || event.key === 'PrintScreen') {
        this.hideSensitiveContent();
      } else if (this.isShiftPressed && this.isWinPressed && event.key === 'S') {
        this.hideSensitiveContent();
      }
    };
    window.addEventListener('keyup', this.keyupListener);
    window.addEventListener('keydown', this.keydownListener);

    this.visibilityChangeListener = () => {
      if (document.visibilityState === 'hidden') {
        console.warn('Screen recording or screenshot attempt detected!');
        this.hideSensitiveContentForBlur();
      } else {
        console.warn('Window is visible again');
        this.showSensitiveContent();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeListener);

    this.blurListener = () => {
      this.hideSensitiveContentForBlur();
    };
    window.addEventListener('blur', this.blurListener);

    this.clickListener = () => {
      this.showSensitiveContent();
    };
    window.addEventListener('click', this.clickListener);
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

  cleanup() {
    window.removeEventListener('keyup', this.keyupListener);
    window.removeEventListener('keydown', this.keydownListener);
    document.removeEventListener('visibilitychange', this.visibilityChangeListener);
    window.removeEventListener('blur', this.blurListener);
    window.removeEventListener('click', this.clickListener);

    const message = document.getElementById('return-message');
    if (message) {
      message.remove();
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------//

  setupInactivityService() {
    const inactivityTimeout = 300000;
    let inactivityTimer = null;

    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      inactivityTimer = setTimeout(() => {
        this.logoutUser();
      }, inactivityTimeout);
    };

    // Listen for mouse movement and key presses
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);

    resetInactivityTimer();
  }

  logoutUser() {
    const userId = localStorage.getItem('UserID');
    const userToken = localStorage.getItem('User_Token');

    if (userId && userToken) {
      const apiUrl = `${this._Url.baseAPIUrl}UserLogin/Logout?UserID=${userId}&user_Token=${userToken}`;

      this.getAllData(apiUrl).subscribe(
        (data) => {
          console.log("logout", data);
          localStorage.clear();
          this.router.navigate(['/Login']);
        });
    } else {
      console.warn('User not logged in or missing token.');
      localStorage.clear();
      this.router.navigate(['/Login']);
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------//

  public startSSE(userId: number, userToken: string): Observable<any> {
    return new Observable(observer => {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource(`${this.urlWeb}Master/UnreadNotifications?user_Token=${userToken}&UserID=${userId}`);

      this.eventSource.onmessage = (event) => {
        try {
          const notifications = JSON.parse(event.data);
          observer.next(notifications);
        } catch (error) {
          observer.error("Invalid JSON format received from SSE.");
        }
      };

      this.eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        observer.error(error);

        setTimeout(() => {
          this.startSSE(userId, userToken).subscribe(observer);
        }, 5000);
      };

      return () => {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
      };
    });
  }

   getPdfapiUrl(projectName: string, fileName: string): Observable<Blob> {
    const apiUrl = `${this._Url.baseAPIUrl}Master/GetPdf`;

    const params = new HttpParams()
    .set('projectName', projectName)
      .set('path', fileName);

    return this.http.get(apiUrl, {
      params: params,
      responseType: 'blob'
    });
  }

  triggerReload() {
    this.reloadNavbarSource.next();
  }
}
