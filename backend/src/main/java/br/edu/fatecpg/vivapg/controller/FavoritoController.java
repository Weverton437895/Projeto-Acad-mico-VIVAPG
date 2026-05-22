package br.edu.fatecpg.vivapg.controller;

import br.edu.fatecpg.vivapg.service.FavoritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;

    @GetMapping
    public ResponseEntity<?> listar(Authentication auth) {
        String usuarioId = (String) auth.getPrincipal();
        return ResponseEntity.ok(favoritoService.listar(usuarioId));
    }

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Map<String, String> body, Authentication auth) {
        try {
            String usuarioId = (String) auth.getPrincipal();
            return ResponseEntity.ok(favoritoService.salvar(usuarioId, body.get("bairroId")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{bairroId}")
    public ResponseEntity<?> remover(@PathVariable String bairroId, Authentication auth) {
        String usuarioId = (String) auth.getPrincipal();
        favoritoService.remover(usuarioId, bairroId);
        return ResponseEntity.ok(Map.of("mensagem", "Favorito removido"));
    }
}
