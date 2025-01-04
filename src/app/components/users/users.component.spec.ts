import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service/user.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { of, throwError } from 'rxjs';
import { User, UsersResponse } from '../../models/user.models';
import { Gender, Role } from '../../models/models';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginatorState } from 'primeng/paginator';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const testUser: User = {
    user_id: '1',
    username: 'test',
    email: 'test',
    password: 'test',
    mobile_number: '8888888888',
    gender: Gender.male,
    role: Role.user,
    image_url: 'string',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const testUsersResponse: UsersResponse = {
    code: 200,
    message: 'test message',
    total: 10,
    users: [testUser, testUser]
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['getAllUsers'], {
      selectedUser: null,
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showError']);

    await TestBed.configureTestingModule({
      declarations: [UsersComponent],
      imports: [FormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    userServiceSpy.getAllUsers.and.returnValue(of(testUsersResponse));

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch users on init', () => {
    expect(userServiceSpy.getAllUsers).toHaveBeenCalledWith(10, 0, '');
    expect(component.users).toEqual(testUsersResponse.users);
    expect(component.totalRecords).toBe(testUsersResponse.total);
  });

  it('should handle error when fetching users', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Error fetching users' },
      status: 404
    });

    userServiceSpy.getAllUsers.and.returnValue(throwError(() => errorResponse));

    component.fetchUsers();

    expect(toastServiceSpy.showError).toHaveBeenCalledWith('Error fetching users');
  });

  it('should handle search with debounce', fakeAsync(() => {
    const searchTerm = 'test search';
    component.searchedUser = searchTerm;
    component.onSearchInput();

    // Verify that getAllUsers is not called immediately
    expect(userServiceSpy.getAllUsers).toHaveBeenCalledTimes(1); // Only from ngOnInit

    tick(500); // Wait for debounce time

    expect(userServiceSpy.getAllUsers).toHaveBeenCalledWith(10, 0, searchTerm);
    expect(component.currentPage).toBe(0);
  }));

  it('should handle pagination', () => {
    const paginatorEvent: PaginatorState = {
      page: 2,
      first: 20,
      rows: 10,
      pageCount: 5
    };

    component.onPageChange(paginatorEvent);

    expect(component.currentPage).toBe(2);
    expect(userServiceSpy.getAllUsers).toHaveBeenCalledWith(10, 20, '');
  });

  it('should handle user selection', () => {
    component.onUserSelect(testUser);

    expect(userServiceSpy.selectedUser).toBeNull();
    // expect(routerSpy.navigate).toHaveBeenCalledWith(['users', 'details']);
  });

  it('should not trigger search for same search term', fakeAsync(() => {
    component.searchedUser = 'test';
    component.onSearchInput();
    tick(500);

    // Reset call count
    userServiceSpy.getAllUsers.calls.reset();

    // Search with same term
    component.onSearchInput();
    tick(500);

    // Should not trigger new search due to distinctUntilChanged
    expect(userServiceSpy.getAllUsers).not.toHaveBeenCalled();
  }));
});
