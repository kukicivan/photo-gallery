import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';

export interface PhotoStore {
  filepath: string;
  webviewPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: PhotoStore[] = [];

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor() {
  }

  public async addNewToGallery() {
    // Take a photo
    const photoOption = {
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    };
    const capturedPhoto = await Camera.getPhoto(photoOption);

    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

  }

  private async savePicture(cameraPhoto: any): Promise<PhotoStore> {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);


    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    console.log('savedFile', savedFile);

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    const inMemory = {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    };

    return inMemory;
  }

  private async readAsBase64(cameraPhoto: any) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto?.webPath);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

}
