package backend.demo.service.impl;

import backend.demo.common.auth.UserContext;
import backend.demo.common.constant.Constants;
import backend.demo.common.exception.BusinessException;
import backend.demo.common.result.PageResult;
import backend.demo.entity.Booking;
import backend.demo.entity.Instrument;
import backend.demo.mapper.BookingMapper;
import backend.demo.mapper.InstrumentMapper;
import backend.demo.service.InstrumentService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class InstrumentServiceImpl implements InstrumentService {

    private final InstrumentMapper instrumentMapper;
    private final BookingMapper bookingMapper;

    @Override
    public PageResult<Instrument> list(String name, String status, long pageNum, long pageSize) {
        LambdaQueryWrapper<Instrument> qw = new LambdaQueryWrapper<>();
        qw.like(StringUtils.hasText(name), Instrument::getName, name)
                .eq(StringUtils.hasText(status), Instrument::getStatus, status)
                .orderByDesc(Instrument::getId);
        Page<Instrument> page = instrumentMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        return PageResult.of(page);
    }

    @Override
    public Instrument getById(Long id) {
        Instrument instrument = instrumentMapper.selectById(id);
        if (instrument == null) {
            throw new BusinessException(404, "仪器不存在");
        }
        return instrument;
    }

    @Override
    public Long create(Instrument instrument) {
        UserContext.requireAdmin();
        instrument.setId(null);
        instrumentMapper.insert(instrument);
        return instrument.getId();
    }

    @Override
    public Long update(Long id, Instrument instrument) {
        UserContext.requireAdmin();
        if (instrumentMapper.selectById(id) == null) {
            throw new BusinessException(404, "仪器不存在");
        }
        instrument.setId(id);
        instrumentMapper.updateById(instrument);
        return id;
    }

    @Override
    public void delete(Long id) {
        UserContext.requireAdmin();
        if (instrumentMapper.selectById(id) == null) {
            throw new BusinessException(404, "仪器不存在");
        }
        Long activeCount = bookingMapper.selectCount(new LambdaQueryWrapper<Booking>()
                .eq(Booking::getInstrumentId, id)
                .in(Booking::getStatus, Constants.BOOKING_PENDING, Constants.BOOKING_APPROVED));
        if (activeCount > 0) {
            throw new BusinessException(409, "该仪器存在有效预约，无法删除");
        }
        instrumentMapper.deleteById(id);
    }
}
