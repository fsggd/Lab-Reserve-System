package backend.demo.service;

import backend.demo.vo.StatsOverviewVO;

public interface StatsService {

    StatsOverviewVO overview(int days);
}
