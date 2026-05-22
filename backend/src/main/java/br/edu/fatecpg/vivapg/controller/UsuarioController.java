package br.edu.fatecpg.vivapg.controller;

import br.edu.fatecpg.vivapg.model.*;
import br.edu.fatecpg.vivapg.repository.*;
import br.edu.fatecpg.vivapg.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PerfilRepository perfilRepository;

    @GetMapping("/me")
    public ResponseEntity<?> meuPerfil(Authentication auth) {
        String id = (String) auth.getPrincipal();
        Usuario u = usuarioService.buscarPorId(id);
        Perfil p = perfilRepository.findByUsuarioId(id).orElse(null);
        return ResponseEntity.ok(Map.of("usuario", u, "perfil", p != null ? p : Map.of()));
    }

    @PutMapping("/me/senha")
    public ResponseEntity<?> alterarSenha(@RequestBody Map<String, String> body, Authentication auth) {
        String id = (String) auth.getPrincipal();
        usuarioService.atualizarSenha(id, body.get("novaSenha"));
        return ResponseEntity.ok(Map.of("mensagem", "Senha alterada com sucesso"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> excluirConta(Authentication auth) {
        String id = (String) auth.getPrincipal();
        usuarioService.excluirConta(id);
        return ResponseEntity.ok(Map.of("mensagem", "Conta excluída"));
    }

    @PostMapping("/me/perfil")
    public ResponseEntity<?> salvarPerfil(@RequestBody Perfil perfil, Authentication auth) {
        String id = (String) auth.getPrincipal();
        perfil.setUsuarioId(id);
        Perfil existing = perfilRepository.findByUsuarioId(id).orElse(null);
        if (existing != null) perfil.setId(existing.getId());
        return ResponseEntity.ok(perfilRepository.save(perfil));
    }
}
