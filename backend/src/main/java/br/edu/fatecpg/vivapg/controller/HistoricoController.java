package br.edu.fatecpg.vivapg.controller;

import br.edu.fatecpg.vivapg.repository.HistoricoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/historico")
@RequiredArgsConstructor
public class HistoricoController {

    private final HistoricoRepository historicoRepository;

    @GetMapping
    public ResponseEntity<?> listar(Authentication auth) {
        String usuarioId = (String) auth.getPrincipal();
        return ResponseEntity.ok(
            historicoRepository.findByUsuarioIdOrderByRealizadoEmDesc(usuarioId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable String id) {
        historicoRepository.deleteById(id);
        return ResponseEntity.ok(java.util.Map.of("mensagem", "Histórico excluído"));
    }
}
