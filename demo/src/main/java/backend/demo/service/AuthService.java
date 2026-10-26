package backend.demo.service;

import backend.demo.dto.LoginRequest;
import backend.demo.vo.LoginVO;
import backend.demo.vo.UserVO;

public interface AuthService {

    LoginVO login(LoginRequest request);

    UserVO profile();

    void logout();
}
