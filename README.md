# AM Store — Frontend

React + Vite + Tailwind conectado a tu backend Spring Boot (`http://localhost:8080`).

## 1. Instalar y correr

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`. Tu backend debe estar corriendo en `localhost:8080`.

## 2. Cambios necesarios en el backend (Spring Boot)

Sin esto, el frontend **no podrá conectarse** o el login no funcionará.

### a) Habilitar CORS en `SecurityConfig.java`

Reemplaza tu `securityFilterChain` y agrega el bean de CORS:

```java
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())   // <-- AGREGAR ESTA LÍNEA
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/productos/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .httpBasic(Customizer.withDefaults());
    return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:5173"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

Ya puedes quitar los `@CrossOrigin(origins = "*")` de `PedidoController` y
`DetallePedidoController` — con el bean de arriba ya no hacen falta, y así
todo el CORS queda centralizado en un solo lugar.

### b) Nuevo endpoint `/api/auth/me`

El frontend necesita saber el **rol** del usuario después de iniciar sesión
(para mostrar u ocultar botones de admin). Como usas Basic Auth con usuarios
en memoria, no hay otra forma de obtenerlo salvo preguntarle a Spring
Security directamente. Crea este archivo nuevo:

`src/main/java/com/amstore/amstore/controller/AuthController.java`

```java
package com.amstore.amstore.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("username", authentication.getName());
        response.put(
            "roles",
            authentication.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .toList()
        );
        return response;
    }
}
```

Con `anyRequest().authenticated()` este endpoint ya queda protegido
automáticamente — no necesitas agregar nada más en `SecurityConfig`.

## 3. Usuarios de prueba (login)

Estos son los usuarios "quemados" en tu `SecurityConfig` actual:

| Email | Contraseña | Rol |
|---|---|---|
| admin@amstore.com | admin123 | ADMIN |
| ana@gmail.com | 123456 | CLIENTE |

## 4. Cosas a tener en cuenta

- **`POST /api/usuarios` requiere estar autenticado.** Ahora mismo, con
  `anyRequest().authenticated()`, no se puede "registrar" un usuario nuevo
  sin haber iniciado sesión antes. Si quieres un registro público real,
  agrega en `SecurityConfig`:
  `.requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()`
  — y ojalá antes de eso, encriptar el password con `BCryptPasswordEncoder`
  en vez de guardarlo en texto plano.
- **El login (Basic Auth) es independiente de la tabla `Usuario`.** Los
  usuarios que crees desde la pantalla "Usuarios" del frontend se guardan en
  la base de datos, pero **no podrán iniciar sesión** hasta que conectes
  `UserDetailsService` a tu `UsuarioRepository` (ahora mismo usa
  `InMemoryUserDetailsManager`). Es el siguiente paso lógico del backend.
- **Crear un pedido:** al elegir "Nuevo pedido" se pide seleccionar un
  cliente de la tabla `Usuario` (no necesariamente el usuario que inició
  sesión), porque ambas cosas no están conectadas todavía por el punto
  anterior.

## 5. Estructura del proyecto

```
src/
  api/client.js            — cliente axios con Basic Auth
  context/AuthContext.jsx  — login/logout, guarda credenciales y rol
  components/
    ProtectedRoute.jsx     — protege rutas por sesión/rol
    Layout.jsx              — barra lateral + navegación
  pages/
    Login.jsx
    Productos.jsx            — catálogo + CRUD (admin)
    Pedidos.jsx               — lista, crear, ver detalle
    Usuarios.jsx              — lista + crear (admin)
```
