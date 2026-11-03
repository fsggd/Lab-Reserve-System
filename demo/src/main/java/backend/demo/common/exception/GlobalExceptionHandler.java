package backend.demo.common.exception;

import backend.demo.common.result.R;
import backend.demo.common.result.ResultCode;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常 */
    @ExceptionHandler(BusinessException.class)
    public R<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return R.fail(e.getCode(), e.getMessage());
    }

    /** @RequestBody 参数校验失败 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleMethodArgumentNotValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + " " + fe.getDefaultMessage())
                .findFirst()
                .orElse(ResultCode.PARAM_ERROR.getMessage());
        log.warn("参数校验失败: {}", msg);
        return R.fail(ResultCode.PARAM_ERROR.getCode(), msg);
    }

    /** 表单/对象绑定参数校验失败 */
    @ExceptionHandler(BindException.class)
    public R<Void> handleBindException(BindException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + " " + fe.getDefaultMessage())
                .findFirst()
                .orElse(ResultCode.PARAM_ERROR.getMessage());
        log.warn("参数绑定失败: {}", msg);
        return R.fail(ResultCode.PARAM_ERROR.getCode(), msg);
    }

    /** @RequestParam/@PathVariable 上的 @Validated 校验失败 */
    @ExceptionHandler(ConstraintViolationException.class)
    public R<Void> handleConstraintViolation(ConstraintViolationException e) {
        String msg = e.getConstraintViolations().stream()
                .map(v -> v.getMessage())
                .findFirst()
                .orElse(ResultCode.PARAM_ERROR.getMessage());
        log.warn("参数校验失败: {}", msg);
        return R.fail(ResultCode.PARAM_ERROR.getCode(), msg);
    }

    /** 请求体 JSON 格式错误 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public R<Void> handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
        log.warn("请求体解析失败: {}", e.getMessage());
        return R.fail(ResultCode.PARAM_ERROR.getCode(), "请求体格式错误");
    }

    /** 请求方式不支持 */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public R<Void> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        log.warn("请求方式不支持: {}", e.getMessage());
        return R.fail(ResultCode.METHOD_NOT_ALLOWED);
    }

    /** 接口路径不存在（Spring Boot 4 无处理器时抛出，落入兜底会误报 500） */
    @ExceptionHandler(NoResourceFoundException.class)
    public R<Void> handleNoResourceFound(NoResourceFoundException e) {
        log.warn("接口不存在: {} {}", e.getHttpMethod(), e.getResourcePath());
        return R.fail(ResultCode.NOT_FOUND);
    }

    /** 接口路径不存在（兼容 throw-exception-if-no-handler-found=true 的旧行为） */
    @ExceptionHandler(NoHandlerFoundException.class)
    public R<Void> handleNoHandlerFound(NoHandlerFoundException e) {
        log.warn("接口不存在: {} {}", e.getHttpMethod(), e.getRequestURL());
        return R.fail(ResultCode.NOT_FOUND);
    }

    /** 兜底异常 */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return R.fail(ResultCode.SERVER_ERROR);
    }
}
