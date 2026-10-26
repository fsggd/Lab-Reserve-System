-- 高校实验室预约管理系统 · 建表 SQL（启动时自动执行，可重复运行）

CREATE TABLE IF NOT EXISTS sys_user (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(64)  NOT NULL UNIQUE COMMENT '登录名',
  password    VARCHAR(128) NOT NULL COMMENT 'BCrypt 密码',
  real_name   VARCHAR(64)  COMMENT '真实姓名',
  role        VARCHAR(32)  NOT NULL DEFAULT 'STUDENT' COMMENT 'STUDENT/ADMIN/SUPER_ADMIN',
  phone       VARCHAR(32)  COMMENT '手机号',
  create_time DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instrument (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(128) NOT NULL COMMENT '仪器名称',
  model            VARCHAR(128) COMMENT '型号',
  location         VARCHAR(128) COMMENT '存放位置',
  status           VARCHAR(32)  NOT NULL DEFAULT 'NORMAL' COMMENT 'NORMAL/REPAIRING/DISABLED',
  available_start  VARCHAR(8)   COMMENT '每日可预约起始 HH:mm',
  available_end    VARCHAR(8)   COMMENT '每日可预约结束 HH:mm',
  remark           VARCHAR(255) COMMENT '备注',
  create_time      DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  instrument_id    BIGINT       NOT NULL COMMENT '仪器 id',
  instrument_name  VARCHAR(128) COMMENT '仪器名称快照',
  user_id          BIGINT       NOT NULL COMMENT '预约人 id',
  user_name        VARCHAR(64)  COMMENT '预约人姓名快照',
  start_time       DATETIME     NOT NULL COMMENT '开始时间',
  end_time         DATETIME     NOT NULL COMMENT '结束时间',
  purpose          VARCHAR(255) COMMENT '实验用途',
  status           VARCHAR(32)  NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/APPROVED/REJECTED/COMPLETED/CANCELLED',
  reject_reason    VARCHAR(255) COMMENT '驳回理由',
  create_time      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  KEY idx_booking_instrument_time (instrument_id, start_time, end_time),
  KEY idx_booking_user (user_id)
);
