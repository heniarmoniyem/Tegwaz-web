import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { take, exhaustMap } from 'rxjs/operators';
import { Auth } from '../services/auth.service';

@Injectable()
export class AuthInterceptor {
  constructor(private auth: Auth) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.auth.user.pipe(
      take(1),
      exhaustMap((user) => {
        if (!user) {
          return next.handle(req);
        }
        console.log('params working');
        console.log(user.Token!);
        const modifiedReq = req.clone({
          params: req.params.set('auth', user.Token!),
        });
        return next.handle(modifiedReq);
      })
    );
  }
}
