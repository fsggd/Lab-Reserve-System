package backend.demo.vo;

import lombok.Data;

import java.util.List;

/**
 * 统计概览返回体
 */
@Data
public class StatsOverviewVO {

    private Summary summary;
    private List<TrendItem> bookingTrend;
    private List<UtilizationItem> utilization;
    private List<StatusItem> statusRatio;

    @Data
    public static class Summary {
        private long totalBookings;
        private long pendingCount;
        private long instrumentCount;
        private long availableCount;
    }

    @Data
    public static class TrendItem {
        private String date;
        private long count;

        public TrendItem(String date, long count) {
            this.date = date;
            this.count = count;
        }
    }

    @Data
    public static class UtilizationItem {
        private String name;
        private long rate;

        public UtilizationItem(String name, long rate) {
            this.name = name;
            this.rate = rate;
        }
    }

    @Data
    public static class StatusItem {
        private String name;
        private long value;

        public StatusItem(String name, long value) {
            this.name = name;
            this.value = value;
        }
    }
}
