package backend.demo.service;

import backend.demo.entity.User;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import java.util.List;

/**
 * 用户服务（示例）
 */
public interface UserService {

    List<User> list();

    Page<User> page(long current, long size);
}
