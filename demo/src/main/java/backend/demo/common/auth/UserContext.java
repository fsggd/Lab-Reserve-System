package backend.demo.common.auth;

import backend.demo.common.constant.Constants;
import backend.demo.common.exception.BusinessException;
import backend.demo.common.result.ResultCode;

/**
 * 当前登录用户上下文（ThreadLocal）
 */
public final class UserContext {

    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> ROLE = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(Long userId, String role) {
        USER_ID.set(userId);
        ROLE.set(role);
    }

    public static Long getUserId() {
        return USER_ID.get();
    }

    public static String getRole() {
        return ROLE.get();
    }

    public static boolean isAdmin() {
        String role = getRole();
        return Constants.ROLE_ADMIN.equals(role) || Constants.ROLE_SUPER_ADMIN.equals(role);
    }

    /** 要求管理员/超管角色，否则抛 403 */
    public static void requireAdmin() {
        if (!isAdmin()) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
    }

    public static void clear() {
        USER_ID.remove();
        ROLE.remove();
    }
}
