package backend.demo.common.auth;

import backend.demo.common.exception.BusinessException;
import backend.demo.common.result.ResultCode;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 登录鉴权拦截器：校验 Authorization: Bearer <jwt>，并写入 UserContext
 */
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS 预检直接放行
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "请先登录");
        }
        try {
            Claims claims = jwtUtil.parse(auth.substring(7));
            Long uid = Long.valueOf(String.valueOf(claims.get("uid")));
            String role = String.valueOf(claims.get("role"));
            UserContext.set(uid, role);
            return true;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "登录状态已失效，请重新登录");
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
