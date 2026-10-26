package backend.demo.service.impl;

import backend.demo.common.auth.UserContext;
import backend.demo.common.constant.Constants;
import backend.demo.common.exception.BusinessException;
import backend.demo.common.result.PageResult;
import backend.demo.dto.BookingCreateRequest;
import backend.demo.entity.Booking;
import backend.demo.entity.Instrument;
import backend.demo.entity.User;
import backend.demo.mapper.BookingMapper;
import backend.demo.mapper.InstrumentMapper;
import backend.demo.mapper.UserMapper;
import backend.demo.service.BookingService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingMapper bookingMapper;
    private final InstrumentMapper instrumentMapper;
    private final UserMapper userMapper;

    @Override
    public PageResult<Booking> list(String status, Long instrumentId, String userName, long pageNum, long pageSize) {
        UserContext.requireAdmin();
        LambdaQueryWrapper<Booking> qw = new LambdaQueryWrapper<>();
        qw.eq(StringUtils.hasText(status), Booking::getStatus, status)
                .eq(instrumentId != null, Booking::getInstrumentId, instrumentId)
                .like(StringUtils.hasText(userName), Booking::getUserName, userName)
                .orderByDesc(Booking::getId);
        Page<Booking> page = bookingMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        return PageResult.of(page);
    }

    @Override
    public PageResult<Booking> mine(String status, long pageNum, long pageSize) {
        LambdaQueryWrapper<Booking> qw = new LambdaQueryWrapper<>();
        qw.eq(Booking::getUserId, UserContext.getUserId())
                .eq(StringUtils.hasText(status), Booking::getStatus, status)
                .orderByDesc(Booking::getId);
        Page<Booking> page = bookingMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        return PageResult.of(page);
    }

    @Override
    public Long create(BookingCreateRequest request) {
        Long userId = UserContext.getUserId();
        Instrument instrument = instrumentMapper.selectById(request.getInstrumentId());
        if (instrument == null) {
            throw new BusinessException(404, "仪器不存在");
        }
        if (!Constants.INSTRUMENT_NORMAL.equals(instrument.getStatus())) {
            throw new BusinessException(400, "该仪器当前不可预约");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BusinessException(400, "结束时间必须晚于开始时间");
        }
        // 时间重叠校验 → 409
        Long overlap = bookingMapper.selectCount(new LambdaQueryWrapper<Booking>()
                .eq(Booking::getInstrumentId, request.getInstrumentId())
                .in(Booking::getStatus, Constants.BOOKING_PENDING, Constants.BOOKING_APPROVED)
                .lt(Booking::getStartTime, request.getEndTime())
                .gt(Booking::getEndTime, request.getStartTime()));
        if (overlap > 0) {
            throw new BusinessException(409, "该仪器在所选时段已被预约");
        }

        User user = userMapper.selectById(userId);
        Booking booking = new Booking();
        booking.setInstrumentId(instrument.getId());
        booking.setInstrumentName(instrument.getName());
        booking.setUserId(userId);
        booking.setUserName(user != null ? user.getRealName() : "");
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setStatus(Constants.BOOKING_PENDING);
        bookingMapper.insert(booking);
        return booking.getId();
    }

    @Override
    public void approve(Long id) {
        UserContext.requireAdmin();
        Booking booking = getBooking(id);
        booking.setStatus(Constants.BOOKING_APPROVED);
        booking.setRejectReason(null);
        bookingMapper.updateById(booking);
    }

    @Override
    public void reject(Long id, String reason) {
        UserContext.requireAdmin();
        if (!StringUtils.hasText(reason)) {
            throw new BusinessException(400, "驳回理由不能为空");
        }
        Booking booking = getBooking(id);
        booking.setStatus(Constants.BOOKING_REJECTED);
        booking.setRejectReason(reason);
        bookingMapper.updateById(booking);
    }

    @Override
    public void cancel(Long id) {
        Booking booking = getBooking(id);
        if (!booking.getUserId().equals(UserContext.getUserId()) && !UserContext.isAdmin()) {
            throw new BusinessException(403, "无权取消该预约");
        }
        if (Constants.BOOKING_CANCELLED.equals(booking.getStatus())
                || Constants.BOOKING_COMPLETED.equals(booking.getStatus())) {
            throw new BusinessException(400, "该预约已结束，无法取消");
        }
        booking.setStatus(Constants.BOOKING_CANCELLED);
        bookingMapper.updateById(booking);
    }

    private Booking getBooking(Long id) {
        Booking booking = bookingMapper.selectById(id);
        if (booking == null) {
            throw new BusinessException(404, "预约不存在");
        }
        return booking;
    }
}
