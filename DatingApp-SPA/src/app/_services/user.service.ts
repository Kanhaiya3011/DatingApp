import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../_models/User';
import { PaginatedResult } from '../_models/pagination';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
baseUrl = environment.apiUrl;
constructor(private http: HttpClient) { }

getUsers(page?, itemsPerPage?, userParams?): Observable<PaginatedResult<User[]>> {
  const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();

  let params = new HttpParams();

  if (page != null && itemsPerPage != null) {
    params = params.append('pageNumber', page);
    params = params.append('pageSize', itemsPerPage);
  }

  if (userParams != null) {
    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
  }

  // if (likesParam === 'Likers') {
  //   params = params.append('Likers', 'true');
  // }

  // if (likesParam === 'Likees') {
  //   params = params.append('Likees', 'true');
  // }
  const headers = new Headers();
  headers.append('Access-Control-Allow-Headers', 'Content-Type');
  headers.append('Access-Control-Allow-Methods', 'GET');
  headers.append('Access-Control-Allow-Origin', '*');

  return this.http.get<User[]>(this.baseUrl + 'users', { observe: 'response', params})
    .pipe(
      map(response => {
        paginatedResult.result = response.body;
        const myHeaders = response.headers;
        if (response.headers.get('Pagination') != null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
  // this.http.get<User[]>(this.baseUrl + 'users', { observe: 'response', params})
  // .subscribe(response => {
  //   paginatedResult.result = response.body;
  //   if (response.headers.get('Pagination') != null) {
  //              paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
  //     }
  //   alert(JSON.stringify(paginatedResult.pagination));
  // });

}

getUser(id: number): Observable<User> {
  return this.http.get<User>(this.baseUrl + 'users/' + id);
  }

updateUser(id: number, user: User) {
    return this.http.put<User>(this.baseUrl + 'users/' + id, user);
    }

setMainPhoto(userId: number, id: number){
      return this.http.post(
        this.baseUrl + 'users/' + userId + '/photos/' + id + '/setMain',
      {});
  }
  deletePhoto(userId: number, id: number){
    return this.http.delete(this.baseUrl + 'users/' + userId + '/photos/' + id);
  }
}
