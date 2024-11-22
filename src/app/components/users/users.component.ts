import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../../services/user-service/user.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { User, UsersResponse } from '../../models/user.models';

import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  searchedUser: string = '';
  totalRecords: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  searchSubject: Subject<string> = new Subject<string>();

  constructor(
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchTerm: string) => {
        this.currentPage = 0;
        this.fetchUsers(searchTerm, this.currentPage);
      });

    this.fetchUsers();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchedUser);
  }

  fetchUsers(searchTerm: string = '', page: number = 0): void {
    const offset: number = page * this.pageSize;

    this.userService.getAllUsers(this.pageSize, offset, searchTerm).subscribe({
      next: (data: UsersResponse) => {
        this.users = data.users;
        this.totalRecords = data.total;
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.showError(error.error.message);
      },
    });
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage = event.page!;
    this.fetchUsers(this.searchedUser, this.currentPage);
  }

  onUserSelect(user: User): void {
    this.userService.selectedUser = user;
    this.router.navigate(['users', 'details']);
  }
}
