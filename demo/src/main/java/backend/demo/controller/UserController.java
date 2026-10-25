package backend.demo.controller;

import backend.demo.common.result.R;
import backend.demo.entity.User;
import backend.demo.service.UserService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 用户接口（示例）
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/list")
    public R<List<User>> list() {
        return R.ok(userService.list());
    }

    @GetMapping("/page")
    public R<Page<User>> page(@RequestParam(defaultValue = "1") long current,
                              @RequestParam(defaultValue = "10") long size) {
        return R.ok(userService.page(current, size));
    }
}
