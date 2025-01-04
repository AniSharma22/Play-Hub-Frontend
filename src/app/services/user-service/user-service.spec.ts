import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User, UserResponse, UsersResponse } from '../../models/user.models';
import { Gender, Role } from '../../models/models';
import { BASE_URL } from '../../shared/constants/constants';

describe('UserService', () => {
  let userService: UserService;
  let httpTestingController: HttpTestingController;

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

  const testUserResponse: UserResponse = {
    code: 200,
    message: 'test message',
    user: testUser,
  };

  const testUsersResponse: UsersResponse = {
    code: 200,
    message: 'test message',
    total: 10,
    users: [testUser, testUser]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the service', () => {
    expect(userService).toBeTruthy();
  });

  describe('getAllUsers', () => {
    it('should fetch users with default parameters', () => {
      userService.getAllUsers().subscribe(response => {
        expect(response.users.length).toBe(2);
        expect(response.users[0].created_at).toBeInstanceOf(Date);
        expect(response.users[0].updated_at).toBeInstanceOf(Date);
      });

      const req = httpTestingController.expectOne(`${BASE_URL}/users?limit=10&offset=0&substring=`);
      expect(req.request.method).toBe('GET');
      req.flush(testUsersResponse);
    });

    it('should fetch users with custom parameters', () => {
      userService.getAllUsers(5, 10, 'search').subscribe(response => {
        expect(response.users.length).toBe(2);
      });

      const req = httpTestingController.expectOne(`${BASE_URL}/users?limit=5&offset=10&substring=search`);
      expect(req.request.method).toBe('GET');
      req.flush(testUsersResponse);
    });
  });

  describe('getAllUsersPublic', () => {
    it('should fetch public users for a given slot', () => {
      const slotId = '123';
      userService.getAllUsersPublic(slotId).subscribe(response => {
        expect(response.users.length).toBe(2);
      });

      const req = httpTestingController.expectOne(`${BASE_URL}/users/public?slotId=${slotId}`);
      expect(req.request.method).toBe('GET');
      req.flush(testUsersResponse);
    });
  });

  describe('sendInvite', () => {
    it('should send an invitation', () => {
      const userId = '1';
      const slotId = '2';
      const gameId = '3';

      const expectedResponse = {
        code: 200,
        message: 'Invitation sent',
        invitation_id: 'inv123'
      };

      userService.sendInvite(userId, slotId, gameId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpTestingController.expectOne(`${BASE_URL}/invitations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        invited_user_id: userId,
        slot_id: slotId,
        game_id: gameId
      });
      req.flush(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile', () => {
      userService.getProfile().subscribe(response => {
        expect(response.user).toEqual(testUser);
      });

      const req = httpTestingController.expectOne(`${BASE_URL}/users/me`);
      expect(req.request.method).toBe('GET');
      req.flush(testUserResponse);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', () => {
      const userId = '1';
      const expectedResponse = {
        code: 200,
        message: 'User deleted successfully'
      };

      userService.deleteUser(userId).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpTestingController.expectOne(`${BASE_URL}/users/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });
  });

  describe('updateUserDetails', () => {
    it('should update user details', () => {
      const username = 'newUsername';
      const password = 'newPassword';
      const mobileNumber = '9999999999';
      const imageUrl = 'new-image-url';

      userService.updateUserDetails(username, password, mobileNumber, imageUrl)
        .subscribe(response => {
          expect(response.status).toBe(200);
        });

      const req = httpTestingController.expectOne(`${BASE_URL}/users`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        username: username,
        password: password,
        mobile_number: mobileNumber,
        image_url: imageUrl
      });
      req.flush({}, { status: 200, statusText: 'OK' });
    });
  });
});
