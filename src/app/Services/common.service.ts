import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public hasRightListChanged: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public menuList: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private key = CryptoJS.enc.Utf8.parse('cZgTvjHFs9Bt6rynM2VxQ87E3DmdRUCN');
  private iv = CryptoJS.enc.Utf8.parse('pnjMzUTvtDZYbBEe');
  private message: string = '';

  constructor() { }

  setRightList(rightList: any): void {
    this.hasRightListChanged.next(rightList);
  }

  getMenuAccess() {
    return this.menuList;
  }

  setMenuAccess(menu: any) {
    this.menuList.next(menu);
  }

  decrypt(encryptedText: string): any {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  }

  decryptdata(encryptedText: string): any {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedString;
  }

  encryptData(data: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  setMessage(msg: string) {
    this.message = msg;
  }

  getMessage(): string {
    const temp = this.message;
    this.message = '';
    return temp;
  }

  // formatLocalTime(utcTime: string): string {
  //   if (!utcTime) return '';

  //   try {
  //     const [datePart, timePart, meridian] = utcTime.split(' ');
  //     const [month, day, year] = datePart.split('/');
  //     let [hour, minute, second] = timePart.split(':').map(Number);

  //     // Convert 12-hour to 24-hour format
  //     if (meridian === 'PM' && hour < 12) hour += 12;
  //     if (meridian === 'AM' && hour === 12) hour = 0;

  //     // Build ISO string and parse as UTC
  //     // const isoString = `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}Z`;
  //     const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}Z`;
  //     const localDate = new Date(isoString);

  //     if (isNaN(localDate.getTime())) return 'Invalid date';

  //     // Format output manually: DD-MM-YYYY HH:mm:ss
  //     const dd = String(localDate.getDate()).padStart(2, '0');
  //     const mm = String(localDate.getMonth() + 1).padStart(2, '0');
  //     const yyyy = localDate.getFullYear();

  //     const hh = String(localDate.getHours()).padStart(2, '0');
  //     const min = String(localDate.getMinutes()).padStart(2, '0');

  //     return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  //   } catch {
  //     return 'Invalid date';
  //   }
  // }
  
  formatLocalTime(utcTime: string): string {
    if (!utcTime) return '';

    try {
      const [datePart, timePart, meridian] = utcTime.split(' ');
      let year, month, day;

      if (datePart.includes('/')) {
        // MM/DD/YYYY
        [month, day, year] = datePart.split('/');
      } else if (datePart.includes('-')) {
        // DD-MM-YYYY
        [day, month, year] = datePart.split('-');
      } else {
        return 'Invalid date';
      }

      let [hour, minute, second] = timePart.split(':').map(Number);

      // Convert 12-hour to 24-hour format
      if (meridian === 'PM' && hour < 12) hour += 12;
      if (meridian === 'AM' && hour === 12) hour = 0;

      // Build ISO string and parse as UTC
      const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}Z`;
      const localDate = new Date(isoString);

      if (isNaN(localDate.getTime())) return 'Invalid date';

      // Format output manually: DD-MM-YYYY HH:mm
      const dd = String(localDate.getDate()).padStart(2, '0');
      const mm = String(localDate.getMonth() + 1).padStart(2, '0');
      const yyyy = localDate.getFullYear();

      const hh = String(localDate.getHours()).padStart(2, '0');
      const min = String(localDate.getMinutes()).padStart(2, '0');

      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch {
      return 'Invalid date';
    }
  }
}
