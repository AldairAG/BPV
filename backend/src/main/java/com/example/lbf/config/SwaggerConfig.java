package com.example.lbf.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración para la documentación de la API con OpenAPI 3.0 (Swagger).
 * 
 * Esta clase configura la documentación generada automáticamente para
 * los endpoints de la API, incluyendo información general, contacto,
 * licencia y requisitos de seguridad.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Gestión de La Burbuja Feliz")
                        .description("API RESTful para la gestión de ventas, productos, inventario y usuarios del sistema.")
                        .version("1.0")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo")
                                .email("contacto@bubujafeliz.com")
                                .url("https://www.bubujafeliz.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html"))
                        .termsOfService("http://www.bubujafeliz.com/terms"))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Auth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Introduzca el token JWT en el formato: Bearer <token>")));
    }
}
