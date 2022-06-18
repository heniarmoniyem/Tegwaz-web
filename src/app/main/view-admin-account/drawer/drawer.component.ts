import { AdminModel } from './../../../models/Admin.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { AdminAccountService } from 'src/app/services/admin-account.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.css'],
})
export class DrawerComponent implements OnInit {
  visible = false;
  admin: AdminModel;
  id: number;
  // @Input() name;

  // open(): void {
  //   this.visible = true;
  // }

  close(): void {
    this.visible = false;
    this.routes.navigate(['../'], { relativeTo: this.route });
  }
  constructor(
    private routes: Router,
    private route: ActivatedRoute,
    private adminService: AdminAccountService, //
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.adminService.checkAdmin() == 0) {
      this.routes.navigate(['../'], { relativeTo: this.route });
    } else {
      this.id = this.route.snapshot.params.id;
      this.admin = this.adminService.getAdmin(this.id);
      this.visible = true;
    }
    console.log(this.admin);
  }

  onDelete() {
    this.adminService.deleteAdmin(this.admin).then(() => {
      this.routes.navigate(['../'], { relativeTo: this.route });
      this.message.create(
        'success',
        `${this.admin.companyName.toUpperCase()} has been deleted successfully!!`
      );
    });
  }

  onEdit() {
    this.routes.navigate(['./../../update_Admin_Account/' + this.id], {
      relativeTo: this.route,
    });
  }
}
