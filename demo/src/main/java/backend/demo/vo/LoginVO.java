package backend.demo.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 登录返回：{ token, user }
 */
@Data
@AllArgsConstructor
public class LoginVO {

    private String token;
    private UserVO user;
}
