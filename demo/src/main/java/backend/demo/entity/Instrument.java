package backend.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 仪器实体，对应表 instrument
 */
@Data
@TableName("instrument")
public class Instrument {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String model;

    private String location;

    /** NORMAL / REPAIRING / DISABLED */
    private String status;

    /** 每日可预约起始 HH:mm */
    private String availableStart;

    /** 每日可预约结束 HH:mm */
    private String availableEnd;

    private String remark;

    private LocalDateTime createTime;
}
