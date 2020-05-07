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
  constructor(private authService: AuthService) { }

  ngOnInit() {
  }
  register(){
    this.authService.register(this.model)
          .subscribe(() => {
            console.log('Registration Successful');
          }, error => {
            console.log(error);
          });
  }
  cancel(){
    this.cancelRegister.emit(false);
    console.log('Cancelled');
  }
  toggleCheckBox(){
    this.checkStatus = !this.checkStatus;
  }
}
