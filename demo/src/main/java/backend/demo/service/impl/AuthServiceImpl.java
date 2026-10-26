package backend.demo.service.impl;

import backend.demo.common.auth.JwtUtil;
import backend.demo.common.auth.UserContext;
import backend.demo.common.exception.BusinessException;
import backend.demo.dto.LoginRequest;
import backend.demo.entity.User;
import backend.demo.mapper.UserMapper;
import backend.demo.service.AuthService;
import backend.demo.vo.LoginVO;
import backend.demo.vo.UserVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginVO login(LoginRequest request) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(400, "用户名或密码错误");
        }
        String token = jwtUtil.generate(user.getId(), user.getUsername(), user.getRole());
        return new LoginVO(token, UserVO.from(user));
    }

    @Override
    public UserVO profile() {
        User user = userMapper.selectById(UserContext.getUserId());
        if (user == null) {
            throw new BusinessException(401, "用户不存在");
        }
        return UserVO.from(user);
    }

    @Override
    public void logout() {
        // 无状态 JWT，服务端无需处理
    }
}
