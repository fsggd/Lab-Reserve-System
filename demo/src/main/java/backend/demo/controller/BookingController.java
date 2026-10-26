package backend.demo.controller;

import backend.demo.common.result.PageResult;
import backend.demo.common.result.R;
import backend.demo.dto.BookingCreateRequest;
import backend.demo.dto.RejectRequest;
import backend.demo.entity.Booking;
import backend.demo.service.BookingService;
import backend.demo.vo.IdVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public R<PageResult<Booking>> list(@RequestParam(required = false) String status,
                                       @RequestParam(required = false) Long instrumentId,
                                       @RequestParam(required = false) String userName,
                                       @RequestParam(defaultValue = "1") long pageNum,
                                       @RequestParam(defaultValue = "10") long pageSize) {
        return R.ok(bookingService.list(status, instrumentId, userName, pageNum, pageSize));
    }

    @GetMapping("/mine")
    public R<PageResult<Booking>> mine(@RequestParam(required = false) String status,
                                       @RequestParam(defaultValue = "1") long pageNum,
                                       @RequestParam(defaultValue = "10") long pageSize) {
        return R.ok(bookingService.mine(status, pageNum, pageSize));
    }

    @PostMapping
    public R<IdVO> create(@Valid @RequestBody BookingCreateRequest request) {
        return R.ok(new IdVO(bookingService.create(request)));
    }

    @PostMapping("/{id}/approve")
    public R<Boolean> approve(@PathVariable Long id) {
        bookingService.approve(id);
        return R.ok(true);
    }

    @PostMapping("/{id}/reject")
    public R<Boolean> reject(@PathVariable Long id, @Valid @RequestBody RejectRequest request) {
        bookingService.reject(id, request.getReason());
        return R.ok(true);
    }

    @DeleteMapping("/{id}")
    public R<Boolean> cancel(@PathVariable Long id) {
        bookingService.cancel(id);
        return R.ok(true);
    }
}
