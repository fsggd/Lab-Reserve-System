package backend.demo.controller;

import backend.demo.common.result.R;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 健康检查接口（不依赖数据库，用于确认服务已启动）
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public R<String> health() {
        return R.ok("ok");
    }
}
