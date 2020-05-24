import { Pagination, PaginatedResult } from './../_models/pagination';
import { AuthService } from './../_services/auth.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../_models/User';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  users: User[];
  pagination: Pagination;
  likesParam: string;
  
  constructor(private userService: UserService, private authService: AuthService,
              private alertify: AlertifyService, private route: ActivatedRoute) { }


  ngOnInit() {
    this.route.data.subscribe(data => {
      this.users = data.users.result;
      this.pagination = data.users.pagination;
    });
    this.likesParam = 'likers';
  }
  pageChanged(event: any){
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }
  loadUsers(){
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, null, this.likesParam)
      .subscribe(
        (results: PaginatedResult<User[]>) => {
        this.users = results.result;
        this.pagination = results.pagination;
      }, error => {
        this.alertify.error(error);
      });
  }

}
