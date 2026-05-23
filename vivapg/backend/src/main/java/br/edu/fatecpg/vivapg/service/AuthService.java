package br.edu.fatecpg.vivapg.service;

import br.edu.fatecpg.vivapg.model.Usuario;
import br.edu.fatecpg.vivapg.repository.UsuarioRepository;
import br.edu.fatecpg.vivapg.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public Map<String, Object> registrar(String nome, String email, String senha) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("E-mail já cadastrado");
        }
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setEmail(email);
        u.setSenha(passwordEncoder.encode(senha));
        usuarioRepository.save(u);

        String token = jwtService.gerarToken(u.getId(), u.getEmail());
        return Map.of("token", token, "usuario", toPublic(u));
    }

    public Map<String, Object> login(String email, String senha) {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("E-mail ou senha incorretos"));

        if (!passwordEncoder.matches(senha, u.getSenha())) {
            throw new RuntimeException("E-mail ou senha incorretos");
        }
        String token = jwtService.gerarToken(u.getId(), u.getEmail());
        return Map.of("token", token, "usuario", toPublic(u));
    }

    private Map<String, Object> toPublic(Usuario u) {
        return Map.of(
                "id",    u.getId(),
                "nome",  u.getNome(),
                "email", u.getEmail()
        );
    }
}
