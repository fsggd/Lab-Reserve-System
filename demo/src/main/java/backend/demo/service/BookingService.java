package backend.demo.service;

import backend.demo.common.result.PageResult;
import backend.demo.dto.BookingCreateRequest;
import backend.demo.entity.Booking;

public interface BookingService {

    PageResult<Booking> list(String status, Long instrumentId, String userName, long pageNum, long pageSize);

    PageResult<Booking> mine(String status, long pageNum, long pageSize);

    Long create(BookingCreateRequest request);

    void approve(Long id);

    void reject(Long id, String reason);

    void cancel(Long id);
}
