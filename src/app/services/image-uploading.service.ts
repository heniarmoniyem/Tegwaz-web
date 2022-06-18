import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { promise } from 'protractor';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadingService {
  selectedImage = null;
  returnImageUrl: string;
  constructor(private storage: AngularFireStorage) {}

  uploadImage(selectedImage: any): any {
    return new Promise((resolve, reject) => {
      var filePath = `${'Company-Logo'}/${selectedImage.name
        .split('.')
        .slice(0, -1)
        .join('.')}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      this.storage
        .upload(filePath, selectedImage)
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              console.log(url);
              resolve(url);
            });
          })
        )
        .subscribe();
    });
  }
}
