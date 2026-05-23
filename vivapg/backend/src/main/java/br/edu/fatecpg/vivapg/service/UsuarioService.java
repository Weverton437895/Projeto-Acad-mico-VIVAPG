package br.edu.fatecpg.vivapg.service;

import br.edu.fatecpg.vivapg.model.Usuario;
import br.edu.fatecpg.vivapg.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Usuario buscarPorId(String id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Usuario atualizarSenha(String id, String novaSenha) {
        Usuario u = buscarPorId(id);
        u.setSenha(passwordEncoder.encode(novaSenha));
        return usuarioRepository.save(u);
    }

    public void excluirConta(String id) {
        usuarioRepository.deleteById(id);
    }
}
