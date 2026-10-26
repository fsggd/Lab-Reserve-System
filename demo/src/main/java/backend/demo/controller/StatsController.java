package backend.demo.controller;

import backend.demo.common.result.R;
import backend.demo.service.StatsService;
import backend.demo.vo.StatsOverviewVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/overview")
    public R<StatsOverviewVO> overview(@RequestParam(defaultValue = "7") int days) {
        return R.ok(statsService.overview(days));
    }
}
