package backend.demo.service.impl;

import backend.demo.common.constant.Constants;
import backend.demo.entity.Booking;
import backend.demo.entity.Instrument;
import backend.demo.mapper.BookingMapper;
import backend.demo.mapper.InstrumentMapper;
import backend.demo.service.StatsService;
import backend.demo.vo.StatsOverviewVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final BookingMapper bookingMapper;
    private final InstrumentMapper instrumentMapper;

    @Override
    public StatsOverviewVO overview(int days) {
        StatsOverviewVO vo = new StatsOverviewVO();

        List<Booking> all = bookingMapper.selectList(null);
        List<Instrument> instruments = instrumentMapper.selectList(null);

        // 汇总
        StatsOverviewVO.Summary summary = new StatsOverviewVO.Summary();
        summary.setTotalBookings(all.size());
        summary.setPendingCount(all.stream()
                .filter(b -> Constants.BOOKING_PENDING.equals(b.getStatus())).count());
        summary.setInstrumentCount(instruments.size());
        summary.setAvailableCount(instruments.stream()
                .filter(i -> Constants.INSTRUMENT_NORMAL.equals(i.getStatus())).count());
        vo.setSummary(summary);

        // 近 N 天预约量趋势
        LocalDate today = LocalDate.now();
        DateTimeFormatter trendFmt = DateTimeFormatter.ofPattern("MM-dd");
        Map<String, Long> trendMap = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            trendMap.put(today.minusDays(i).format(trendFmt), 0L);
        }
        LocalDateTime from = today.minusDays(days - 1L).atStartOfDay();
        for (Booking b : all) {
            if (b.getStartTime() != null && !b.getStartTime().isBefore(from)) {
                String key = b.getStartTime().toLocalDate().format(trendFmt);
                trendMap.computeIfPresent(key, (k, v) -> v + 1);
            }
        }
        List<StatsOverviewVO.TrendItem> trend = new ArrayList<>();
        trendMap.forEach((k, v) -> trend.add(new StatsOverviewVO.TrendItem(k, v)));
        vo.setBookingTrend(trend);

        // 状态占比
        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("待审批", 0L);
        statusMap.put("已通过", 0L);
        statusMap.put("已驳回", 0L);
        statusMap.put("已完成", 0L);
        statusMap.put("已取消", 0L);
        for (Booking b : all) {
            statusMap.merge(statusLabel(b.getStatus()), 1L, Long::sum);
        }
        List<StatsOverviewVO.StatusItem> ratio = new ArrayList<>();
        statusMap.forEach((k, v) -> ratio.add(new StatsOverviewVO.StatusItem(k, v)));
        vo.setStatusRatio(ratio);

        // 仪器利用率：已预约时长 / 可用总时长
        List<StatsOverviewVO.UtilizationItem> util = new ArrayList<>();
        for (Instrument ins : instruments) {
            long available = days * dailyMinutes(ins);
            if (available <= 0) {
                util.add(new StatsOverviewVO.UtilizationItem(ins.getName(), 0L));
                continue;
            }
            long booked = 0L;
            for (Booking b : all) {
                if (!ins.getId().equals(b.getInstrumentId())) {
                    continue;
                }
                if (!Constants.BOOKING_APPROVED.equals(b.getStatus())
                        && !Constants.BOOKING_COMPLETED.equals(b.getStatus())) {
                    continue;
                }
                if (b.getStartTime() != null && b.getEndTime() != null) {
                    booked += Math.max(0, ChronoUnit.MINUTES.between(b.getStartTime(), b.getEndTime()));
                }
            }
            long rate = Math.min(100, Math.round((double) booked / available * 100));
            util.add(new StatsOverviewVO.UtilizationItem(ins.getName(), rate));
        }
        vo.setUtilization(util);

        return vo;
    }

    private String statusLabel(String status) {
        if (Constants.BOOKING_PENDING.equals(status)) return "待审批";
        if (Constants.BOOKING_APPROVED.equals(status)) return "已通过";
        if (Constants.BOOKING_REJECTED.equals(status)) return "已驳回";
        if (Constants.BOOKING_COMPLETED.equals(status)) return "已完成";
        if (Constants.BOOKING_CANCELLED.equals(status)) return "已取消";
        return "其他";
    }

    private long dailyMinutes(Instrument ins) {
        try {
            int s = toMinutes(ins.getAvailableStart());
            int e = toMinutes(ins.getAvailableEnd());
            if (e <= s) {
                e = 24 * 60;
            }
            return e - s;
        } catch (Exception ex) {
            return 0;
        }
    }

    private int toMinutes(String hhmm) {
        String[] p = hhmm.split(":");
        return Integer.parseInt(p[0]) * 60 + Integer.parseInt(p[1]);
    }
}
