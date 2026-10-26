package backend.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 驳回预约请求
 */
@Data
public class RejectRequest {

    @NotBlank(message = "驳回理由不能为空")
    private String reason;
}
