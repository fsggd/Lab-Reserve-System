package backend.demo.config;

import backend.demo.common.constant.Constants;
import backend.demo.entity.Instrument;
import backend.demo.entity.User;
import backend.demo.mapper.InstrumentMapper;
import backend.demo.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 启动时初始化种子数据（账号密码均为 123456，与前端 Mock 登录入口一致）
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserMapper userMapper;
    private final InstrumentMapper instrumentMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userMapper.selectCount(null) == 0) {
            String pwd = passwordEncoder.encode("123456");
            userMapper.insert(user("admin01", "管理员", Constants.ROLE_ADMIN, "13800000001", pwd));
            userMapper.insert(user("root", "超级管理员", Constants.ROLE_SUPER_ADMIN, "13800000002", pwd));
            userMapper.insert(user("student01", "张三", Constants.ROLE_STUDENT, "13800000003", pwd));
        }
        if (instrumentMapper.selectCount(null) == 0) {
            instrumentMapper.insert(instrument("扫描电子显微镜", "SEM-2000", "实验楼A-301", Constants.INSTRUMENT_NORMAL, "09:00", "18:00", "需提前培训"));
            instrumentMapper.insert(instrument("高效液相色谱仪", "HPLC-1260", "实验楼A-302", Constants.INSTRUMENT_NORMAL, "08:30", "17:30", ""));
            instrumentMapper.insert(instrument("原子吸收分光光度计", "AAS-900", "实验楼B-201", Constants.INSTRUMENT_REPAIRING, "09:00", "18:00", "光源更换中"));
            instrumentMapper.insert(instrument("冷冻离心机", "CF-16RN", "实验楼B-205", Constants.INSTRUMENT_NORMAL, "00:00", "23:59", ""));
            instrumentMapper.insert(instrument("精密电子天平", "ME-204T", "实验楼B-101", Constants.INSTRUMENT_DISABLED, "09:00", "18:00", "已报废待处理"));
        }
    }

    private User user(String username, String realName, String role, String phone, String password) {
        User u = new User();
        u.setUsername(username);
        u.setRealName(realName);
        u.setRole(role);
        u.setPhone(phone);
        u.setPassword(password);
        return u;
    }

    private Instrument instrument(String name, String model, String location, String status,
                                  String start, String end, String remark) {
        Instrument i = new Instrument();
        i.setName(name);
        i.setModel(model);
        i.setLocation(location);
        i.setStatus(status);
        i.setAvailableStart(start);
        i.setAvailableEnd(end);
        i.setRemark(remark);
        return i;
    }
}
