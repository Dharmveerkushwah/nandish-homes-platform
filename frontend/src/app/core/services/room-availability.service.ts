import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { RoomBlockRecord } from '../models/booking.models';

export interface AvailabilityBlock {
  id: string;
  roomId: number;
  from: string;
  to: string;
  reason: 'MAINTENANCE' | 'BLOCKED';
  note?: string;
}

/**
 * Admin gap doc item 6/9: room blocks/maintenance periods, now backed by the
 * real /api/admin/room-blocks CRUD endpoints (RoomBlockRequest/Response.java)
 * instead of an in-memory-only signal. The public interface (blocks,
 * blocksFor, addBlock, removeBlock) is kept the same so room-form-modal's
 * calling code doesn't need to change - only the internal mapping between
 * this UI's reason/note pair and the backend's free-text reason + maintenance
 * boolean.
 */
@Injectable({ providedIn: 'root' })
export class RoomAvailabilityService {
  private readonly api = inject(ApiService);
  private readonly blocksSignal = signal<AvailabilityBlock[]>([]);
  readonly blocks = this.blocksSignal.asReadonly();
  private readonly loadedRoomIds = new Set<number>();

  /** Fetches a room's blocks once per room id; safe to call repeatedly (e.g. every time the tab opens). */
  ensureLoaded(roomId: number): void {
    if (this.loadedRoomIds.has(roomId)) return;
    this.loadedRoomIds.add(roomId);
    this.refresh(roomId);
  }

  refresh(roomId: number): void {
    this.api.getRoomBlocks(roomId).subscribe({
      next: (records) => {
        const mapped = records.filter((r) => r.roomId === roomId).map((r) => this.fromRecord(r));
        this.blocksSignal.update((list) => [...list.filter((b) => b.roomId !== roomId), ...mapped]);
      },
    });
  }

  blocksFor(roomId: number): AvailabilityBlock[] {
    return this.blocksSignal().filter((block) => block.roomId === roomId);
  }

  addBlock(block: Omit<AvailabilityBlock, 'id'>): void {
    this.api
      .createRoomBlock({
        roomId: block.roomId,
        startDate: block.from,
        endDate: block.to,
        reason: block.note?.trim() || (block.reason === 'MAINTENANCE' ? 'Maintenance' : 'Blocked'),
        maintenance: block.reason === 'MAINTENANCE',
      })
      .subscribe({ next: () => this.refresh(block.roomId) });
  }

  removeBlock(id: string): void {
    const existing = this.blocksSignal().find((b) => b.id === id);
    this.api.deleteRoomBlock(Number(id)).subscribe({
      next: () => { if (existing) this.refresh(existing.roomId); },
    });
  }

  private fromRecord(record: RoomBlockRecord): AvailabilityBlock {
    return {
      id: String(record.id),
      roomId: record.roomId,
      from: record.startDate,
      to: record.endDate,
      reason: record.maintenance ? 'MAINTENANCE' : 'BLOCKED',
      note: record.reason,
    };
  }
}
