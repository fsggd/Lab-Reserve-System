package backend.demo.service.impl;

import backend.demo.entity.User;
import backend.demo.mapper.UserMapper;
import backend.demo.service.UserService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户服务实现（示例）
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    public List<User> list() {
        return userMapper.selectList(null);
    }

    @Override
    public Page<User> page(long current, long size) {
        return userMapper.selectPage(new Page<>(current, size), null);
    }
}
