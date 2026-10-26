package backend.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户实体，对应表 sys_user
 */
@Data
@TableName("sys_user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    /** BCrypt 密文，禁止直接返回给前端 */
    private String password;

    /** 真实姓名 */
    private String realName;

    /** STUDENT / ADMIN / SUPER_ADMIN */
    private String role;

    private String phone;

    private LocalDateTime createTime;
}
