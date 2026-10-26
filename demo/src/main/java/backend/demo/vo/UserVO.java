package backend.demo.vo;

import backend.demo.entity.User;
import lombok.Data;

/**
 * 用户信息（不含密码）
 */
@Data
public class UserVO {

    private Long id;
    private String username;
    private String realName;
    private String role;
    private String phone;

    public static UserVO from(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setRole(user.getRole());
        vo.setPhone(user.getPhone());
        return vo;
    }
}
