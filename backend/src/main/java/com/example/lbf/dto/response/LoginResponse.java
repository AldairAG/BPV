package com.example.lbf.dto.response;

import com.example.lbf.entities.Usuario;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class LoginResponse {
    private String token;
    private Usuario usuario;
    private Boolean succes;
}
