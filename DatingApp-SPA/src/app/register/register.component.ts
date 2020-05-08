import { AlertifyService } from './../_services/alertify.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  model: any = {};
  checkStatus = true;
  constructor(private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit() {
  }
  register(){
    this.authService.register(this.model)
          .subscribe(() => {
            this.alertify.success('Registration Successful');
          }, error => {
            this.alertify.error(error);
          });
  }
  cancel(){
    this.cancelRegister.emit(false);
    this.alertify.message('Cancelled');
  }
  toggleCheckBox(){
    this.checkStatus = !this.checkStatus;
  }
}
