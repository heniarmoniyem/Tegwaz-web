import { MemoryService } from './../../services/memory.service';
import { ImageUploadingService } from './../../services/image-uploading.service';
import { AdminModel } from './../../models/Admin.model';
import { AdminAccountService } from './../../services/admin-account.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, ActivatedRoute } from '@angular/router';
// import { subscribeOn } from 'rxjs/operators';
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { NzUploadFile } from 'ng-zorro-antd/upload';

// import {  } from "module";

function getBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

@Component({
  selector: 'app-create-admin',
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.css'],
})
export class CreateAdminComponent implements OnInit {
  form!: FormGroup;
  inputValue?: string;
  options: string[] = [];
  isLoading = false;
  editMode = false;
  onEditAdmin: AdminModel;
  selectedImage: any;
  imagePreviewUrl: string;

  fileList: NzUploadFile[] = [];
  previewImage: string | undefined = '';
  previewVisible = false;

  handlePreview = async (file: NzUploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file.preview;
    this.previewVisible = true;
    console.log(file);
  }

  onInput(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    if (!value || value.indexOf('@') >= 0) {
      this.options = [];
    } else {
      this.options = ['gmail.com', 'yahoo.com', 'lycos.com'].map(
        (domain) => `${value}@${domain}`
      );
    }
  }

  private successMethod(message: string, url: string) {
    this.message.create('success', message);
    this.routes.navigate([url], {
      relativeTo: this.route,
    });
  }

  // preview(event: any) {
  //   if (event.target.files && event.target.files[0]) {
  //     const reader = new FileReader();
  //     // reader.onload = (e: any) => (this.imgSrc = e.target.result);
  //     reader.readAsDataURL(event.target.files[0]);
  //     this.selectedImage = event.target.files[0];
  //     console.log(this.selectedImage);
  //     if (
  //       this.selectedImage.type != 'image/jpeg' &&
  //       this.selectedImage.type != 'image/png'
  //     ) {
  //       this.selectedImage = null;
  //       this.form.patchValue({ url: null });
  //       this.message.create(
  //         'error',
  //         'ERROR: please choose supported file types - jpeg, png'
  //       );
  //     }
  //   }
  //   // console.log(this.selectedImage);
  // }

  submitForm(): void {
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (this.form.valid) {
      this.isLoading = true;
      if (this.editMode) {
        if (this.fileList.length == 0) {
          this.onEditAdmin.companyName = this.form.value.companyName;
          this.onEditAdmin.username = this.form.value.username;
          this.onEditAdmin.website = this.form.value.website;
          this.onEditAdmin.headOffice = this.form.value.headOffice;
          this.onEditAdmin.phoneNumber = this.form.value.phoneNumber;
          const key = this.onEditAdmin.key!;
          this.onEditAdmin.key = '';
          this.adminService.updateAdmin(this.onEditAdmin, key).then(() => {
            this.successMethod(
              `${this.onEditAdmin.companyName} - Admin Account successfully Updated`,
              '../../view_Admin_Account'
            );
            this.isLoading = false;
          });
        } else if (
          this.fileList[0].type != 'image/jpeg' &&
          this.fileList[0].type != 'image/png'
        ) {
          this.fileList.pop();
          this.message.create(
            'error',
            'ERROR: please choose supported file types - jpeg, png'
          );
          this.isLoading = false;
        } else {
          this.ips
            .uploadImage(this.fileList[0].originFileObj)
            .then((res: string) => {
              this.onEditAdmin.companyName = this.form.value.companyName;
              this.onEditAdmin.username = this.form.value.username;
              this.onEditAdmin.website = this.form.value.website
                ? this.form.value.website
                : ' - ';
              this.onEditAdmin.headOffice = this.form.value.headOffice;
              this.onEditAdmin.phoneNumber = this.form.value.phoneNumber;
              this.onEditAdmin.logoUrl = res;
              const key = this.onEditAdmin.key!;
              this.onEditAdmin.key = '';
              this.adminService.updateAdmin(this.onEditAdmin, key).then(() => {
                this.successMethod(
                  `${this.onEditAdmin.companyName} - Admin Account successfully Updated`,
                  '../../view_Admin_Account'
                );
                this.isLoading = false;
              });
            });
        }
      } else {
        if (this.fileList.length == 0) {
          this.message.create('error', 'ERROR: please choose COMPANY LOGO!!');
          this.isLoading = false;
        } else if (
          this.fileList[0].type != 'image/jpeg' &&
          this.fileList[0].type != 'image/png'
        ) {
          this.fileList.pop();
          this.message.create(
            'error',
            'ERROR: please choose supported file types - jpeg, png'
          );
          this.isLoading = false;
        } else {
          this.ips
            .uploadImage(this.fileList[0].originFileObj)
            .then((res: string) => {
              const companyName = this.form.value.companyName;
              const username = this.form.value.username;
              const password = this.form.value.password;
              const email = this.form.value.email;
              const website = this.form.value.website;
              const headOffice = this.form.value.headOffice;
              const phoneNumber = this.form.value.phoneNumber;
              const regDate = new Date().toUTCString();
              const logoUrl = res;
              const admin = new AdminModel(
                companyName,
                username,
                password,
                email,
                website,
                headOffice,
                phoneNumber,
                regDate,
                logoUrl
              );
              this.adminService.addAdmin(admin).subscribe(
                () => {
                  this.isLoading = false;
                  this.form.reset();
                  this.successMethod(
                    `Admin Account created successfully for ${companyName}`,
                    '../view_Admin_Account'
                  );
                },
                (error) => {
                  this.isLoading = false;
                  this.form.patchValue({ email: '' });
                  this.message.create('error', error);
                }
              );
            });
        }
      }
    }
  }

  resetForm() {
    this.form.reset();
  }

  constructor(
    private fb: FormBuilder,
    private adminService: AdminAccountService,
    private message: NzMessageService,
    private routes: Router,
    private route: ActivatedRoute,
    private ips: ImageUploadingService,
    private memory: MemoryService
  ) {}

  ngOnInit(): void {
    if (this.memory.getRole() != 'Super Admin') {
      this.routes.navigate(['../page-not-found']);
    }

    const id = this.route.snapshot.params.id;
    if (id) {
      if (!this.adminService.checkAdmin() && !this.adminService.getAdmin(id)) {
        this.message.create('error', 'Invalid Url');
        this.routes.navigate(['../../view_Admin_Account'], {
          relativeTo: this.route,
        });
      } else {
        this.onEditAdmin = this.adminService.getAdmin(id);
        this.editMode = true;
        // this.form.patchValue({
        //   companyName: this.onEditAdmin.companyName,
        //   username: this.onEditAdmin.username,
        //   website: this.onEditAdmin.website,
        //   headOffice: this.onEditAdmin.headOffice,
        //   phoneNumber: this.onEditAdmin.phoneNumber,
        // });
        this.form = this.fb.group({
          companyName: [this.onEditAdmin.companyName, [Validators.required]],
          username: [this.onEditAdmin.username, [Validators.required]],
          // password: [null, [Validators.required, Validators.minLength(6)]],
          // email: [null, [Validators.required, Validators.email]],
          website: [this.onEditAdmin.website, [Validators.required]],
          headOffice: [this.onEditAdmin.headOffice, [Validators.required]],
          phoneNumber: [
            this.onEditAdmin.phoneNumber,
            [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(10),
            ],
          ],
          // url: [null, [Validators.required]],
        });
        this.imagePreviewUrl = this.onEditAdmin.logoUrl;
      }
    } else {
      this.form = this.fb.group({
        companyName: [null, [Validators.required]],
        username: [null, [Validators.required]],
        password: [null, [Validators.required, Validators.minLength(6)]],
        email: [null, [Validators.required, Validators.email]],
        website: [null],
        headOffice: ['', [Validators.required]],
        phoneNumber: [null, [Validators.required, Validators.maxLength(10)]],
        // url: [null, [Validators.required]],
      });
    }
  }
}
