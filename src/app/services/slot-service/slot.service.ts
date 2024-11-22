import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';
import { Slot, SlotResponse } from '../../models/slot.model';
import { BASE_URL } from '../../shared/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  constructor(private httpClient: HttpClient) {}

  getGameSlots(gameId: string): Observable<SlotResponse> {
    return this.httpClient
      .get<SlotResponse>(`${BASE_URL}/slots/games/${gameId}`)
      .pipe(
        tap((response: SlotResponse) => {
          if (response.slots) {
            response.slots = response.slots.map((slot: Slot) => ({
              ...slot,
              date: new Date(slot.slot_date),
              start_time: new Date(slot.start_time),
              end_time: new Date(slot.end_time),
              created_at: new Date(slot.created_at),
            }));
          }
        })
      );
  }
}
