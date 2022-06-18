import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private message: NzMessageService) {}

  createMessage(type: string, message: string) {
    this.message.create(type, message);
  }
}
