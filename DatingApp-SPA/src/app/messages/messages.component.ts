import { User } from './../_models/user';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from './../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';

import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination, PaginatedResult } from './../_models/pagination';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
 messages: Message[];
 pagination: Pagination;
 messageContainer: any;
  constructor(private userService: UserService, private authService: AuthService, private alertify: AlertifyService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data.messages.result;
      this.pagination = data.messages.pagination;

    });
  }
  loadMessages(){
    this.userService.getMessages(this.authService.decodedToken.nameid, this.pagination.currentPage,
      this.pagination.itemsPerPage, this.messageContainer)
        .subscribe((res: PaginatedResult<Message[]>) => {
          this.messages = res.result;
          this.pagination = res.pagination;
        }, error => {
          this.alertify.error(error);
        });
  }
  deleteMessage(id: number){
    this.alertify.confirm('Are you sure you wish to delete this message ?', () => {
      this.userService.deleteMessage(id, this.authService.decodedToken.nameid)
        .subscribe(() => {
          this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
          this.alertify.success('Message has been deleted successfully');
        }, error => {
          this.alertify.error(error);
        });
    });
    return false;
  }
  pageChanged(event: any): void{
    this.pagination.currentPage = event.currentPage;
    this.loadMessages();
  }
}
