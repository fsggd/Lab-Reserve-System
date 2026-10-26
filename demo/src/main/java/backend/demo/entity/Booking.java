package backend.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 预约实体，对应表 booking
 */
@Data
@TableName("booking")
public class Booking {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long instrumentId;

    /** 仪器名称快照 */
    private String instrumentName;

    private Long userId;

    /** 预约人姓名快照 */
    private String userName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;

    private String purpose;

    /** PENDING / APPROVED / REJECTED / COMPLETED / CANCELLED */
    private String status;

    private String rejectReason;

    private LocalDateTime createTime;
}
