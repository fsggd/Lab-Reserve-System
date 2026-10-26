package backend.demo.common.constant;

/**
 * 业务常量（角色、状态枚举值）
 */
public final class Constants {

    private Constants() {
    }

    // 角色
    public static final String ROLE_STUDENT = "STUDENT";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";

    // 仪器状态
    public static final String INSTRUMENT_NORMAL = "NORMAL";
    public static final String INSTRUMENT_REPAIRING = "REPAIRING";
    public static final String INSTRUMENT_DISABLED = "DISABLED";

    // 预约状态
    public static final String BOOKING_PENDING = "PENDING";
    public static final String BOOKING_APPROVED = "APPROVED";
    public static final String BOOKING_REJECTED = "REJECTED";
    public static final String BOOKING_COMPLETED = "COMPLETED";
    public static final String BOOKING_CANCELLED = "CANCELLED";
}
